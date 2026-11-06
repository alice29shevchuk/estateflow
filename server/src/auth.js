import jwt from "jsonwebtoken";
import { db } from "./data.js";

const SECRET = process.env.JWT_SECRET || "change-me-in-production";

export function signToken(user) {
  return jwt.sign({ sub: user.id }, SECRET, { expiresIn: "7d" });
}

// Express/Apollo context: resolve the current user from the Authorization header.
export function buildContext({ req }) {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;
  let user = null;
  if (token) {
    try {
      const payload = jwt.verify(token, SECRET);
      user = db.users.find((u) => u.id === payload.sub) || null;
    } catch {
      user = null; // invalid/expired token -> treat as anonymous
    }
  }
  return { user };
}

export function requireUser(ctx) {
  if (!ctx.user) throw new Error("Not authenticated");
  return ctx.user;
}
