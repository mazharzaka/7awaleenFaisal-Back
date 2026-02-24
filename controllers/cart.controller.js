const Cart = require("../models/cart.model");
const Product = require("../models/product.model");

// Get or create cart for user
exports.getCart = async (req, res) => {
  try {
    let cart = await Cart.findOne({ userId: req.user.userId }).populate(
      "items.productId"
    );

    if (!cart) {
      cart = await Cart.create({ userId: req.user.userId, items: [] });
    }

    res.status(200).json({
      success: true,
      data: cart,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Add item to cart
exports.addToCart = async (req, res) => {
  try {
    const { productId, quantity, price, discountedPrice } = req.body;
    const userId = req.user.userId;

    let cart = await Cart.findOne({ userId });

    if (!cart) {
      cart = new Cart({ userId, items: [] });
    }

    const itemIndex = cart.items.findIndex(
      (item) => item.productId.toString() === productId
    );

    if (itemIndex > -1) {
      cart.items[itemIndex].quantity += quantity || 1;
    } else {
      cart.items.push({ productId, quantity: quantity || 1, price, discountedPrice });
    }

    await cart.save();
    const populatedCart = await cart.populate("items.productId");

    res.status(200).json({ success: true, data: populatedCart });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Update item quantity
exports.updateQuantity = async (req, res) => {
  try {
    const { productId, quantity } = req.body;
    const userId = req.user.userId;

    const cart = await Cart.findOne({ userId });

    if (!cart) {
      return res.status(404).json({ success: false, message: "Cart not found" });
    }

    const itemIndex = cart.items.findIndex(
      (item) => item.productId.toString() === productId
    );

    if (itemIndex > -1) {
      if (quantity <= 0) {
        cart.items.splice(itemIndex, 1);
      } else {
        cart.items[itemIndex].quantity = quantity;
      }
      await cart.save();
      const populatedCart = await cart.populate("items.productId");
      res.status(200).json({ success: true, data: populatedCart });
    } else {
      res.status(404).json({ success: false, message: "Product not in cart" });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Remove item from cart
exports.removeFromCart = async (req, res) => {
  try {
    const { productId } = req.body;
    const userId = req.user.userId;

    const cart = await Cart.findOne({ userId });

    if (!cart) {
      return res.status(404).json({ success: false, message: "Cart not found" });
    }

    cart.items = cart.items.filter(
      (item) => item.productId.toString() !== productId
    );

    await cart.save();
    const populatedCart = await cart.populate("items.productId");
    res.status(200).json({ success: true, data: populatedCart });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Clear cart
exports.clearCart = async (req, res) => {
  try {
    const userId = req.user.userId;
    const cart = await Cart.findOne({ userId });

    if (cart) {
      cart.items = [];
      await cart.save();
    }

    res.status(200).json({ success: true, message: "Cart cleared" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Sync cart from frontend (usually on login)
exports.syncCart = async (req, res) => {
  try {
    const { items } = req.body; // Array of { productId, quantity, price, discountedPrice }
    const userId = req.user.userId;

    let cart = await Cart.findOne({ userId });

    if (!cart) {
      cart = new Cart({ userId, items: [] });
    }

    // Simple merge strategy: if item exists, update quantity; if not, add it
    for (const newItem of items) {
      const itemIndex = cart.items.findIndex(
        (item) => item.productId.toString() === newItem.productId
      );

      if (itemIndex > -1) {
        // Option A: Take larger quantity
        // cart.items[itemIndex].quantity = Math.max(cart.items[itemIndex].quantity, newItem.quantity);
        // Option B: Overwrite with frontend (since guest cart is most recent)
        cart.items[itemIndex].quantity = newItem.quantity;
      } else {
        cart.items.push(newItem);
      }
    }

    await cart.save();
    const populatedCart = await cart.populate("items.productId");

    res.status(200).json({ success: true, data: populatedCart });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
