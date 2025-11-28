const express = require("express");
const router = express.Router();
const productController = require("../controllers/product.controller");
const upload = require("../middlewares/multer.middle");
const auth = require("../middlewares/auth.middle");
const role = require("../middlewares/role.middle");
router.post(
  "/",
  auth.verifyToken,
  upload.array("productImage", 4),
  role.checkRole(["admin"]),
  productController.createProduct
);
router.get("/", productController.getProducts);
router.get("/active", productController.getActiveProdects);
router.get("/:id", productController.produect);
router.post("/search", productController.searchProduct);
router.post(
  "/del",
  auth.verifyToken,
  role.checkRole(["admin"]),
  productController.deleteProductById
);
router.post("/stock", role.checkRole(["admin"]), productController.Stock);
router.post(
  "/advertising",
  auth.verifyToken,
  role.checkRole(["admin"]),
  productController.Advertising
);
router.post(
  "/advertised",

  productController.getAdvertisingProdects
);
router.post(
  "/edit",
  auth.verifyToken,
  role.checkRole(["admin"]),
  productController.updateProductById
);

module.exports = router;
