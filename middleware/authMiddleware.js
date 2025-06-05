const jwt = require("jsonwebtoken");

// Middleware to verify JWT
exports.verifyToken = (req, res, next) => {
  const token = req.cookies.jwt;

  if (!token) {
    //return res.status(403).json({ message: "No token provided" });
    return res.redirect("/auth/login");
  }

  try {
    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    req.user = decoded; // Attach user data to request
    next();
  } catch (err) {
    console.error("Token verification failed:", err);
    //res.status(401).json({ message: "Unauthorized" });
    res.redirect("/login");
  }
};

// Middleware for RBAC
exports.authorizeRole = (role) => {
  return (req, res, next) => {
    if (req.user.role !== role) {
      return res.status(403).json({ message: "Forbidden - Insufficient rights" });
    }
    next();
  };
};