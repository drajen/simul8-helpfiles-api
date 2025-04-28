const bcrypt = require("bcrypt");

const users = [
  {
    username: "admin",
    password: "$2b$10$abcdefghijk....", // hashed password
    role: "admin"
  },
  {
    username: "editor",
    password: "$2b$10$1234567890abcd...", // hashed password
    role: "editor"
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