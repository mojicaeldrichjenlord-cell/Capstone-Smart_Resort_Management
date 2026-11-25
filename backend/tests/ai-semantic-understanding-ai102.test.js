const test=require("node:test");
const assert=require("node:assert/strict");
const {guestCountFromText,selectVerifiedPreviews,hasCompoundParty}=require("../controllers/ai/aiVerifiedPreview");
const {explicitGuestCount}=require("../controllers/ai/aiRecommendationIntake");
const {normalizeSemanticIntent,canUseSimpleRecommendation}=require("../controllers/ai/aiSemanticIntent");
const cases=[
 ["Anong room ang maganda para sa dalawang tao?",2],
 ["Magandang kwarto para sa tatlong bisita",3],
 ["Dalawa lang po kami",2],["Kaming dalawa lang",2],["We're a couple",2],
 ["Room for 2 nights",0],["Room for two nights",0],["Room for 2,000 pesos",0],
 ["Room for 2 guests",2],["Room for three guests",3],["Room for a couple",2],
 ["Sampung tao",10],["Room for 5 days",0],["Room good for four rooms",0],
 ["We're a couple with three children",0],["2 adults and 3 children",0],
];
for(const [message,expected] of cases)test("guest intent: "+message,()=>{
 assert.equal(guestCountFromText(message),expected);
 assert.equal(explicitGuestCount(message),expected);
});
test("recommend only current listed room records that fit two guests",()=>{
 const rows=[
 {id:1,room_name:"Single Room A",category_name:"Rooms",capacity:2,status:"available"},
 {id:2,room_name:"Family Room B",category_name:"Rooms",capacity:20,status:"available"},
 {id:3,room_name:"Pool Shade",category_name:"Cottage",capacity:4,status:"available"},
 {id:4,room_name:"Small Room",category_name:"Room",capacity:1,status:"available"},
 {id:5,room_name:"Single Room D",category_name:"Room",capacity:2,status:"maintenance"},
 ];
 const result=selectVerifiedPreviews(rows,cases[0][0],[],{});
 assert.equal(result.requestedGuests,2);
 assert.deepEqual(result.rows.map(r=>r.id),[1,2]);
});
test("semantic output cannot fabricate room ID or skip constraints",()=>{
 const intent=normalizeSemanticIntent({scope:"resort",intent:"ask_recommendation",recommendation_category:"room",guests:5,room_id:999,simple_recommendation:true});
 assert.equal(intent.room_id,null);
 assert.equal(intent.guests,5);
 assert.equal(canUseSimpleRecommendation(intent),true);
 assert.equal(canUseSimpleRecommendation({...intent,max_price:2500}),false);
 assert.equal(canUseSimpleRecommendation(intent,{check_in:"2026-12-20"}),false);
 assert.equal(canUseSimpleRecommendation({...intent,scope:"unrelated"}),false);
 assert.equal(normalizeSemanticIntent({...intent,guests:201}).guests,null);
 assert.equal(normalizeSemanticIntent({...intent,guests:true}).guests,null);
});
