const Order = require("../models/order.model");

exports.CheckOut = async (req, res) => {
  const { userid } = req.body;

  try {
    const order = new Order({
      userId: userid,
      items: cart.cartItem,
      totalPriceOrder: cart.totalPriceCart,
    });
    await order.save();

    res.status(201).json(order);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
exports.getMyOrders = async (req, res) => {
  try {
    const userId = req.body.userid;
    const orders = await Order.find({ userId }).populate("items.productId");
    // console.log(orders);

    res.status(200).json(orders);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find()
      .populate("items.productId")
      .populate("userId");
    res.status(200).json(orders);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
exports.updateOrderStatus = async (req, res) => {
  try {
    const { orderId, status, itemId } = req.body;
    console.log(orderId, status, itemId);

    // const order = await Order.findByIdAndUpdate({_id:orderId, "items._id": itemId} ,{ $set: { "items.$.status": status } });
    const orderr = await Order.findOneAndUpdate(
      { _id: orderId, "items._id": itemId },
      { $set: { "items.$.status": status } },
      { new: true }
    );
    // console.log(orderr);

    res.status(200).json(orderr);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
