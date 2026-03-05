const { verifyToken, isDriver } = require("../middlewares/auth.middle");

const express = require("express");
const deliveryController = require("../controllers/delivery.controller");
const Router = express.Router();

// Allow drivers to accept searching orders
Router.post("/accept", verifyToken, isDriver, deliveryController.acceptOrder);

// Allow drivers to upload proof and complete orders
Router.post("/complete", verifyToken, isDriver, deliveryController.completeDelivery);

// Get orders searching for drivers
Router.get("/orders/available", verifyToken, isDriver, deliveryController.getAvailableOrders);

// Get orders assigned to the current driver
Router.get("/orders/active", verifyToken, isDriver, deliveryController.getActiveOrders);

// Toggle driver online status
Router.post("/status-toggle", verifyToken, isDriver, deliveryController.toggleOnlineStatus);

module.exports = Router;
