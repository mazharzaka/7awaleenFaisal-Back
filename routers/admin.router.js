const express = require("express");
const { verifyToken, isAdmin } = require("../middlewares/auth.middle");
const adminController = require("../controllers/admin.controller");

const router = express.Router();

// Get drivers (optionally filter by status)
router.get("/drivers", verifyToken, isAdmin, adminController.getDrivers);

// Update driver status (APPROVE, REJECT, SUSPEND)
router.post(
  "/drivers",
  verifyToken,
  isAdmin,
  adminController.updateDriverStatus,
);

module.exports = router;
