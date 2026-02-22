import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";

import authRoutes from "./routes/auth.routes.js";
import dashboardRoutes from "./routes/dashboard.route.js";
import courseRoutes from "./routes/course.route.js";

dotenv.config();

const app = express();

const Port = process.env.PORT || 3000;

//middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

//routes
app.use("/api/auth", authRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/courses", courseRoutes);

app.listen(Port, () => {
  console.log(`Server is running on port ${Port}`);
});
