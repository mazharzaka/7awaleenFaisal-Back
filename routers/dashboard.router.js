const express = require("express");
const dashboardController = require("../controllers/dashboard.controller");
const auth = require("../middlewares/auth.middle");
const Router = express.Router();

Router.get(
  "/stats",
  auth.verifyToken,
  auth.isAdmin,
  dashboardController.getStats
);

module.exports = Router;
