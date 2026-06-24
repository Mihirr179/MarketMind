import jwt from "jsonwebtoken";

export function getBearerToken(request) {
  const header = request.headers.get("authorization") || request.headers.get("Authorization");
  if (!header) return null;
  const [scheme, token] = header.split(" ");
  if (scheme !== "Bearer" || !token) return null;
  return token;
}

export function verifyToken(token) {
  if (!token) {
    return { ok: false, message: "Missing token" };
  }

  const secret = process.env.JWT_SECRET;
  if (!secret) {
    return { ok: false, message: "Server not configured: JWT_SECRET missing" };
  }

  try {
    const payload = jwt.verify(token, secret);
    const id = payload && typeof payload === "object" ? payload.id : null;
    const email = payload && typeof payload === "object" ? payload.email : null;
    if (!id) return { ok: false, message: "Invalid token" };
    return { ok: true, userId: id, email };
  } catch {
    return { ok: false, message: "Invalid or expired token" };
  }
}

