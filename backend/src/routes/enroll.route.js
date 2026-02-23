import express from "express";
import { protectRoute } from "../middleware/auth.middleware.js";
import {
  enrollCourse,
  getEnrolledCourses,
  toggleLessonComplete,
  getCourseProgress,
} from "../controllers/enroll.controller.js";

const router = express.Router();

router.get("/my-courses", protectRoute, getEnrolledCourses);
router.post("/lesson/:lessonId/toggle", protectRoute, toggleLessonComplete);
router.get("/course/:courseId/progress", protectRoute, getCourseProgress);

router.post("/:courseId", protectRoute, enrollCourse);

export default router;
