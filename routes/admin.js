const express = require("express");
const router = express.Router();
const productController = require("../controllers/productController");
const { authorizeRoles, authenticateToken } = require("../middleware/is-auth");

// Same to get all, but another authentication
router.get(
  "/get-all",
  // authenticateToken,
  // authorizeRoles("Admin"),
  // (req, res) => {
  //   res.json({ message: "Welcome admin!" });
  // },
  productController.getProducts
);

module.exports = router;
