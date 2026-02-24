import jwt from "jsonwebtoken";
import prisma from "../utils/db.js";

export const protectRoute = async (req, res, next) => {
  try {
    let token = req.cookies?.jwt;

    // Fallback to Bearer token if third-party cookies are blocked by browser
    if (!token && req.headers.authorization?.startsWith("Bearer ")) {
      token = req.headers.authorization.split(" ")[1];
    }

    if (!token) {
      return res.status(401).json({ error: "No authentication token found" });
    }
    const decodedToken = jwt.verify(token, process.env.JWT_SECRET_KEY);

    const user = await prisma.user.findUnique({
      where: { id: decodedToken.userId },
    });

    if (!user) {
      return res.status(401).json({ error: "User no longer exists" });
    }

    req.user = user;
    next();
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({ error: "Token has expired" });
    }
    if (error.name === "JsonWebTokenError") {
      return res.status(401).json({ error: "Invalid token" });
    }
    res.status(401).json({ error: "Authentication failed" });
  }
};

//check if user is instructor
export const isInstructor = (req, res, next) => {
  if (req.user.role !== "INSTRUCTOR") {
    return res.status(403).json({ error: "Access denied, Instructor only" });
  }
  next();
};

//check if user is student
export const isStudent = (req, res, next) => {
  if (req.user.role !== "STUDENT") {
    return res.status(403).json({ error: "Access denied, Student only" });
  }
  next();
};
