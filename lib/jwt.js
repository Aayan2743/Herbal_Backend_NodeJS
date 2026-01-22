import jwt from "jsonwebtoken";

export function generateToken(user) {
  return jwt.sign({ id: user.id, phone: user.phone }, process.env.JWTWEB_KEY, {
    expiresIn: "7d",
  });
}
