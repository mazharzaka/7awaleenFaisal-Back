const Order = require("../models/order.model");
const WOrder = require("../models/whatsapp");
const { generateWhatsAppMessage, generateWhatsAppLink } = require("../utils/whatsapp");
const dotenv = require("dotenv");
dotenv.config();

// Checkout / Create Order
exports.checkOut = async (req, res) => {
  const {
    storeId,
    items,
    total,
    address,
    note,
    deliveryPartnerId,
    paymentMethod,
    customerInfo,
  } = req.body;
  
  const userId = req.user ? req.user.userId : req.body.userId;
  try {
    const order = new Order({
      userId: userId || null, // Allow guest orders
      storeId,
      items, // [{ productId, qty, price }]
      total,
      address,
      note,
      deliveryPartnerId, // optional
      paymentMethod: paymentMethod || "whatsapp",
      paymentStatus: paymentMethod === "cash" ? "pending" : "pending",
      customerInfo: customerInfo || {}, // Required for guest orders
    });

    await order.save();

    // Populate items with product details for WhatsApp message
    await order.populate("items.productId");

    // Generate WhatsApp message and link
    const whatsappMsg = generateWhatsAppMessage(order);
    const whatsappLink = generateWhatsAppLink(
      process.env.MYPHONE || "201000000000",
      whatsappMsg
    );

    res.status(201).json({
      success: true,
      order,
      whatsappLink,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get orders of a specific user
exports.getMyOrders = async (req, res) => {
  try {
    const userId = req.user ? req.user.userId : req.body.userId;
    const orders = await Order.find({ userId })
      .sort({ createdAt: -1 })
      .populate("items.productId")
      .populate("storeId");

    res.status(200).json(orders);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get single order by ID
exports.getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate("items.productId")
      .populate("storeId");

    if (!order) {
      return res.status(404).json({ error: "Order not found" });
    }

    res.status(200).json(order);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get all orders (admin)
exports.getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find()
      .sort({ createdAt: -1 })
      .populate("items.productId")
      .populate("storeId");

    res.status(200).json(orders);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.guestOrder = async (req, res) => {
  try {
    const { name, phone, productId, price, product, quantity, note, paymentMethod } = req.body;

    let finalPrice = price * quantity;
    const order = await WOrder.create({
      name,
      phone,
      productId,
      quantity,
      note,
      finalPrice,
      paymentMethod: paymentMethod || "whatsapp",
    });

    // Generate WhatsApp message using utility
    const { generateWhatsAppLink } = require("../utils/whatsapp");
    const whatsappMsg = `السلام عليكم، لدي طلب جديد عبر موقع 7awaleen:

📦 المنتج: ${product}
الكمية: ${quantity}
السعر: ${price.toLocaleString('ar-EG')} جنيه

👤 معلومات العميل:
الاسم: ${name}
الهاتف: ${phone}

💰 السعر النهائي: ${finalPrice.toLocaleString('ar-EG')} جنيه

${note ? `📝 ملاحظات: ${note}` : ''}`;

    const whatsappLink = generateWhatsAppLink(
      process.env.MYPHONE || "201000000000",
      whatsappMsg
    );

    return res.json({
      success: true,
      order,
      whatsappLink,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
exports.getAllOrdersGeust = async (req, res) => {
  try {
    const orders = await WOrder.find()
      .sort({ createdAt: -1 })
      .populate("productId");

    res.status(200).json(orders);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.updateGuestOrderStatus = async (req, res) => {
  try {
    const { orderId, status } = req.body;
    const order = await WOrder.findByIdAndUpdate(
      orderId,
      { status },
      { new: true }
    ).populate("productId");
    if (!order) return res.status(404).json({ error: "Order not found" });

    res.status(200).json(order);
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
