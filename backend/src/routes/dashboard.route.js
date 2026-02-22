import express from "express";
import {
  studentDashboard,
  instructorDashboard,
} from "../controllers/dashboard.controller.js";
import {
  protectRoute,
  isStudent,
  isInstructor,
} from "../middleware/auth.middleware.js";

const router = express.Router();

router.get("/student", protectRoute, isStudent, studentDashboard);
router.get("/instructor", protectRoute, isInstructor, instructorDashboard);

export default router;
