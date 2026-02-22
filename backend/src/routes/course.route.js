import express from "express";
import { protectRoute, isInstructor } from "../middleware/auth.middleware.js";
import {
  getAllCourses,
  getCourseById,
  getCourseWithLessons,
  createCourse,
  getInstructorCourses,
  updateCourse,
  deleteCourse,
} from "../controllers/course.controller.js";
import upload from "../middleware/upload.middleware.js";

const router = express.Router();

//Courses public routes
router.get("/", getAllCourses); //it is used for homePage
router.get("/:id", getCourseById); //it is used for coursePage but with less details

//For enrolled students
router.get("/:id/full", protectRoute, getCourseWithLessons); //to show full course with lessons

//For Instructors
router.post("/", protectRoute, isInstructor, createCourse);
router.get(
  "/instructor/my-courses",
  protectRoute,
  isInstructor,
  upload.single("thumbnail"),
  getInstructorCourses,
);
router.put(
  "/:id",
  protectRoute,
  isInstructor,
  upload.single("thumbnail"),
  updateCourse,
);
router.delete("/:id", protectRoute, isInstructor, deleteCourse);

export default router;
