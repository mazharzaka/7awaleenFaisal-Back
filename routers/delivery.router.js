const { verifyToken, isDriver } = require("../middlewares/auth.middle");

const express = require("express");
const deliveryController = require("../controllers/delivery.controller");
const Router = express.Router();

// Allow drivers to accept searching orders
Router.post(
  "/accept-order",
  verifyToken,
  isDriver,
  deliveryController.acceptOrder,
);

// Allow drivers to upload proof and complete orders
Router.post(
  "/complete",
  verifyToken,
  isDriver,
  deliveryController.completeDelivery,
);

// Get orders searching for drivers
Router.get(
  "/available-orders",
  verifyToken,
  isDriver,
  deliveryController.getAvailableOrders,
);

// Get orders assigned to the current driver
Router.get(
  "/my-trips",
  verifyToken,
  isDriver,
  deliveryController.getActiveOrders,
);

// Toggle driver online status
Router.post(
  "/status",
  verifyToken,
  isDriver,
  deliveryController.toggleOnlineStatus,
);

// Update order status (e.g. "picked_up")
Router.patch(
  "/order-status",
  verifyToken,
  isDriver,
  deliveryController.updateOrderStatus,
);

module.exports = Router;
