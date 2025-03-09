const jwt = require("jsonwebtoken");

const verifyToken = (req, res, next) => {
  const token = req.header("Authorization")?.split(" ")[1];
  if (!token) {
    console.log("No token provided.");
    return res.status(401).json({ error: "Access denied. No token provided." });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.userId = decoded.userId;
    console.log("Token decoded:", decoded); // Log decoded token
    next();
  } catch (err) {
    console.error("❌ Invalid token:", err);
    res.status(400).json({ error: "Invalid token" });
  }
};

module.exports = verifyToken;
