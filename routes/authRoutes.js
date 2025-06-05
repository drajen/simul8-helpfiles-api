const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");
const { verifyToken } = require("../middleware/authMiddleware");

// API + UI Auth Routes
router.post("/login", authController.login);
router.get("/login", (req, res) => {
  const error = req.query.error ? "Invalid login credentials" : null;
  res.render("login", { layout: "header", error });
});

router.get("/logout", authController.logout); // GET logout for links
router.post("/logout", authController.logout); // POST logout for forms

router.get("/me", verifyToken, authController.getMe); // protected route

module.exports = router;