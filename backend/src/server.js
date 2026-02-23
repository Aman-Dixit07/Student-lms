import dotenv from "dotenv";
import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";

import authRoutes from "./routes/auth.routes.js";
import dashboardRoutes from "./routes/dashboard.route.js";
import courseRoutes from "./routes/course.route.js";
import lessonRoutes from "./routes/lesson.route.js";
import enrollRoutes from "./routes/enroll.route.js";

dotenv.config();

//initialize app
const app = express();

const Port = process.env.PORT || 3000;

//middleware
app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:3000",
    credentials: true,
  }),
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

//routes
app.use("/api/auth", authRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/courses", courseRoutes);
app.use("/api/lessons", lessonRoutes);
app.use("/api/enrollments", enrollRoutes);

//listening to the app
app.listen(Port, () => {
  console.log(`Server is running on port ${Port}`);
});
