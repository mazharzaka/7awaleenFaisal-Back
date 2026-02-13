const express = require("express");
const orderController = require("../controllers/order.controller");
const { checkRole } = require("../middlewares/role.middle");
const auth = require("../middlewares/auth.middle");
const Router = express.Router();

Router.post("/check", auth.verifyToken, checkRole(["user"]), orderController.checkOut);
Router.post("/Myorders", auth.verifyToken, checkRole(["user"]), orderController.getMyOrders);
Router.get("/Allorders", auth.verifyToken, auth.isAdmin, orderController.getAllOrders);
Router.post("/status", auth.verifyToken, auth.isAdmin, orderController.updateOrderStatus);
Router.post("/guest", orderController.guestOrder);
Router.get(
  "/guest",
  auth.verifyToken,
  auth.isAdmin,
  orderController.getAllOrdersGeust
);
Router.post(
  "/guest/status",
  auth.verifyToken,
  auth.isAdmin,
  orderController.updateGuestOrderStatus
);
module.exports = Router;
