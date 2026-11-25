const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
// Expose internal functions only in this isolated test VM, never in production.
const raw=fs.readFileSync(path.resolve(__dirname,"../../frontend/js/ai-voice.js"),"utf8");
const source=raw.replace('  document.addEventListener("DOMContentLoaded", init);',
 '  window.__voiceTest={state,startRecordedInput,transcribeRecording,speakReply,fallbackToBrowser,getReplay:()=>replayText};');
function make({micErrorName,code=200,token=true,browser=true,ttsError=false}={}) {
 let recognitions=0,recordRequests=0,speaks=0;const input={value:""};
 class Recognition{start(){recognitions++;this.onstart?.();}}
 class Context{state="running";resume(){return Promise.resolve();}close(){return Promise.resolve();}}
 class Utterance{constructor(text){this.text=text;}}
 const window={isSecureContext:true,navigator:{userAgent:"test",mediaDevices:{getUserMedia:async()=>{recordRequests++;throw Object.assign(new Error("device"),{name:micErrorName||"NotReadableError"});}}},AudioContext:Context,SpeechRecognition:browser?Recognition:undefined,SpeechSynthesisUtterance:Utterance,speechSynthesis:{cancel(){},getVoices(){return[];},speak(u){speaks++;if(ttsError)u.onerror?.();else u.onend?.();}}};
 const document={getElementById:()=>input,addEventListener(){}};
 const sessionStorage={getItem:()=>token?"signed-mock":null};
 const fetch=async()=>({ok:code===200,status:code,json:async()=>({success:code===200,transcript:"How much?"})});
 vm.runInNewContext(source,{window,document,sessionStorage,AbortController,fetch,setTimeout:()=>1,clearTimeout(){},console:{warn(){},error(){}}});
 return {t:window.__voiceTest,input,counts:()=>({recognitions,recordRequests,speaks})};
}
test("denied mic permission does not retry via another provider",async()=>{const a=make({micErrorName:"NotAllowedError"});await a.t.startRecordedInput("dictation");assert.equal(a.counts().recognitions,0);assert.equal(a.t.state.mode,"idle");});
test("recording failure uses browser fallback only once",async()=>{const a=make({micErrorName:"NotReadableError"});await a.t.startRecordedInput("dictation");assert.equal(a.counts().recognitions,1);assert.equal(a.t.fallbackToBrowser("dictation"),false);});
test("missing customer session does not request microphone",async()=>{const a=make({token:false});await a.t.startRecordedInput("dictation");assert.equal(a.counts().recordRequests,0);});
test("401 does not bypass signed transcription",async()=>{const a=make({code:401});await a.t.transcribeRecording({},"dictation",0,"");assert.equal(a.counts().recognitions,0);assert.equal(a.t.state.mode,"idle");});
test("rate limit permits one device fallback",async()=>{const a=make({code:429});await a.t.transcribeRecording({},"dictation",0,"");assert.equal(a.counts().recognitions,1);});
test("dictation preserves draft",async()=>{const a=make();await a.t.transcribeRecording({},"dictation",0,"Draft");assert.equal(a.input.value,"Draft How much?");});
test("playback failure exposes retry and does not report success",()=>{const a=make({ttsError:true});let ok;a.t.speakReply("Hello",v=>ok=v);assert.equal(ok,false);assert.equal(a.t.getReplay(),"Hello");});
test("successful playback ends normally",()=>{const a=make();let ok;a.t.speakReply("Hello",v=>ok=v);assert.equal(ok,true);assert.equal(a.counts().speaks,1);});
