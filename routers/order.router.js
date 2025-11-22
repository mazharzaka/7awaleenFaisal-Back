const express = require("express");
const orderController = require("../controllers/order.controller");
const { checkRole } = require("../middlewares/role.middle");

const Router = express.Router();

Router.post("/check", checkRole(["user"]), orderController.checkOut);
Router.post("/Myorders", checkRole(["user"]), orderController.getMyOrders);
Router.get("/Allorders", checkRole(["admin"]), orderController.getAllOrders);
Router.post("/status", checkRole(["admin"]), orderController.updateOrderStatus);
Router.post("/guest", orderController.guestOrder);
Router.get("/guest", orderController.getAllOrdersGeust);
module.exports = Router;
