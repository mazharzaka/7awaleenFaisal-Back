const Order = require("../models/order.model");
const User = require("../models/user.model");

// Temporary mock for file upload until native integration is requested
const mockUploadImage = async (file) => {
  return `https://mock-image-host.com/delivery-proof-${Date.now()}.png`;
};

exports.acceptOrder = async (req, res) => {
  try {
    const { orderId } = req.body;
    const driverId = req.user.userId;

    const user = await User.findById(driverId);
    if (!user.isApproved) {
      return res.status(403).json({ error: "Your account is not approved yet." });
    }

    // Find the order that is currently 'searching' or 'placed'
    const order = await Order.findOne({
      _id: orderId,
      status: { $in: ["searching", "placed"] },
    });

    if (!order) {
      return res.status(404).json({
        error: "Order not found or has already been accepted by another driver.",
      });
    }

    // Update order to 'accepted' and assign driver
    order.status = "accepted";
    order.driverId = driverId;
    order.acceptedAt = new Date();

    await order.save();

    res.status(200).json({
      success: true,
      message: "Order accepted successfully",
      order,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.completeDelivery = async (req, res) => {
  try {
    const { orderId, imageBase64 } = req.body;
    const driverId = req.user ? req.user.userId : req.body.driverId;

    if (!driverId) {
      return res.status(400).json({ error: "Driver ID is required" });
    }

    const order = await Order.findOne({ _id: orderId, driverId: driverId });

    if (!order) {
      return res.status(404).json({
        error: "Order not found or you are not authorized to complete it.",
      });
    }

    if (order.status === "delivered") {
      return res.status(400).json({ error: "Order is already delivered." });
    }

    let proofUrl = "";
    if (imageBase64) {
      // In a real scenario, you'd upload 'imageBase64' to Cloudinary/S3 here
      proofUrl = await mockUploadImage(imageBase64);
    } else {
      return res.status(400).json({ error: "Delivery proof image is required." });
    }

    order.status = "delivered";
    order.deliveryProofUrl = proofUrl;

    await order.save();

    res.status(200).json({
      success: true,
      message: "Delivery completed successfully",
      order,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getAvailableOrders = async (req, res) => {
  try {
    const orders = await Order.find({
      status: { $in: ["searching", "placed", "pending"] },
      driverId: { $exists: false },
    })
    .populate("storeId", "name location")
    .sort({ createdAt: -1 });

    res.status(200).json(orders);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getActiveOrders = async (req, res) => {
  try {
    const driverId = req.user.userId;
    const orders = await Order.find({
      driverId: driverId,
      status: { $in: ["accepted", "picked_up", "out_for_delivery"] },
    })
    .populate("storeId", "name location")
    .sort({ updatedAt: -1 });

    res.status(200).json(orders);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.toggleOnlineStatus = async (req, res) => {
  try {
    const userId = req.user.userId;
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    if (!user.isApproved) {
      return res.status(403).json({ error: "Your account must be approved to go online." });
    }

    user.isOnline = !user.isOnline;
    await user.save();

    res.status(200).json({ 
      success: true, 
      isOnline: user.isOnline,
      message: `You are now ${user.isOnline ? 'Online' : 'Offline'}`
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
