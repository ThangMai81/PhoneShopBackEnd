const express = require("express");
const router = express.Router();
const orderController = require("../controllers/orderController");
const { authenticateToken } = require("../middleware/is-auth");

router.post("/", authenticateToken, orderController.placeOrder);
router.post("/history", authenticateToken, orderController.getOrderHistory);
router.post(
  "/history/:orderId",
  authenticateToken,
  orderController.getOrderById
);

module.exports = router;
