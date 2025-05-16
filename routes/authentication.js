const express = require("express");
const router = express.Router();
const authenticationController = require("../controllers/authenticationController");
const { authenticateToken } = require("../middleware/is-auth");

router.post("/sign-up", authenticationController.signUp);
router.post("/sign-in", authenticationController.signIn);
router.post(
  "/get-full-name",
  authenticateToken,
  authenticationController.getFullName
);
router.post(
  "/verify-token",
  authenticateToken,
  authenticationController.getTokenVerified
);
module.exports = router;
