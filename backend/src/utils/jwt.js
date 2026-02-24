import jwt from "jsonwebtoken";

export const generateToken = (payload, res) => {
  const token = jwt.sign(payload, process.env.JWT_SECRET_KEY, {
    expiresIn: "7d",
  });

  res.cookie("jwt", token, {
    httpOnly: true,
    sameSite: "none",
    secure: true,
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  });

  return token;
};
