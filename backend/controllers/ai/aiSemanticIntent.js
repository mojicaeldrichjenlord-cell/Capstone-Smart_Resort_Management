"use strict";
// Interpretation only: no model-generated DB IDs, policies, rates or availability.
const intents=new Set(["ask_recommendation","ask_availability","ask_alternative_dates","ask_price","ask_booking_help","general_question"]);
const categories=new Set(["room","single","double","family","single_poolside","single_cottage","cottage","shade","pool_shade","big_shade","small_shade","nipa_hut","big_nipa","small_nipa","function"]);
const scopes=new Set(["resort","unrelated","unclear"]);
function normalizeSemanticIntent(value) {
  if(!value||typeof value!=="object"||Array.isArray(value))return {};
  const count=(typeof value.guests==="number"||typeof value.guests==="string")?Number(value.guests):NaN;
  return {...value,scope:scopes.has(value.scope)?value.scope:"unclear",
    intent:intents.has(value.intent)?value.intent:null,
    recommendation_category:categories.has(value.recommendation_category)?value.recommendation_category:null,
    guests:Number.isSafeInteger(count)&&count>=1&&count<=200?count:null,
    room_id:null,simple_recommendation:value.simple_recommendation===true};
}
function canUseSimpleRecommendation(extracted={},context={}) {
  return extracted.scope==="resort"&&extracted.intent==="ask_recommendation"&&
    Boolean(extracted.recommendation_category&&extracted.guests&&extracted.simple_recommendation)&&
    ![extracted,context].some(c=>c.check_in||c.check_out||c.check_in_time||c.check_out_time||
      c.max_price||c.bed_count||c.view_type||c.aircon_type||c.bed_type||c.room_name||c.wants_booking===true);
}
module.exports={normalizeSemanticIntent,canUseSimpleRecommendation};
