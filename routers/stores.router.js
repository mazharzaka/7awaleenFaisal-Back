const express = require("express");
const router = express.Router();
const storeController = require("../controllers/stores.controller");
const upload = require("../middlewares/multer.middle");
const auth = require("../middlewares/auth.middle");
const role = require("../middlewares/role.middle");
router.post(
  "/",
  auth.verifyToken,
  upload.single("storeImage"),
  auth.isAdmin,
  storeController.createStore
);
router.get("/", storeController.getStores);
router.get("/active", storeController.getActiveStores);
router.get("/one", storeController.getStoreById);
router.post(
  "/del",
  auth.verifyToken,
  auth.isAdmin,
  storeController.deleteStore
);
router.post(
  "/sub",
  auth.verifyToken,
  auth.isAdmin,
  storeController.toggleSubscription
);
router.get(
  "/sub",
  auth.verifyToken,
  auth.isAdmin,
  storeController.getSubscribedStores
);

router.post(
  "/edit",
  auth.verifyToken,
  auth.isAdmin,
  storeController.updateStore
);

module.exports = router;
