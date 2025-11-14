const express = require("express");
const router = express.Router();
const storeController = require("../controllers/stores.controller");
const upload = require("../middlewares/multer.middle");
const auth = require("../middlewares/auth.middle");
const role = require("../middlewares/role.middle");
router.post(
  "/",
  role.checkRole(["admin"]),
  upload.single("storeImage"),
  storeController.createStore
);
router.get("/", auth.verifyToken, storeController.getStores);
router.get("/active", auth.verifyToken, storeController.getActiveStores);
router.get("/one", auth.verifyToken, storeController.getStoreById);
router.post("/del", role.checkRole(["admin"]), storeController.deleteStore);
router.post(
  "/sub",
  role.checkRole(["admin"]),
  storeController.toggleSubscription
);
router.get(
  "/sub",
  role.checkRole(["admin"]),
  storeController.getSubscribedStores
);

router.post("/edit", role.checkRole(["admin"]), storeController.updateStore);

module.exports = router;
