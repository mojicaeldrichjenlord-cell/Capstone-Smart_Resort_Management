const express = require("express");
const router = express.Router();
const {
  register,
  login,
  getProfile,
  updateProfile,
  changePassword,
} = require("../controllers/authController");

router.post("/register", register);
router.post("/login", login);
router.get("/profile/:id", getProfile);
router.put("/profile/:id", updateProfile);
router.put("/change-password/:id", changePassword);

module.exports = router;