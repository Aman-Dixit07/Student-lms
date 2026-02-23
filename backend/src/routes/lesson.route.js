import express from "express";
import { protectRoute, isInstructor } from "../middleware/auth.middleware.js";
import upload from "../middleware/upload.middleware.js";
import {
  createLesson,
  getCourseLessons,
  getLessonById,
  deleteLesson,
} from "../controllers/lesson.controller.js";

const router = express.Router();

//lesson routes for student
router.get("/course/:courseId", protectRoute, getCourseLessons);
router.get("/:id", protectRoute, getLessonById);

//lesson route for instructor
router.post(
  "/course/:courseId",
  protectRoute,
  isInstructor,
  upload.fields([
    { name: "video", maxCount: 1 },
    { name: "pdf", maxCount: 1 },
    { name: "thumbnail", maxCount: 1 },
  ]),
  createLesson,
);

router.delete("/:id", protectRoute, isInstructor, deleteLesson);

export default router;
