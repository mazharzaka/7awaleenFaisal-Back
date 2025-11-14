const Order = require("../models/order.model");

// Checkout / Create Order
exports.checkOut = async (req, res) => {
  const { userId, storeId, items, total, address, note, deliveryPartnerId } =
    req.body;

  try {
    const order = new Order({
      userId,
      storeId,
      items, // [{ productId, qty, price }]
      total,
      address,
      note,
      deliveryPartnerId, // optional
    });

    await order.save();

    res.status(201).json(order);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get orders of a specific user
exports.getMyOrders = async (req, res) => {
  try {
    const { userId } = req.body;
    const orders = await Order.find({ userId })
      .populate("items.productId")
      .populate("storeId");

    res.status(200).json(orders);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get all orders (admin)
exports.getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find()
      .populate("items.productId")
      .populate("storeId")
      .populate("userId");

    res.status(200).json(orders);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
exports.guestOrder = async (req, res) => {
  try {
    const { name, phone, address, productId, message } = req.body;

    if (!phone || !productId) {
      return res.status(400).json({ error: "Phone & product are required" });
    }

    // رابط واتساب
    const whatsappMessage = `
طلب جديد (Guest):
الاسم: ${name || "غير محدد"}
التليفون: ${phone}
العنوان: ${address || "غير محدد"}
المنتج: ${productId}
ملاحظة: ${message || "لا يوجد"}
    `;

    const encoded = encodeURIComponent(whatsappMessage);

    const whatsappUrl = `https://wa.me/<YOUR_PHONE>?text=${encoded}`;

    res.status(200).json({ whatsappUrl });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Update order status
exports.updateOrderStatus = async (req, res) => {
  try {
    const { orderId, status } = req.body;

    const order = await Order.findByIdAndUpdate(
      orderId,
      { status }, // update main order status
      { new: true }
    )
      .populate("items.productId")
      .populate("storeId")
      .populate("userId");

    if (!order) return res.status(404).json({ error: "Order not found" });

    res.status(200).json(order);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
``;
