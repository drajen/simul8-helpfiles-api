const bcrypt = require("bcrypt");

const users = [
  {
    username: "admin",
    password: "$2b$10$QSWZ1EKWmJ3Gd66/ya1RBu5vbR.4lVymYqpWyeTKgUXVN5lYpVJqm", // hashed password
    role: "admin"
  },
  {
    username: "dharrish.r",
    password: "$2b$10$Df6509IZe0gKkXWxCn1B3ubsbHLz/igOoTLVtM/wwqJHM2GMS1Iha", // hashed password
    role: "dharrish.r"
  },
  {
    username: "matthew.o",
    password: "$2b$10$.DEtafjETfBfgbRinL/mtes3dGkTx6OXBL8MMEO7msceGMWhHQYOS", //hashed password
    role: "matthew.o",
    name: "matthew.o"
  },
  {
    username: "roisinanne.h",
    password: "$2b$10$qjqaCH0S1huSK/OlqEliMOzrivHkTJ2qqS4nRb00ahI9/D5WkbSqC", //hashed password
    role: "roisinanne.h",
    name: "roisinanne.h"
}
];

// Lookup user by username
exports.lookup = function (username, callback) {
  const user = users.find(u => u.username === username);
  if (!user) {
    return callback(null, null);
  }
  return callback(null, user);
};

// Register new user (optional — for future)
exports.create = function (username, password, role = "editor") {
  bcrypt.hash(password, 10).then(hashedPassword => {
    users.push({ username, password: hashedPassword, role });
  });
};