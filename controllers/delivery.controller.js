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
      return res
        .status(403)
        .json({ error: "Your account is not approved yet." });
    }

    if (!user.isOnline) {
      return res
        .status(403)
        .json({ error: "You must be online to accept orders." });
    }

    // Atomic update using findOneAndUpdate
    const order = await Order.findOneAndUpdate(
      {
        _id: orderId,
        status: "searching", // strict match
        driverId: { $exists: false }, // ensure no driver is assigned yet
      },
      {
        $set: {
          status: "accepted",
          driverId: driverId,
          acceptedAt: new Date(),
        },
      },
      { new: true }, // Return the updated document
    );

    if (!order) {
      return res.status(404).json({
        error:
          "Order not found or has already been accepted by another driver.",
      });
    }

    const io = req.app.get("io");
    if (io) {
      io.to(`order_${orderId}`).emit("status-changed", {
        orderId,
        status: "accepted",
        timestamp: new Date()
      });
    }

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
      return res
        .status(400)
        .json({ error: "Delivery proof image is required." });
    }

    order.status = "delivered";
    order.deliveryProofUrl = proofUrl;

    await order.save();

    const io = req.app.get("io");
    if (io) {
      io.to(`order_${orderId}`).emit("status-changed", {
        orderId,
        status: "delivered",
        timestamp: new Date()
      });
    }

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
      status: "searching", // strictly searching
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
      status: { $nin: ["delivered", "cancelled", "refunded"] }, // not completed
    })
      .populate("storeId", "name location")
      .sort({ updatedAt: -1 }); // most recently updated first

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
      return res
        .status(403)
        .json({ error: "Your account must be approved to go online." });
    }

    user.isOnline = !user.isOnline;
    await user.save();

    res.status(200).json({
      success: true,
      isOnline: user.isOnline,
      message: `You are now ${user.isOnline ? "Online" : "Offline"}`,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.updateOrderStatus = async (req, res) => {
  try {
    const { orderId, status } = req.body;
    const driverId = req.user.userId;

    const order = await Order.findOne({ _id: orderId, driverId });
    if (!order) {
      return res.status(404).json({ error: "Order not found" });
    }

    order.status = status;
    await order.save();

    const io = req.app.get("io");
    if (io) {
      io.to(`order_${orderId}`).emit("status-changed", {
        orderId,
        status,
        timestamp: new Date()
      });
    }

    res.status(200).json({
      success: true,
      message: "Status updated",
      order
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

