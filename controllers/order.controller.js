const Order = require("../models/order.model");
const WOrder = require("../models/whatsapp");
const dotenv = require("dotenv");
dotenv.config();
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
    const { name, phone, productId, price, product, quantity, note } = req.body;

    let finalPrice = price * quantity;
    const order = await WOrder.create({
      name,
      phone,
      productId,
      quantity,
      note,
      finalPrice,
    });

    // Generate WhatsApp message
    const whatsappMsg = `Hello, I want to order:
- Product: ${product}
- Quantity: ${quantity}
- Name: ${name}
- Phone: ${phone}
-finalPrice ${finalPrice}
- Note: ${note}`;

    const encodedMsg = encodeURIComponent(whatsappMsg);

    return res.json({
      success: true,
      order,
      whatsappLink: `https://wa.me/${process.env.MYPHONE}?text=${encodedMsg}`,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
exports.getAllOrdersGeust = async (req, res) => {
  try {
    const orders = await WOrder.find().populate("productId");

    res.status(200).json(orders);
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
