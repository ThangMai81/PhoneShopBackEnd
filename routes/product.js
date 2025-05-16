const express = require("express");
const router = express.Router();
const productController = require("../controllers/productController");

router.get("/get-all", productController.getProducts);
router.get("/:productId", productController.getProductById);

module.exports = router;
