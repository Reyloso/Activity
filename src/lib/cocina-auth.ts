import jwt from "jsonwebtoken";

export type CocinaTokenPayload = { sub: string; name: string };

export function signCocinaSocketToken(payload: CocinaTokenPayload) {
  const secret = process.env.AUTH_SECRET as string;
  return jwt.sign(payload, secret, { expiresIn: "6h" });
}

export function verifyCocinaSocketToken(token: string): CocinaTokenPayload {
  const secret = process.env.AUTH_SECRET as string;
  const decoded = jwt.verify(token, secret);
  if (typeof decoded === "string" || !decoded.sub || !decoded.name) {
    throw new Error("Token inválido");
  }
  return { sub: decoded.sub, name: decoded.name as string };
}
