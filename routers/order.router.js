const express = require("express");
const orderController = require("../controllers/order.controller");
const { checkRole } = require("../middlewares/role.middle");
const auth = require("../middlewares/auth.middle");
const Router = express.Router();

Router.get(
  "/guest",
  auth.verifyToken,
  auth.isAdmin,
  orderController.getAllOrdersGeust
);
Router.post("/checkout", auth.verifyToken,orderController.checkOut); // For guest and authenticated checkout
Router.get("/my-orders", auth.verifyToken, orderController.getMyOrders);
Router.get("/Allorders", auth.verifyToken, auth.isAdmin, orderController.getAllOrders);
Router.post("/Myorders", auth.verifyToken, orderController.getMyOrders); // Legacy
Router.get("/:id",auth.verifyToken,  orderController.getOrderById);
Router.post("/status", auth.verifyToken, auth.isAdmin, orderController.updateOrderStatus);
Router.post("/guest", orderController.guestOrder);
Router.post(
  "/guest/status",
  auth.verifyToken,
  auth.isAdmin,
  orderController.updateGuestOrderStatus
);
module.exports = Router;
