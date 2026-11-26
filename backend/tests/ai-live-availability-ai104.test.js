const test=require("node:test");
const assert=require("node:assert/strict");
const {scheduleTurn,liveAvailability,validDate}=require("../controllers/ai/aiLiveAvailability");
const {selectVerifiedPreviews,verifiedPreviewReply}=require("../controllers/ai/aiVerifiedPreview");
const catalog=[
 {id:1,room_name:"Single Room A",category_name:"Room",capacity:4,status:"available",day_price:3000,overnight_price:3000,extended_price:5000},
 {id:2,room_name:"Single Room B",category_name:"Room",capacity:4,status:"available",day_price:3000,overnight_price:3000,extended_price:5000},
 {id:3,room_name:"Family Room B",category_name:"Room",capacity:20,status:"available",day_price:8000,overnight_price:8000,extended_price:15000},
];
function fixture(){
 const calls=[];
 const handler=async(req,res)=>{
  const q=req.body;calls.push(q);
  if(q.accommodation_id===1&&q.check_in_date==="2026-12-05"&&q.slot_type==="night")return res.status(200).json({available:false});
  return res.status(200).json({available:true,schedule:{check_in_date:q.check_in_date,check_in_time:"07:00:00",check_out_date:q.check_in_date,check_out_time:"17:00:00"}});
 };
 return {calls,run:(message,context={},extracted={},h=handler)=>liveAvailability({message,context,extracted,catalog:[...catalog],today:"2026-11-26",language:"taglish",handler:h})};
}
test("guest-specific hospitality wording",()=>{
 const result=selectVerifiedPreviews(catalog,"Anong room ang maganda para sa dalawang tao?",[],{});
 assert.match(verifiedPreviewReply(result,"taglish"),/inyong dalawa/);
});
test("exact named room checked using the existing booking endpoint contract",async()=>{
 const {run,calls}=fixture();
 const r=await run("Available ba Family Room B sa December 5 overnight?",{},{check_in:"2026-12-05",slot_preference:"night"});
 assert.equal(r.recommendation_cards[0].id,3);
 assert.equal(r.recommendation_cards[0].availability_verified,true);
 assert.deepEqual(calls[0],{mode:"add",accommodation_id:3,slot_type:"night",check_in_date:"2026-12-05",stay_duration:1});
});
test("unavailable named room, alternative and schedule correction",async()=>{
 const {run}=fixture();
 const r=await run("Single Room A available sa 2026-12-05 overnight? Dalawa lang kami");
 assert.equal(r.recommendation_cards[0].availability_status,"unavailable");
 assert.ok(r.recommendation_cards.some(c=>c.id===2&&c.availability_verified));
 const next=await run("Morning na lang",r.extracted_context,{slot_preference:"day_tour"});
 assert.equal(next.recommendation_cards[0].id,1);
 assert.equal(next.recommendation_cards[0].booking_selection.slot_type,"day_tour");
 assert.equal(next.recommendation_cards[0].booking_selection.check_in,"2026-12-05");
});
test("advance booking policy and clarification run no slot checks",async()=>{
 const {run,calls}=fixture();
 const early=await run("Available ba bukas overnight?",{room_id:1});
 assert.match(early.reply,/2026-11-28/);
 const incomplete=await run("Single Room A sa 2026-12-05");
 assert.match(incomplete.reply,/overnight/i);
 assert.equal(calls.length,0);
 const r=await run("Overnight sana",incomplete.extracted_context);
 assert.equal(r.recommendation_cards[0].booking_selection.check_in,"2026-12-05");
});
test("extended stay keeps its preference while clarifying day or night",async()=>{
 const {run}=fixture();
 const first=await run("Family Room B 2026-12-05 22 hours");
 assert.match(first.reply,/extended stay/i);
 const second=await run("Morning",first.extracted_context);
 assert.equal(second.recommendation_cards[0].booking_selection.slot_type,"day_extended");
});
test("availability API failure never marks a listing available",async()=>{
 const {run}=fixture();
 const r=await run("Family Room B sa 2026-12-05 overnight",{},{},async()=>{throw Error("db");});
 assert.ok(r.recommendation_cards.every(c=>!c.availability_verified));
 assert.match(r.reply,/Hindi ko/);
});
test("ordinary rate inquiry bypasses availability workflow",()=>{
 assert.equal(scheduleTurn("Magkano overnight ng Family Room B?",{availability_pending:true}),false);
 assert.equal(validDate("2026-02-30"),false);
});

test("AI-108: guest correction reuses date and slot and discards stale small room",async()=>{
 const {run,calls}=fixture();
 const context={intent:"ask_availability",availability_pending:true,guests:2,room_id:2,room_name:"Single Room B",recommendation_category:"room",check_in:"2026-12-05",slot_preference:"night",stay_duration:1};
 const message="Ay sorry, anim pala kami. May mas suitable ba na room para sa amin?";
 assert.equal(scheduleTurn(message,context),true);
 const result=await run(message,context,{scope:"resort",intent:"ask_recommendation",guests:6,room_name:"Single Room B"});
 assert.equal(result.extracted_context.guests,6);
 assert.equal(result.recommendation_cards.length,1);
 assert.equal(result.recommendation_cards[0].id,3);
 assert.equal(result.recommendation_cards[0].availability_verified,true);
 assert.equal(result.recommendation_cards[0].booking_selection.guests,6);
 assert.deepEqual(calls,[{mode:"add",accommodation_id:3,slot_type:"night",check_in_date:"2026-12-05",stay_duration:1}]);
});
test("AI-108: short corrections are checked, ordinary price or policy questions are not",()=>{
 const context={intent:"ask_availability",availability_pending:true,guests:2,check_in:"2026-12-05",slot_preference:"night",recommendation_category:"room"};
 assert.equal(scheduleTurn("6 pala kami",context),true);
 assert.equal(scheduleTurn("Magkano para sa 6 guests?",context),false);
 assert.equal(scheduleTurn("May parking ba para sa 6 guests?",context),false);
 assert.equal(scheduleTurn("6 guests",{}),false);
});

test("AI-109: cheaper follow-up retains room scope, saved group and verified slot",async()=>{
 const {matchRoomPriceFollowup}=require("../controllers/ai/aiRoomPriceFollowup");
 const rows=[
  {id:11,room_name:"Double Room 1",category_name:"Room",capacity:7,status:"available",overnight_price:4000},
  {id:12,room_name:"Family Room A",category_name:"Room",capacity:7,status:"available",overnight_price:3500},
  {id:13,room_name:"Small Nipa Hut",category_name:"Cottage",capacity:8,status:"available",overnight_price:800},
  {id:14,room_name:"Single Room",category_name:"Room",capacity:4,status:"available",overnight_price:2000},
 ];
 const context={intent:"ask_availability",availability_pending:true,guests:6,recommendation_category:"room",check_in:"2026-12-05",slot_preference:"night",stay_duration:1,last_verified_room_ids:[11]};
 const message="Wala na bang mas mura diyan?";
 const cheaper=matchRoomPriceFollowup(message,[],context);
 assert.equal(cheaper.scope,"room");
 const calls=[];
 const handler=async(req,res)=>{calls.push(req.body);return res.json({available:true,schedule:{check_out_date:"2026-12-06"}});};
 const run=ctx=>liveAvailability({message,context:ctx,catalog:rows,today:"2026-11-26",language:"taglish",handler,cheaper});
 const result=await run(context);
 assert.deepEqual(result.recommendation_cards.map(c=>c.id),[12]);
 assert.deepEqual(calls,[{mode:"add",accommodation_id:12,slot_type:"night",check_in_date:"2026-12-05",stay_duration:1}]);
 assert.equal(result.recommendation_cards[0].booking_selection.guests,6);
 const none=await run({...context,last_verified_room_ids:[11,12]});
 assert.equal(none.recommendation_cards.length,0);
 assert.match(none.reply,/Wala po akong nakitang mas murang/);
 assert.equal(calls.length,1);
});
