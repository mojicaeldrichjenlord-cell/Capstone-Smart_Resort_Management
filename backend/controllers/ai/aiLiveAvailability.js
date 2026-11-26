"use strict";
const {categoryMatches,findExactNamedRoom,requestedCategory,guestCountFromText}=require("./aiVerifiedPreview");
const {verifiedAccommodationCards}=require("./aiConversationStyle");
const {explicitGuestCount,correctedGuestCount,isPersonalizedRecommendation}=require("./aiRecommendationIntake");
const slots=["day_tour","night","day_extended","night_extended"];
const names={day_tour:"Day Tour",night:"Overnight",day_extended:"Day Extended",night_extended:"Night Extended"};
const datePattern=/^\d{4}-\d{2}-\d{2}$/;
function validDate(value){
 if(typeof value!=="string"||!datePattern.test(value))return false;
 const date=new Date(value+"T00:00:00Z");
 return Number.isFinite(date.getTime())&&date.toISOString().slice(0,10)===value;
}
function plusDays(date,days){const d=new Date(date+"T00:00:00Z");d.setUTCDate(d.getUTCDate()+days);return d.toISOString().slice(0,10);}
// AI-108: a revised party size is a new availability search when a fixed
// date/slot is already known. Never route standalone prices or policies here.
function scheduleGuestChange(message,context={},semantic={}){
 const q=String(message||"");
 if(!validDate(context.check_in)||!slots.includes(context.slot_preference)||
    !(context.availability_pending===true||["ask_availability","ask_recommendation"].includes(context.intent)))return 0;
 if(context.max_price||/₱|\b(?:budget|cheaper|mas mura|under|below|price|rate|magkano|presyo|amenit(?:y|ies)|kitchen|aircon|wifi|parking|payment|entrance|discount|deposit|refund)\b/i.test(q))return 0;
 const normalized=q.replace(/\bpala\s+(?=(?:po\s+)?(?:kami|kaming|tayo|tao|guests?|pax|people)\b)/gi,"");
 const direct=explicitGuestCount(normalized)||correctedGuestCount(q);
 const inferred=semantic.scope==="resort"&&semantic.intent==="ask_recommendation"?Number(semantic.guests):0;
 const count=direct||inferred;
 if(!Number.isSafeInteger(count)||count<1||count>200||count===Number(context.guests))return 0;
 if(!isPersonalizedRecommendation(q)&&!requestedCategory(q)&&!correctedGuestCount(q)&&!direct)return 0;
 return count;
}
function scheduleTurn(message,context={},semantic={}){
 const q=String(message||"");
 const related=Boolean(requestedCategory(q)||context.room_id||context.room_name||context.recommendation_category||/\b(?:accommodation|room|kwarto|kuwarto|cottage|pavilion|booking|reservation|slot)\b/i.test(q));
 const dateOrSlot=/\b(?:today|tomorrow|tonight|bukas|mamaya|ngayon|monday|tuesday|wednesday|thursday|friday|saturday|sunday|lunes|martes|miyerkules|huwebes|biyernes|sabado|linggo|jan(?:uary)?|feb(?:ruary)?|mar(?:ch)?|apr(?:il)?|may\s+\d|jun(?:e)?|jul(?:y)?|aug(?:ust)?|sep(?:tember)?|oct(?:ober)?|nov(?:ember)?|dec(?:ember)?|overnight|day\s*tour|night|morning|umaga|gabi|extended|(?:22|23)\s*(?:h|hours?|oras)|\d{4}-\d{2}-\d{2})\b/i.test(q);
 const availability=/\b(?:available|availability|vacant|reserved|occupied|free slot|bakante|libre pa|may slot|kailan|kanus-a|puno)\b/i.test(q);
 const informationOnly=/\b(?:magkano|presyo|how much|price|rate|amenit(?:y|ies)|inclusions?|aircon|private cr|wifi|parking|entrance fee|downpayment|payment)\b/i.test(q);
 if(informationOnly&&!availability)return false;
 if(scheduleGuestChange(q,context,semantic))return true;
 return semantic.intent==="ask_availability"||semantic.intent==="ask_alternative_dates"||
   (related&&(availability||dateOrSlot)&&(dateOrSlot||availability&&/\b(?:pa|ba|is|still|slot|date|when|kailan|bakante|vacant)\b/i.test(q)))||
   (context.availability_pending===true&&/\b(?:book|reserve|reservation|ipa[- ]?reserve|i[- ]?book)\b/i.test(q)&&!informationOnly)||
   (context.availability_pending===true&&(/^(?:\d{1,3}\s*(?:kami|pax|guests?|tao)?|day tour|overnight|night|umaga|gabi)[?!.\s]*$/i.test(q)||dateOrSlot||availability||guestCountFromText(q)>0));
}
function getSlot(message,extracted,context){
 const q=String(message||"");
 if(/\b(?:22|23)\s*(?:h|hours?|oras)\b|\bextended(?:\s+stay)?\b/i.test(q)){
   if(/\b(?:night|evening|overnight|gabi)\b/i.test(q))return "night_extended";
   if(/\b(?:day|morning|umaga)\b/i.test(q))return "day_extended";
   return null;
 }
 if(/\b(?:overnight|night|evening|gabi)\b/i.test(q))return context.extended_pending===true?"night_extended":"night";
 if(/\b(?:day\s*tour|morning|umaga)\b/i.test(q))return context.extended_pending===true&&!/\bday\s*tour\b/i.test(q)?"day_extended":"day_tour";
 if(slots.includes(extracted.slot_preference))return extracted.slot_preference;
 return slots.includes(context.slot_preference)?context.slot_preference:null;
}
async function checkOne(handler,room,date,slot,duration){
 let code=200,data;
 try { await handler({body:{mode:"add",accommodation_id:Number(room.id),slot_type:slot,check_in_date:date,stay_duration:duration}},{status(n){code=n;return this;},json(v){data=v;return this;}}); } catch (_) { return {status:"unknown"}; }
 if(code!==200||typeof data?.available!=="boolean"||(data.available===true&&!data.schedule))return {status:"unknown"};
 return {status:data.available?"available":"unavailable",schedule:data.schedule||null};
}
async function liveAvailability({message,context={},extracted={},catalog=[],today,language,handler,cheaper=null}){
 const tl=["tagalog","taglish"].includes(language);
 const say=(en,ph)=>tl?ph:en;
 const q=String(message||"");
 const direct= q.match(/\b\d{4}-\d{2}-\d{2}\b/)?.[0];
 const date=direct||(/\b(?:tomorrow|bukas)\b/i.test(q)?plusDays(today,1):/\b(?:today|ngayon)\b/i.test(q)?today:extracted.check_in||context.check_in);
 const slot=getSlot(q,extracted,context);
 const changedGuests=scheduleGuestChange(q,context,extracted);
 const guests=Number(cheaper?.guests)||changedGuests||guestCountFromText(q)||Number(extracted.guests||context.guests)||0;
 const explicit=findExactNamedRoom(catalog,q);
 const newCategory=requestedCategory(q)||(!changedGuests?extracted.recommendation_category:null);
 const interpretedName=findExactNamedRoom(catalog,String(extracted.room_name||""));
 const changing=/\b(?:other|another|ibang|alternative|instead|hindi)\b/i.test(q);
 const exact=cheaper?null:explicit||(!changedGuests&&!changing&&interpretedName&&(!newCategory||categoryMatches(interpretedName,newCategory))&&(!requestedCategory(q)||String(interpretedName.room_name)!==String(context.room_name))?interpretedName:null)||(!changedGuests&&!requestedCategory(q)&&!changing?catalog.find(r=>Number(r.id)===Number(context.room_id))||findExactNamedRoom(catalog,String(context.room_name||"")):null);
 const previousRoom=changedGuests?(catalog.find(r=>Number(r.id)===Number(context.room_id))||findExactNamedRoom(catalog,String(context.room_name||""))):null;
 const previousCategory=previousRoom?requestedCategory(previousRoom.category_name)||requestedCategory(previousRoom.room_name):null;
 const category=cheaper?.scope||newCategory||context.recommendation_category||previousCategory||null;
 const duration=Number(extracted.stay_duration||((slot&&slot!==context.slot_preference)?1:context.stay_duration)||1);
 const extendedPending=!slot&&(/\b(?:22|23)\s*(?:h|hours?|oras)\b|\bextended(?:\s+stay)?\b/i.test(q)||context.extended_pending===true);
 const next={...context,availability_pending:true,extended_pending:extendedPending,check_in:date||null,check_out:null,check_in_time:null,check_out_time:null,slot_preference:slot,stay_duration:duration,guests:guests||null,room_id:exact?Number(exact.id):null,room_name:exact?exact.room_name:null,recommendation_category:category,intent:"ask_availability",language_style:language};
 const result=(reply,cards=[],alternatives=[])=>({success:true,mode:"verified_live_availability",reply,extracted_context:next,matched_rooms:[],catalog_recommendations:[],alternative_dates:alternatives,booking_preview:null,recommendation_cards:cards});
 if(!exact&&!category)return result(say("Which accommodation would you like me to check?","Anong room o accommodation po ang gusto ninyong ipa-check?"));
 if(!date||!validDate(date))return result(say("What date are you planning to visit?","Anong date po ang plan ninyong pumunta?"));
 const earliest=plusDays(today,2);
 if(date<earliest)return result(say("Online reservations need two days' advance notice. The earliest online date is "+earliest+". Would that work for you?","At least 2 days ahead po ang online booking. Earliest date po ay "+earliest+". Okay po ba sa inyo iyon?"));
 if(!slot)return result(extendedPending?say("For the extended stay, would you prefer a morning or evening check-in?","Para sa extended stay, morning o evening check-in po ang gusto ninyo?"):say("Would you prefer Day Tour, Overnight, or a day/night extended stay?","Day tour, overnight, o day/night extended stay po ang gusto ninyo?"));
 if(!Number.isInteger(duration)||duration<1||duration>5||(!slot.endsWith("extended")&&duration!==1))return result(say("Extended stays can be 1–5 days; regular slots are one day/night. Which duration would you like?","1–5 days po ang extended stay, at isang araw/gabi lang ang regular slot. Ilang days po ang gusto ninyo?"));
 if(extracted.check_in_time||extracted.check_out_time)return result(say("We use fixed schedules rather than custom check-in or checkout times. Would you like me to check the fixed "+names[slot]+" slot?","Fixed schedules po tayo, hindi custom check-in o checkout time. I-check ko po ba ang fixed "+names[slot]+" slot?"));
 const rateFor=r=>Number(slot==="day_tour"?r.day_price:slot==="night"?r.overnight_price:r.extended_price);
 let candidates=exact?[exact]:catalog.filter(r=>categoryMatches(r,category)&&(!guests||Number(r.capacity)>=guests));
 // Compare against the lowest preceding verified card or selected room.
 // Read the current catalog rate, not a client-supplied price.
 const previousIds=Array.isArray(context.last_verified_room_ids)?context.last_verified_room_ids.slice(0,3).map(Number):[];
 const baselineIds=Number(context.room_id)>0?[Number(context.room_id)]:previousIds;
 // A guest-approved category change still compares to the previous category.
 const priorRates=catalog.filter(r=>baselineIds.includes(Number(r.id))&&(!guests||Number(r.capacity)>=guests)).map(rateFor).filter(n=>Number.isFinite(n)&&n>0);
 const baseline=cheaper&&priorRates.length?Math.min(...priorRates):null;
 if(cheaper)candidates=candidates.filter(r=>String(r.status).trim().toLowerCase()==="available"&&rateFor(r)>0&&(baseline===null||rateFor(r)<baseline));
 candidates=candidates.sort((a,b)=>cheaper?rateFor(a)-rateFor(b)||Number(a.capacity)-Number(b.capacity)||Number(a.id)-Number(b.id):Number(a.capacity)-Number(b.capacity)||(rateFor(a)||Infinity)-(rateFor(b)||Infinity)||Number(a.id)-Number(b.id));
 const limit=12,checked=[];
 for(const room of candidates.slice(0,limit)){
   const rate=Number(slot==="day_tour"?room.day_price:slot==="night"?room.overnight_price:room.extended_price);
   if(String(room.status).toLowerCase()!=="available"){checked.push({room,status:"unavailable",rate});continue;}
   if(!(rate>0)){checked.push({room,status:"unknown",rate});continue;}
   const outcome=await checkOne(handler,room,date,slot,duration);
   checked.push({room,rate,...outcome});
   if(!exact&&checked.filter(r=>r.status==="available").length>=3)break;
 }
 const yes=checked.filter(r=>r.status==="available");
 if(!cheaper||yes.length)next.last_verified_room_ids=yes.map(r=>Number(r.room.id));
 const no=checked.filter(r=>r.status==="unavailable");
 const unknown=checked.some(r=>r.status==="unknown");
 const card=(item,checkDate=date)=>{
   const base=verifiedAccommodationCards([{...item.room,status:"available"}],false)[0];
   if(!base)return null;
   return {...base,availability_verified:item.status==="available",availability_status:item.status,checked_at:new Date().toISOString(),booking_selection:{check_in:checkDate,slot_type:slot,stay_duration:duration,guests:guests||null,check_out:item.schedule?.check_out_date||null,check_in_time:item.schedule?.check_in_time||null,check_out_time:item.schedule?.check_out_time||null},selected_rate:item.rate>0?item.rate:null};
 };
 if(yes.length){
   const cards=yes.map(r=>card(r)).filter(Boolean);
   if(yes.length===1){next.room_id=Number(yes[0].room.id);next.room_name=yes[0].room.room_name;}
   const name=exact?exact.room_name:yes.length===1?yes[0].room.room_name:null;
   if(cheaper){
     const group=guests?guests+" guests":"your group";
     const heading=baseline===null?say("I couldn't confirm the previous rate for comparison, but these are affordable options I checked for "+group+".","Hindi ko po ma-confirm ang naunang rate para maikumpara, pero ito ang mga abot-kayang options na na-check ko para sa "+group+"."):say("I found cheaper available options for "+group+" than the previous lowest listed accommodation rate of ₱"+baseline.toLocaleString("en-PH")+".","May nahanap po akong mas murang available options para sa "+group+" kaysa sa naunang pinakamababang accommodation rate na ₱"+baseline.toLocaleString("en-PH")+".");
     return result(heading+" "+date+" ("+names[slot]+").",cards);
   }
   if(exact&&guests>Number(exact.capacity)&&Number(exact.capacity)>0)return result(say("The selected slot is available, but "+exact.room_name+" has a listed capacity of "+exact.capacity+" for your group of "+guests+". Would you like me to find a larger option?","Available po ang slot, pero "+exact.capacity+" pax ang listed capacity ng "+exact.room_name+" para sa "+guests+" guests ninyo. Hanapan ko po ba kayo ng mas malaking option?"),cards);
   return result(say("Good news! "+(name||"These options")+" "+(name?"is":"are")+" available for "+date+" ("+names[slot]+") at the time of checking. You can choose Book This to continue.","Good news po! Available pa "+(name?"ang "+name:"itong mga options")+" sa "+date+" ("+names[slot]+") noong chineck ko. Pwede po kayong mag-proceed sa booking."),cards);
 }
 if(exact&&no.length){
   const alternatives=[];
   const similar=catalog.filter(r=>Number(r.id)!==Number(exact.id)&&String(r.status).toLowerCase()==="available"&&(category?categoryMatches(r,category):String(r.category_name).toLowerCase()===String(exact.category_name).toLowerCase())&&(!guests||Number(r.capacity)>=guests)).sort((a,b)=>Number(a.capacity)-Number(b.capacity));
   for(const room of similar.slice(0,8)){
     const rate=Number(slot==="day_tour"?room.day_price:slot==="night"?room.overnight_price:room.extended_price);
     if(!(rate>0))continue;
     const outcome=await checkOne(handler,room,date,slot,duration);
     if(outcome.status==="available")alternatives.push(card({room,rate,...outcome}));
     if(alternatives.length>=2)break;
   }
   if(alternatives.length<2&&String(exact.status).toLowerCase()==="available"&&no[0].rate>0){
     for(let offset=1;offset<=3;offset++){
       const nextDate=plusDays(date,offset),outcome=await checkOne(handler,exact,nextDate,slot,duration);
       if(outcome.status==="available")alternatives.push(card({room:exact,rate:no[0].rate,...outcome},nextDate));
       if(alternatives.length>=2)break;
     }
   }
   return result(say("Sorry, "+exact.room_name+" is not available for "+date+" ("+names[slot]+"). "+(alternatives.length?"I found these alternative options.":"Would another date or slot work?"),"Sorry po, unavailable ang "+exact.room_name+" sa "+date+" ("+names[slot]+"). "+(alternatives.length?"May nakita akong alternative options para sa inyo.":"Okay po ba ang ibang date o time slot?")),[card(no[0]),...alternatives].filter(Boolean).slice(0,3));
 }
 if(cheaper){
   if(unknown)return result(say("I couldn't verify all lower-priced options for the same schedule. Please try again.","Hindi ko po na-verify lahat ng mas murang options sa parehong schedule. Try po natin ulit."));
   const limited=candidates.length>limit;
   return result(baseline!==null?say("I found no cheaper available option in the same category for "+guests+" guests "+(limited?"among the options checked ":"")+"on "+date+" ("+names[slot]+"). Would you consider another accommodation type?","Wala po akong nakitang mas murang available sa parehong accommodation type para sa "+guests+" guests "+(limited?"sa mga na-check ":"")+"sa "+date+" ("+names[slot]+"). Okay po ba sa inyo ang ibang accommodation type?"):say("I couldn't find a verified affordable option for the same category and schedule. Would another type work?","Wala po akong na-verify na affordable option sa parehong category at schedule. Okay po ba ang ibang accommodation type?"));
 }
 if(!candidates.length)return result(say("I couldn't find a matching accommodation. Would another type work?","Wala po akong nakitang tugmang accommodation. Okay po ba ang ibang type?"));
 return result(say(unknown?"I couldn't verify all the requested schedules. Please try again.":"No available match was found among the "+checked.length+" options checked. Would another date or slot work?",unknown?"Hindi ko po na-verify lahat ng schedule. Try po natin ulit.":"Wala po akong nakitang available sa "+checked.length+" options na na-check. Okay po ba ang ibang date o slot?"),no.slice(0,3).map(r=>card(r)).filter(Boolean));
}
module.exports={scheduleTurn,scheduleGuestChange,liveAvailability,validDate,checkOne,getSlot};
