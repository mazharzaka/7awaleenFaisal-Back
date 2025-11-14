const express = require("express");
const router = express.Router();
const productController = require("../controllers/product.controller");
const upload = require("../middlewares/multer.middle");
const auth = require("../middlewares/auth.middle");
const role = require("../middlewares/role.middle");
router.post(
  "/",
  role.checkRole(["admin"]),
  upload.single("productImage"),
  productController.createProduct
);
router.get("/", auth.verifyToken, productController.getProducts);
router.get("/active", auth.verifyToken, productController.getActiveProdects);
router.post("/one", auth.verifyToken, productController.produect);
router.post("/search", auth.verifyToken, productController.searchProduct);
router.post(
  "/del",
  role.checkRole(["admin"]),
  productController.deleteProductById
);
router.post("/stock", role.checkRole(["admin"]), productController.Stock);
router.post(
  "/advertising",
  role.checkRole(["admin"]),
  productController.Advertising
);
router.post(
  "/advertised",
  auth.verifyToken,
  productController.getAdvertisingProdects
);
router.post(
  "/edit",
  role.checkRole(["admin"]),
  productController.updateProductById
);

module.exports = router;
