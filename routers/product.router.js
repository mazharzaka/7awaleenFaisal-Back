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
  auth.isAdmin,
  productController.createProduct
);
router.get("/advertised", productController.getAdvertisingProdects);

router.get("/categories", productController.getcategoriesProdects);
router.get("/subcategories", productController.getSubcategoriesProdects);
router.get("/", productController.getProducts);
router.get("/active", productController.getActiveProdects);
router.get("/:id", productController.produect);
router.post("/search", productController.searchProduct);
router.delete(
  "/",
  auth.verifyToken,
  auth.isAdmin,
  productController.deleteProductById
);
router.post("/stock", auth.verifyToken, auth.isAdmin, productController.Stock);
router.post(
  "/advertising",
  auth.verifyToken,
  auth.isAdmin,
  productController.Advertising
);
router.post(
  "/edit/:id",
  auth.verifyToken,
  upload.array("productImage", 4),
  auth.isAdmin,
  productController.updateProductById
);

module.exports = router;
