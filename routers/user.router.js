const express = require("express");
const router = express.Router();
const userController = require("../controllers/user.controller");
const authMW = require("../middlewares/auth.middle");

router.post("/", userController.createUser);
router.post("/login", userController.login);
router.get("/", authMW.verifyToken, userController.getUsers);
router.get("/health", (req, res) => {
  res.status(200).json({ status: "ok" });
});

module.exports = router;
