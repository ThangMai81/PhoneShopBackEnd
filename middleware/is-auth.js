const jwt = require("jsonwebtoken");

function authenticateToken(req, res, next) {
  const token = req.cookies["auth-token"];
  try {
    const decoded = jwt.verify(token, "jwt_secret_key");
    if (!decoded) {
      return res
        .status(401)
        .json({ message: "Unauthorized: Token is expired" });
    }
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(403).json({ message: "Forbidden: Invalid token" });
  }
}

function authorizeRoles(...allowedRoles) {
  return (req, res, next) => {
    const userRole = req.user?.role;
    if (!allowedRoles.includes(userRole)) {
      return res
        .status(403)
        .json({ message: "Forbidden: Insufficient permissions" });
    }
    next();
  };
}

module.exports = {
  authenticateToken,
  authorizeRoles,
};
