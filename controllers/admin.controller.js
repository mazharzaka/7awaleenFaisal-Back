const User = require("../models/user.model");

// GET /admin/drivers?status=PENDING
exports.getDrivers = async (req, res) => {
  try {
    const { status } = req.query;
    const filter = { role: "DRIVER" };
    if (status) filter.accountStatus = status.toUpperCase();
    const drivers = await User.find(filter).select("-password");
    res.json(drivers);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// PATCH /admin/drivers
// body: { driverId, status: 'APPROVE'|'REJECT'|'SUSPEND' }
exports.updateDriverStatus = async (req, res) => {
  const { driverId, status } = req.body;
  if (!driverId || !status)
    return res.status(400).json({ error: "Missing fields" });
  const updates = {};
  if (status === "APPROVE") {
    updates.isApproved = true;
    updates.accountStatus = "APPROVED";
  } else if (status === "REJECT") {
    updates.isApproved = false;
    updates.accountStatus = "REJECTED";
  } else if (status === "SUSPEND") {
    updates.isApproved = false;
    updates.accountStatus = "SUSPENDED";
  } else {
    return res.status(400).json({ error: "Invalid status" });
  }
  try {
    const driver = await User.findByIdAndUpdate(driverId, updates, {
      new: true,
    }).select("-password");
    if (!driver) return res.status(404).json({ error: "Driver not found" });
    res.json({ driver });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
