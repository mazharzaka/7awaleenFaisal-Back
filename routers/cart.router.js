const express = require("express");
const cartController = require("../controllers/cart.controller");
const auth = require("../middlewares/auth.middle");
const Router = express.Router();

Router.get("/", auth.verifyToken, cartController.getCart);
Router.post("/add", auth.verifyToken, cartController.addToCart);
Router.post("/update", auth.verifyToken, cartController.updateQuantity);
Router.post("/remove", auth.verifyToken, cartController.removeFromCart);
Router.delete("/clear", auth.verifyToken, cartController.clearCart);
Router.post("/sync", auth.verifyToken, cartController.syncCart);

module.exports = Router;
