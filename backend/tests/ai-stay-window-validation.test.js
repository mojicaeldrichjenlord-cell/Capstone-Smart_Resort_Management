// Stage 85-C: pure booking-window boundary checks. No Gemini, MySQL,
// customer record changes or external provider requests.
const assert = require("node:assert/strict");
const { test } = require("node:test");
const { validDate, validTime, validateAiStayWindow,
  calendarDayDifference, addCalendarDays } = require("../controllers/ai/resortStayWindow");

const TODAY = "2026-11-10";
const windowFor = (check_in, check_out, check_in_time="07:00:00", check_out_time="17:00:00") =>
  ({ check_in, check_out, check_in_time, check_out_time });

test("Only real YYYY-MM-DD dates are valid", () => {
  for (const bad of ["2099-02-30", "2099-02-29", "2099-04-31",
    "2099-13-02", "2099-00-02", "2099-01-00", "2099-1-01", "hello"]) {
    assert.equal(validDate(bad), false, bad);
  }
  assert.equal(validDate("2028-02-29"), true); // valid leap day
  assert.equal(validDate("2100-02-29"), false); // century exception
  assert.equal(validDate("2099-12-31"), true);
});

test("Only strict 24-hour HH:MM:SS time values are valid", () => {
  assert.equal(validTime("07:00:00"), true);
  assert.equal(validTime("23:59:59"), true);
  for(const bad of ["24:00:00","12:60:00","12:00:60","7:00","07:00","7:00:00","noon"]){
    assert.equal(validTime(bad), false, bad);
  }
});

test("Exact past year remains invalid instead of being silently shifted to next year", () => {
  const r=validateAiStayWindow(windowFor("2025-11-10", "2025-11-11"),TODAY);
  assert.equal(r.valid,false);
  assert.equal(r.reason,"PAST_DATE");
});

test("Impossible dates are rejected before any availability SQL check", () => {
  const r=validateAiStayWindow(windowFor("2099-02-30", "2099-03-01"),TODAY);
  assert.equal(r.valid,false);
  assert.equal(r.reason,"INVALID_DATE_TIME");
});

test("Reversed same-day time is rejected; valid day-tour stays allowed", () => {
  assert.equal(validateAiStayWindow(windowFor("2099-04-10","2099-04-10","17:00:00","07:00:00"),TODAY).reason, "INVALID_ORDER");
  assert.equal(validateAiStayWindow(windowFor("2099-04-10","2099-04-10","07:00:00","17:00:00"),TODAY).valid, true);
});

test("Future overnight stays cross calendar days without relying on server timezone", () => {
  assert.equal(validateAiStayWindow(windowFor("2099-04-10","2099-04-11","19:00:00","05:00:00"),TODAY).valid,true);
  assert.equal(calendarDayDifference("2099-04-10","2099-04-11"),1);
  assert.equal(calendarDayDifference("2099-04-10","2099-04-10"),0);
});

test("Alternative day suggestions use calendar days across leap year and months", () => {
  assert.equal(addCalendarDays("2028-02-28",1),"2028-02-29");
  assert.equal(addCalendarDays("2028-02-29",1),"2028-03-01");
  assert.equal(addCalendarDays("2026-12-31",1),"2027-01-01");
  assert.equal(addCalendarDays("2099-04-10",1),"2099-04-11");
});

test("Bad or missing resort-local today fails closed", () => {
  assert.equal(validateAiStayWindow(windowFor("2099-04-10","2099-04-11"),"not-a-date").reason,"RESORT_DATE_UNAVAILABLE");
});
