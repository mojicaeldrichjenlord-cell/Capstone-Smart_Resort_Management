"use strict";
// HK-46: Private accommodation cleaning proofs, stored in MySQL.
// These are NOT public accommodation photos and are NOT persisted to Render.
// Authenticated Housekeeping uploads only while task is in_progress;
// authenticated Managers inspect and record review before verifying ready.
const crypto = require("node:crypto");
const multer = require("multer");
const db = require("../../config/db");

const MAX_IMAGE_BYTES = 2 * 1024 * 1024;
const imageMimes = new Set(["image/jpeg", "image/png", "image/webp"]);
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_IMAGE_BYTES, files: 1, fields: 1 },
  fileFilter(_req, file, done) {
    if (!imageMimes.has(String(file.mimetype).toLowerCase())) {
      const err = new Error("Only JPEG, PNG or WebP proof photos are accepted.");
      err.status = 415;
      return done(err);
    }
    done(null, true);
  },
}).single("proof");

const positiveId = value => {
  const n = Number(value);
  return Number.isSafeInteger(n) && n > 0 ? n : null;
};
const validVersion = body => {
  if (!body || Array.isArray(body) || typeof body !== "object" ||
      Object.keys(body).length !== 1 || typeof body.version !== "number" ||
      !Number.isSafeInteger(body.version) || body.version < 0) return null;
  return body.version;
};

function sniffMime(bytes) {
  if (!Buffer.isBuffer(bytes) || bytes.length < 16) return null;
  if (bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff)
    return "image/jpeg";
  if (bytes.subarray(0, 8).equals(Buffer.from([137,80,78,71,13,10,26,10])))
    return "image/png";
  if (bytes.toString("ascii", 0, 4) === "RIFF" &&
      bytes.toString("ascii", 8, 12) === "WEBP")
    return "image/webp";
  return null;
}
function storageError(res, error, label) {
  if (error?.code === "ER_NO_SUCH_TABLE" || error?.errno === 1146) {
    return res.status(503).json({ success:false, code:"HOUSEKEEPING_PROOF_MIGRATION_REQUIRED",
      message:"Cleaning proof storage is not activated. Ask the Manager to apply the approved migration." });
  }
  console.error("Cleaning proof " + label + " failed:", error?.message);
  return res.status(500).json({success:false,message:"Could not process cleaning proof."});
}

// Parse multipart in memory AFTER signed-role middleware. No upload directory.
exports.readCleaningProofUpload = (req,res,next) => upload(req,res,err => {
  if (!err) return next();
  const tooBig = err.code === "LIMIT_FILE_SIZE" || err.code === "LIMIT_FILE_COUNT";
  return res.status(tooBig ? 413 : err.status || 400).json({
    success:false, code:tooBig ? "PROOF_TOO_LARGE" : "INVALID_PROOF_UPLOAD",
    message: tooBig ? "Photo must be 2 MB or smaller. Try a compressed image."
      : err.message || "Upload a JPEG, PNG or WebP cleaning photo.",
  });
});

exports.uploadCleaningProof = async (req,res) => {
  const taskId = positiveId(req.params.id);
  const version = Number(req.body?.version);
  if (!taskId || !Number.isSafeInteger(version) || version < 0 ||
      !req.file || !Buffer.isBuffer(req.file.buffer)) {
    return res.status(400).json({success:false,
      message:"Choose a cleaning photo and refresh the current task version."});
  }
  const actual = sniffMime(req.file.buffer);
  if (!actual || actual !== String(req.file.mimetype).toLowerCase()) {
    return res.status(415).json({success:false,code:"INVALID_PROOF_IMAGE",
      message:"The selected file is not a supported JPEG, PNG or WebP image."});
  }
  try {
    // INSERT SELECT is limited to this signed staff assignment, version, and
    // in-progress task. Reuploading replaces the old draft and invalidates
    // the Manager's previous review, if any.
    const [r] = await db.promise().query(
      "INSERT INTO housekeeping_cleaning_proofs " +
      "(task_id, uploaded_by, mime_type, image_data, image_size, image_sha256) " +
      "SELECT ht.id, ?, ?, ?, ?, ? FROM housekeeping_tasks ht " +
      "WHERE ht.id = ? AND ht.assigned_to = ? AND ht.status = 'in_progress' AND ht.version = ? " +
      "ON DUPLICATE KEY UPDATE uploaded_by = VALUES(uploaded_by), " +
      "mime_type = VALUES(mime_type), image_data = VALUES(image_data), " +
      "image_size = VALUES(image_size), image_sha256 = VALUES(image_sha256), " +
      "uploaded_at = CURRENT_TIMESTAMP, reviewed_by = NULL, reviewed_at = NULL",
      [req.housekeepingUser.id, actual, req.file.buffer, req.file.buffer.length,
        crypto.createHash("sha256").update(req.file.buffer).digest("hex"),
        taskId, req.housekeepingUser.id, version]);
    if (!Number(r.affectedRows)) return res.status(409).json({
      success:false,code:"TASK_CHANGED",
      message:"Only the assigned Housekeeping staff may upload while cleaning is in progress. Refresh your tasks.",
    });
    return res.status(201).json({success:true,has_proof:true,
      message:"Cleaning photo uploaded. You can now mark this task Cleaned."});
  } catch(error) { return storageError(res,error,"upload"); }
};

exports.getManagerCleaningProof = async (req,res) => {
  const taskId = positiveId(req.params.id);
  if (!taskId) return res.status(400).json({success:false,message:"Invalid cleaning task."});
  try {
    const [rows] = await db.promise().query(
      "SELECT p.image_data, p.mime_type, p.image_size " +
      "FROM housekeeping_cleaning_proofs p " +
      "JOIN housekeeping_tasks ht ON ht.id = p.task_id " +
      "WHERE p.task_id = ? AND ht.status IN ('cleaned','verified_ready') LIMIT 1",
      [taskId]);
    const proof = rows[0];
    if (!proof) return res.status(404).json({success:false,message:"No submitted cleaning photo found."});
    if (!imageMimes.has(proof.mime_type) ||
        !Buffer.isBuffer(proof.image_data) ||
        sniffMime(proof.image_data) !== proof.mime_type) {
      return res.status(422).json({success:false,message:"Cleaning photo could not be opened."});
    }
    res.set({
      "Cache-Control":"no-store, private",
      "Pragma":"no-cache",
      "X-Content-Type-Options":"nosniff",
      "Content-Disposition":"inline",
    });
    return res.type(proof.mime_type).send(proof.image_data);
  } catch(error) { return storageError(res,error,"read"); }
};

// A Manager explicitly confirms photo inspection. The final "Verify Ready"
// endpoint independently rechecks this reviewer and the existing occupancy gate.
exports.reviewManagerCleaningProof = async (req,res) => {
  const id = positiveId(req.params.id), version = validVersion(req.body);
  if (!id || version === null) return res.status(400).json({
    success:false,message:"Invalid task version. Refresh to review the latest proof."});
  try {
    const [r] = await db.promise().query(
      "UPDATE housekeeping_cleaning_proofs p " +
      "JOIN housekeeping_tasks ht ON ht.id = p.task_id " +
      "SET p.reviewed_by = ?, p.reviewed_at = NOW() " +
      "WHERE p.task_id = ? AND ht.status = 'cleaned' AND ht.version = ?",
      [req.managerUser.id,id,version]);
    if (!Number(r.affectedRows)) return res.status(409).json({
      success:false,code:"PROOF_NOT_READY",
      message:"No current cleaning proof is ready for your review. Refresh."});
    return res.json({success:true,message:"Photo inspection recorded. The task can now be verified."});
  } catch(error) { return storageError(res,error,"review"); }
};
module.exports.MAX_IMAGE_BYTES = MAX_IMAGE_BYTES;
module.exports.sniffMime = sniffMime;
