const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const userModel = require("../models/userModel");

// Handle login
exports.login = async (req, res) => {
  const { username, password } = req.body;

  userModel.lookup(username, async (err, user) => {
    if (err || !user) {
      console.error("User lookup failed:", err || "User not found");
      return res.status(401).json({ message: "Invalid username or password" });
    }

    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) {
      console.error("Password mismatch for:", username);
      return res.status(401).json({ message: "Invalid username or password" });
    }

    // Create JWT payload
    const payload = { username: user.username, role: user.role };

    const token = jwt.sign(payload, process.env.ACCESS_TOKEN_SECRET, {
      expiresIn: "1h",
    });

    res.cookie("jwt", token, { httpOnly: true, secure: false }); // set secure:true if HTTPS
    //res.status(200).json({ message: "Login successful", token });
    res.redirect("/dashboard");
  });
};

// Handle logout
exports.logout = (req, res) => {
  res.clearCookie("jwt");
  //res.status(200).json({ message: "Logged out successfully" });
  res.redirect("/auth/login");
};

// Get current user
exports.getMe = (req, res) => {
  const { username, role } = req.user; // comes from authMiddleware
  res.status(200).json({ user: { username, role } });
};