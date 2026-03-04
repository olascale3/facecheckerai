import { createHmac, timingSafeEqual } from "crypto";

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "admin123";
const TOKEN_SECRET = process.env.SESSION_SECRET || "fallback-secret";
const TOKEN_EXPIRY_MS = 24 * 60 * 60 * 1000;

let loginAttempts = 0;
let lastAttemptReset = Date.now();

export function checkRateLimit(): boolean {
  if (Date.now() - lastAttemptReset > 60000) {
    loginAttempts = 0;
    lastAttemptReset = Date.now();
  }
  if (loginAttempts >= 10) {
    return false;
  }
  loginAttempts++;
  return true;
}

export function resetAttempts() {
  loginAttempts = 0;
}

export function verifyPassword(password: string): boolean {
  return password === ADMIN_PASSWORD;
}

export function generateAdminToken(): string {
  const expiry = String(Date.now() + TOKEN_EXPIRY_MS);
  const signature = createHmac("sha256", TOKEN_SECRET)
    .update(expiry)
    .digest("hex");
  return `${Buffer.from(expiry).toString("base64")}.${signature}`;
}

export function isValidAdminToken(token: string): boolean {
  const parts = token.split(".");
  if (parts.length !== 2) return false;
  try {
    const payload = Buffer.from(parts[0], "base64").toString();
    const expectedSig = createHmac("sha256", TOKEN_SECRET)
      .update(payload)
      .digest("hex");
    const sigBuf = Buffer.from(parts[1], "hex");
    const expectedBuf = Buffer.from(expectedSig, "hex");
    if (sigBuf.length !== expectedBuf.length) return false;
    if (!timingSafeEqual(sigBuf, expectedBuf)) return false;
    const expiry = parseInt(payload, 10);
    return !isNaN(expiry) && Date.now() <= expiry;
  } catch {
    return false;
  }
}

export function validateAdminRequest(
  authHeader: string | null
): boolean {
  if (!authHeader || !authHeader.startsWith("Bearer ")) return false;
  const token = authHeader.slice(7);
  return isValidAdminToken(token);
}
