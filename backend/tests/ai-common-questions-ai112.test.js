"use strict";
const test = require("node:test");
const assert = require("node:assert/strict");
const {requestedAmenities, amenityEvidence, amenityReply, multiAmenityReply, resolveAmenityTarget} = require("../controllers/ai/aiAccommodationAmenities");
const {isNaturalRoomDetailsQuestion, naturalRoomDetailsReply} = require("../controllers/ai/aiNaturalRoomDetails");
const {verifiedFreeEntranceReply} = require("../controllers/ai/aiAccommodationEntrance");
const knowledge = require("../controllers/ai/resortInquiryKnowledge");
const policy = require("../controllers/ai/resortPolicyKnowledge");

// Synthetic fixtures only: no claim about actual production inventory.
const room = {id:1,room_name:"Single Room Cottage 1",category_name:"Room",amenities:"Private CR\nAir Conditioner\nRefrigerator\nTV\nTable\n2 Queen-Size Beds (1 per bedroom)",free_entrance_pax:3};
const cottage = {id:2,room_name:"Small Nipa Hut 3",category_name:"Cottage",amenities:""};
const other = {...cottage,id:3,room_name:"Small Nipa Hut 30"};
for (const [q,kind] of [
 ["May aircon ba?","aircon"],["Does it have air conditioning?","aircon"],["May AC ba ito?","aircon"],
 ["May sariling CR ba?","private_cr"],["Is there a private bathroom?","private_cr"],["May toilet ba?","cr"],
 ["May ref ba?","ref"],["Does it have a fridge?","ref"],["May refrigerator ba?","ref"],
 ["May TV ba?","tv"],["Does it have a television?","tv"],["May telebisyon ba?","tv"],
 ["May lamesa ba?","table"],["May table ba?","table"],["Does it have a dining table?","table"],
 ["May kusina ba?","kitchen"],["May sala ba?","living_room"],["May aparador ba?","cabinet"],
 ["May karaoke ba?","karaoke"],["May monoblock chairs ba?","monoblock"],
 ["Ilang kama meron diyan at anong size ng mga kama?","beds"],["How many beds are there?","beds"],
 ["What is the sleeping arrangement?","beds"],["What is the bed size?","beds"],["May queen-size bed ba?","beds"]
]) test("Recognize: "+q,()=>assert.ok(requestedAmenities(q).includes(kind)));
test("Three amenities in one turn",()=>assert.deepEqual(requestedAmenities("May aircon, sariling CR at refrigerator ba?"),["private_cr","aircon","ref"]));
test("Room Cottage is not an ordinary Cottage",()=>assert.equal(amenityEvidence(room,"aircon"),"yes"));
test("Cottage does not inherit room amenities",()=>assert.equal(amenityEvidence(cottage,"aircon"),"none_included"));
test("Missing room data remains unknown",()=>assert.equal(amenityEvidence({...room,amenities:""},"aircon"),"unknown"));
test("Generic CR does not prove privacy",()=>assert.equal(amenityEvidence({...room,amenities:"CR"},"private_cr"),"listed_unspecified"));
test("Explicitly absent refrigerator is not present",()=>assert.equal(amenityEvidence({...room,amenities:"No refrigerator"},"ref"),"no"));
test("Conflicting aircon records remain unknown",()=>assert.equal(amenityEvidence({...room,amenities:"Aircon",description:"No aircon"},"aircon"),"unknown"));
test("Exact named accommodation wins; 3 is not 30",()=>assert.equal(resolveAmenityTarget([room,cottage,other],"May aircon ang Small Nipa Hut 3?").record.id,2));
test("Two named accommodations are ambiguous",()=>assert.equal(resolveAmenityTarget([room,cottage],"Compare Single Room Cottage 1 and Small Nipa Hut 3").ambiguous,true));
test("Bed configuration is taken from data",()=>assert.match(amenityReply(room,"beds","Ilang kama?","taglish"),/2 Queen-Size Beds \(1 per bedroom\)/));
test("Bedroom count alone does not establish beds",()=>assert.match(amenityReply({...room,amenities:"2 bedrooms"},"beds","Ilang kama?","taglish"),/Hindi pa/));
test("Fresh admin edit replaces earlier bed detail",()=>assert.match(amenityReply({...room,amenities:"1 King-Size Bed"},"beds","Ilang kama?","taglish"),/1 King-Size Bed/));
test("Multi-feature response includes requested bed details and TV",()=>assert.match(multiAmenityReply(room,["beds","tv"],"taglish"),/2 Queen-Size Beds[\s\S]*TV/));
test("Broad Tagalog amenities question",()=>assert.equal(isNaturalRoomDetailsQuestion("Ano-ano ang amenities at inclusions ng Family Room A?"),true));
test("Broad English amenities question",()=>assert.equal(isNaturalRoomDetailsQuestion("What are the amenities?"),true));
test("Full amenities reply includes explicit bed detail and free entrance",()=>{const reply=naturalRoomDetailsReply(room,"taglish");assert.match(reply,/2 queen-size beds/i);assert.match(reply,/3 pax/);});
test("Free entrance uses stored quantity",()=>assert.match(verifiedFreeEntranceReply(room,"taglish"),/3 pax/));
test("Missing entrance quantity is not zero",()=>assert.match(verifiedFreeEntranceReply({...room,free_entrance_pax:null},"taglish"),/Hindi pa/));
for(const [question,language,expected] of [
 ["Pwede magdala ng aso?","taglish",/Bawal/],["Can I bring my dog?","english",/not allowed/],
 ["¿Puedo llevar mascotas?","spanish",/no se permiten/],["可以带宠物吗？","mandarin",/禁止/],
 ["Pwede magdala og iro?","bisaya",/bawal/]
])test("Pet policy: "+question,()=>{const m=knowledge.matchVerifiedPetPolicy(question);assert.ok(m);assert.match(knowledge.verifiedPetPolicyReply(m,language),expected);});
for(const [question,expected] of [
 ["May free Wi-Fi ba?","wifi"],["May Wi-Fi ba sa cottages?","wifi"],
 ["Pwede ba magdala ng pagkain?","food"],["Open ba ang swimming pool?","pool"]
])test("Guest policy: "+question,()=>assert.equal(knowledge.matchVerifiedGuestAmenities(question)?.[expected],true));
test("Parking FAQ is free",()=>assert.match(knowledge.getResortInquiryReply(knowledge.matchResortInquiry("May parking ba?"),"taglish"),/free parking/i));
test("Refund is not a guaranteed automated payment reversal",()=>assert.equal(policy.matchGeneralPolicyQuestion("Can I request a refund?"),"refund"));
test("Walk-in policy recognized",()=>assert.equal(policy.matchGeneralPolicyQuestion("Pwede ba walk-in?"),"walkin"));
test("Check-in schedule policy recognized",()=>assert.equal(policy.matchGeneralPolicyQuestion("What are the check-in times?"),"schedule"));
