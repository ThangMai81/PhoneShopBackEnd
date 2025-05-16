const jwt = require("jsonwebtoken");

function authenticateToken(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Unauthorized: No token provided" });
  }

  const token = authHeader.split(" ")[1];
  try {
    const decoded = jwt.verify(token, "jwt_secret_key"); // nên dùng env
    if (!decoded) {
      return res
        .status(401)
        .json({ message: "Unauthorized: Token is expired" });
    }
    req.user = decoded; // gắn vào req để controller dùng
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
