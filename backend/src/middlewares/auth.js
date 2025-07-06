import jwt from "jsonwebtoken";

const SECRET = process.env.JWT_SECRET || "supersecretkey";

/**
 * Verifies JWT in:  Authorization: Bearer <token>
 * Attaches { id, characterId, level } to req.user
 */
export default function auth(req, res, next) {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ message: "No token provided" });

  try {
    const decoded = jwt.verify(token, SECRET);

    if (!decoded?.id) {
      return res.status(403).json({ message: "Invalid token payload" });
    }

    req.user = {
      id: decoded.id,
      characterId: decoded.characterId,       // NEW
      level: decoded.level ?? 1,              // keep level handy
    };
    next();
  } catch (err) {
    if (err.name === "TokenExpiredError") {
      return res.status(401).json({ message: "Token expired" });
    }
    console.error("JWT verify error:", err);
    res.status(403).json({ message: "Invalid token" });
  }
}
