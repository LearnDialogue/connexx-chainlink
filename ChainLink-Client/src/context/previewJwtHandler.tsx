import jwt from "jsonwebtoken";

// Brenda is working on encoding

/**
 * Verifies jwt token and returns decoded object
 *
 * @param {(string | null)} token
 *  Token to be verified
 *
 * @returns {(string | jwt.JwtPayload | null)} null or jwt.JwtPayload or string upon successful verification
 */
export function verifyPreviewJWT(
  token: string | null
): string | jwt.JwtPayload | null {
  try {
    if (!token) {
      throw new Error(`Nonexistent preview token`);
    }
    return jwt.verify(token, import.meta.env.SECRET);
  } catch (error) {
    console.error("Invalid token:", error);
    return null;
  }
}
