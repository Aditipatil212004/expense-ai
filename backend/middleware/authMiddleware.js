const jwt = require("jsonwebtoken");

module.exports = (req, res, next) => {
  console.log("🔐 Auth Middleware:");
  console.log("   Headers:", Object.keys(req.headers));
  
  const authHeader = req.headers.authorization;
  console.log("   Authorization header:", authHeader ? "Present" : "Missing");

  if (!authHeader) {
    console.error("❌ No authorization header");
    return res.status(401).json({ message: "Authorization header missing" });
  }

  let token = authHeader;
  if (authHeader.toLowerCase().startsWith("bearer ")) {
    token = authHeader.slice(7).trim();
    console.log("   Extracted token from Bearer:", token.substring(0, 20) + "...");
  }

  if (!token) {
    console.error("❌ Token is empty");
    return res.status(401).json({ message: "Token missing" });
  }

  try {
    console.log("   Verifying JWT...");
    const decoded = jwt.verify(token, "secret");
    console.log("   ✅ JWT verified!");
    console.log("   Decoded user:", decoded);
    req.user = decoded;
    next();
  } catch (err) {
    console.error("❌ JWT verification failed:");
    console.error("   Error:", err.message);
    return res.status(401).json({ message: "Invalid or expired token" });
  }
};