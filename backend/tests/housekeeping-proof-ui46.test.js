"use strict";
// HK-46: Static UI and dependency boundary checks. No live DB or payments.
const test=require("node:test");
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const vm=require("node:vm");
const root=path.resolve(__dirname,"../..");
const read=p=>fs.readFileSync(path.join(root,p),"utf8");

const mgrHtml=read("frontend/managerHTML/managerHousekeeping.html");
const mgrJS=read("frontend/managerJS/managerHousekeeping.js");
const mgrCSS=read("frontend/managerCSS/managerHousekeeping-review.css");
const hkHtml=read("frontend/housekeepingHTML/housekeepingDashboard.html");
const hkJS=read("frontend/housekeepingJS/housekeepingTasks.js");
const hkCSS=read("frontend/housekeepingCSS/housekeepingProof.css");
const routes=read("backend/routes/housekeepingRoutes.js");
const mgrRoutes=read("backend/routes/managerRoutes.js");
const taskController=read("backend/controllers/housekeeping/housekeepingTasksController.js");
const proofController=read("backend/controllers/housekeeping/housekeepingProofController.js");

test("HK-46 Manager screen has resort logo, quick navigation, filtering and visible task counts",()=>{
  assert.match(mgrHtml, /src="\.\.\/images\/arvic-logo\.png"/);
  assert.match(mgrHtml, /id="hkTasksSection"/);
  assert.match(mgrHtml, /id="hkAssignSection"/);
  assert.match(mgrHtml, /id="hkManagerStatusFilter"/);
  for(const stat of ["hkCountNeeds","hkCountProgress","hkCountReview","hkCountVerified"])
    assert.match(mgrHtml,new RegExp('id="'+stat+'"'));
  assert.match(mgrCSS, /@media \(max-width: 760px\)/);
  assert.match(mgrCSS, /manager-task-table td::before/);
  assert.match(mgrJS, /statusFilter\.addEventListener\("change"/);
});
test("HK-46 Manager image must be signed and reviewed before a separate Verify Ready",()=>{
  assert.match(mgrHtml,/id="hkManagerProofDialog"/);
  assert.match(mgrHtml,/id="hkProofImage"/);
  assert.match(mgrJS,/Authorization:"Bearer " \+ token/);
  assert.match(mgrJS,/URL\.createObjectURL\(blob\)/);
  assert.match(mgrJS,/URL\.revokeObjectURL\(proofBlobUrl\)/);
  assert.match(mgrJS,/\/proof\/review/);
  assert.match(mgrJS,/\/verify/);
  assert.match(mgrJS,/View Proof & Verify/);
  assert.match(mgrJS,/Request Photo/);
  assert.doesNotMatch(mgrJS,/innerHTML|localStorage\.getItem\("user"\)/);
});
test("HK-46 Housekeeping can select camera photo and must upload before marking Cleaned",()=>{
  assert.match(hkHtml,/housekeepingProof\.css/);
  assert.match(hkJS,/capture", "environment"/);
  assert.match(hkJS,/image\/jpeg,image\/png,image\/webp/);
  assert.match(hkJS,/new FormData\(\)/);
  assert.match(hkJS,/\/proof"/);
  assert.match(hkJS,/task\.status === "in_progress" && task\.has_proof/);
  assert.match(hkJS,/prepareProofImage/);
  assert.match(hkCSS,/hk-proof-upload/);
  assert.doesNotMatch(hkJS,/innerHTML|localStorage\.getItem\("user"\)/);
});
test("HK-46 backend proof routes are protected by signed role middleware",()=>{
  const mgrAuth=mgrRoutes.indexOf("router.use(requireManagerAuth)");
  const hkAuth=routes.indexOf("router.use(requireHousekeepingAuth)");
  assert.ok(mgrAuth>=0&&hkAuth>=0);
  assert.ok(mgrRoutes.indexOf('router.get("/housekeeping/tasks/:id/proof"')>mgrAuth);
  assert.ok(mgrRoutes.indexOf('router.post("/housekeeping/tasks/:id/proof/review"')>mgrAuth);
  assert.ok(routes.indexOf('router.post("/tasks/:id/proof"')>hkAuth);
  assert.match(proofController,/multer\.memoryStorage\(\)/);
  assert.match(proofController,/MAX_IMAGE_BYTES = 2 \* 1024 \* 1024/);
  assert.match(proofController,/sniffMime/);
  assert.match(proofController,/no-store, private/);
  assert.doesNotMatch(proofController,/express\.static|public\/media|writeFile|multer\.diskStorage/);
});
test("HK-46 task state updates require proof and Manager review without changing availability",()=>{
  assert.match(taskController,/AND EXISTS \(SELECT 1 FROM housekeeping_cleaning_proofs hp/);
  assert.match(taskController,/hp\.reviewed_by=\?/);
  assert.match(taskController,/NOT EXISTS \(SELECT 1 FROM reservation_items ri/);
  assert.doesNotMatch(taskController,/UPDATE reservations|UPDATE accommodations|UPDATE payment_transactions/i);
});
test("HK-46 JS files parse and all exact versioned frontend resources exist",()=>{
  assert.doesNotThrow(()=>new vm.Script(mgrJS));
  assert.doesNotThrow(()=>new vm.Script(hkJS));
  assert.match(mgrHtml,/managerHousekeeping\.js\?v=20261121-hk46/);
  assert.match(hkHtml,/housekeepingTasks\.js\?v=20261121-hk46/);
  assert.match(mgrHtml,/managerHousekeeping-review\.css\?v=20261121-hk46/);
  assert.match(hkHtml,/housekeepingProof\.css\?v=20261121-hk46/);
});
