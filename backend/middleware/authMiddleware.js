const jwt = require("jsonwebtoken");
const UserModel = require("../models/UserModel");

const protect = async (req, res, next) => {
  const token = req.cookies?.token; // <-- cookie, not header
  if (!token) {
    return res.status(401).json({ error: "Not authorized" });
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await UserModel.findById(decoded.id).select("-password");
    if (!req.user) {
      return res.status(401).json({ error: "User no longer exists" });
    }
    next();
  } catch (err) {
    return res.status(401).json({ error: "Not authorized" });
  }
};

module.exports = { protect };