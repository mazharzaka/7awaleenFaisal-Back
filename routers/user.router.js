const express = require("express");
const router = express.Router();
const userController = require("../controllers/user.controller");
const authMW = require("../middlewares/auth.middle");

router.post("/", userController.createUser);
router.post("/login", userController.login);
router.post("/google-login", userController.googleLogin);

// OTP Routes
router.post("/send-otp", userController.sendOtp);
router.post("/verify-otp", userController.verifyOtp);

router.post("/refresh-token", userController.refreshToken);
router.get("/", authMW.verifyToken, authMW.isAdmin, userController.getUsers);
router.get("/health", (req, res) => {
  res.status(200).json({ status: "ok" });
});

module.exports = router;
