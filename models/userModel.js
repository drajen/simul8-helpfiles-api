const bcrypt = require("bcrypt");

const users = [
  {
    username: "admin",
    password: "$2b$10$qPj6/9pDo3a85Mx3nmLKaeKPXIFQHB4iu5BTlFvh3SjuyuiaN1w06", // hashed password
    role: "admin"
  },
  {
    username: "editor",
    password: "$2b$10$IW2/ss4wP2Bpbmqv0n1WbuIvGN9YEG6OOx7hvjUEZV/SkduOJp62u", // hashed password
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