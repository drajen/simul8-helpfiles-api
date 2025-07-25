const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const userModel = require("../models/userModel");
const loginAttempts = {}; // Store login attempts in memory
const MAX_ATTEMPTS = 5;
const BLOCK_TIME = 5 * 60 * 1000; // 5 minutes

// Handle login
exports.login = async (req, res) => {
  const { username, password } = req.body;

  const now = Date.now();
  if (!loginAttempts[username]) loginAttempts[username] = { count: 0, lastAttempt: now };

  if (
    loginAttempts[username].count >= MAX_ATTEMPTS &&
    now - loginAttempts[username].lastAttempt < BLOCK_TIME
  ) {
    return res.status(403).render("login", { error: "Account has been locked temporarily. Try again in 5 minutes." });
  }

  userModel.lookup(username, async (err, user) => {
    if (err || !user) {
      console.error("User lookup failed:", err || "User not found");
      loginAttempts[username].count++;
      loginAttempts[username].lastAttempt = now;
      return res.status(401).render("login", { error: "Invalid username or password" });
    }

    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) {
      console.error("Password mismatch for:", username);
      loginAttempts[username].count++;
      loginAttempts[username].lastAttempt = now;
      return res.status(401).render("login", { error: "Invalid username or password" });
    }
    
    // Reset login attempts on successful login
    delete loginAttempts[username];

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