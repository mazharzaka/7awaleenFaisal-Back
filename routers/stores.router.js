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
  role.checkRole(["admin"]),
  storeController.createStore
);
router.get("/", storeController.getStores);
router.get("/active", storeController.getActiveStores);
router.get("/one", storeController.getStoreById);
router.post(
  "/del",
  auth.verifyToken,
  role.checkRole(["admin"]),
  storeController.deleteStore
);
router.post(
  "/sub",
  auth.verifyToken,
  role.checkRole(["admin"]),
  storeController.toggleSubscription
);
router.get(
  "/sub",
  auth.verifyToken,
  role.checkRole(["admin"]),
  storeController.getSubscribedStores
);

router.post(
  "/edit",
  auth.verifyToken,
  role.checkRole(["admin"]),
  storeController.updateStore
);

module.exports = router;
