import { z } from "zod";
import { generateToken } from "../utils/jwt.js";
import bcrypt from "bcrypt";
import prisma from "../utils/db.js";

//zod validation schema
const signupSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters long"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters long"),
  role: z.enum(["STUDENT", "INSTRUCTOR"]),
});

const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters long"),
});

//signup controller
export const signup = async (req, res) => {
  try {
    const validatedData = signupSchema.parse(req.body);

    const existingUser = await prisma.user.findUnique({
      where: { email: validatedData.email },
    });

    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    //Hashing the password using bcrypt
    const hashedPassword = await bcrypt.hash(validatedData.password, 10);

    const user = await prisma.user.create({
      data: {
        name: validatedData.name,
        email: validatedData.email,
        password: hashedPassword,
        role: validatedData.role,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
      },
    });

    const token = generateToken({ userId: user.id, role: user.role }, res);

    res.status(201).json({
      message: "User created successfully",
      user,
      token,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        message: "Validation failed",
        details: error.flatten().fieldErrors,
      });
    }

    console.log("Error in signup controller", error);
    return res.status(500).json({
      message: "Internal server error",
      error: error.message,
    });
  }
};

//login controller
export const login = async (req, res) => {
  try {
    const validatedData = loginSchema.parse(req.body);

    const user = await prisma.user.findUnique({
      where: { email: validatedData.email },
    });

    if (!user) {
      return res.status(400).json({ message: "User not found, please signup" });
    }

    const isPasswordValid = await bcrypt.compare(
      validatedData.password,
      user.password,
    );

    if (!isPasswordValid) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    const token = generateToken({ userId: user.id, role: user.role }, res);

    res.status(200).json({
      message: "User logged in successfully",
      user,
      token,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        message: "Validation failed",
        details: error.flatten().fieldErrors,
      });
    }

    console.log("Error in login controller", error);
    return res.status(500).json({
      message: "Internal server error",
      error: error.message,
    });
  }
};

//logout controller
export const logout = (_, res) => {
  res.cookie("jwt", "", {
    httpOnly: true,
    sameSite: "none",
    secure: true,
    expires: new Date(0),
  });

  res.status(200).json({ message: "User logged out successfully" });
};

//profile controller
export const profile = async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
      },
    });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.status(200).json({ user });
  } catch (error) {
    console.error("Error in profile controller", error);
    return res.status(500).json({ error: "Failed to fetch profile" });
  }
};
