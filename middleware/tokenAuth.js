import jwt from "jsonwebtoken";

const tokenAuth = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization || req.headers.Authorization;
    let token = null;

    if (authHeader && authHeader.startsWith("Bearer ")) {
      token = authHeader.split(" ")[1];
    } else if (req.headers["x-access-token"]) {
      token = req.headers["x-access-token"];
    } else if (req.cookies && req.cookies.token) {
      token = req.cookies.token;
    }

    if (!token) {
      return res.status(401).json({
        status: false,
        message: "Access denied. No token provided.",
      });
    }

    const secret = process.env.JWTWEB_KEY;
    if (!secret) {
      console.error("JWT_SECRET is not set in environment");
      return res.status(500).json({
        status: false,
        message: "Server configuration error",
      });
    }
    const decoded = jwt.verify(token, secret);

    req.users = decoded;

    next();
  } catch (err) {
    if (err.name === "TokenExpiredError") {
      return res.status(401).json({ status: false, message: "Token expired" });
    }
    if (err.name === "JsonWebTokenError") {
      return res.status(401).json({ status: false, message: "Invalid token" });
    }

    console.error("Auth middleware error:", err);
    return res.status(500).json({ status: false, message: "Server error" });
  }
};

export default tokenAuth;
