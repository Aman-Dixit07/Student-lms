import prisma from "../utils/db.js";
import { z } from "zod";
import cloudinary from "../utils/cloudinary.js";
import streamifier from "streamifier";

//validation schema for course
const courseSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters long"),
  description: z
    .string()
    .min(10, "Description must be at least 10 characters long"),
});

//Helper for cloudinary
const uploadToCloudinary = (buffer, folder, resourceType = "auto") => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: resourceType,
      },
      (error, result) => {
        if (error) reject(error);
        else resolve(result);
      },
    );
    streamifier.createReadStream(buffer).pipe(uploadStream);
  });
};

//here we are getting all the cources to display on homepage
export const getAllCourses = async (_, res) => {
  try {
    const courses = await prisma.course.findMany({
      select: {
        id: true,
        title: true,
        description: true,
        thumbnailUrl: true,
        instructor: {
          select: {
            name: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    res.status(200).json(courses);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch courses" });
  }
};

//to open a cource with less details
export const getCourseById = async (req, res) => {
  try {
    const { id } = req.params;

    const course = await prisma.course.findUnique({
      where: { id },
      select: {
        id: true,
        title: true,
        description: true,
        thumbnailUrl: true,
        createdAt: true,
        instructor: {
          select: {
            id: true,
            name: true,
          },
        },
        _count: {
          select: {
            lessons: true,
            enrollments: true,
          },
        },
      },
    });

    if (!course) {
      return res.status(404).json({ error: "Course not found" });
    }

    res.status(200).json(course);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch course" });
  }
};

//to open a cource with full details - (by student)
export const getCourseWithLessons = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const course = await prisma.course.findUnique({
      where: { id },
      include: {
        instructor: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    if (!course) {
      return res.status(404).json({ error: "Course not found" });
    }

    //checking if the user is instructor
    const isInstructor = course.instructorId === userId;

    //checking if the user is enrolled
    const enrollment = await prisma.enrollment.findUnique({
      where: {
        studentId_courseId: {
          studentId: userId,
          courseId: id,
        },
      },
    });

    if (!isInstructor && !enrollment) {
      return res.status(403).json({
        error: "You must enroll in this course to view lessons",
      });
    }

    // User is authorized - return full course with lessons
    const fullCourse = await prisma.course.findUnique({
      where: { id },
      select: {
        id: true,
        title: true,
        description: true,
        thumbnailUrl: true,
        createdAt: true,
        instructor: {
          select: {
            id: true,
            name: true,
          },
        },
        lessons: {
          select: {
            id: true,
            title: true,
            description: true,
            contentType: true,
            contentUrl: true,
            thumbnailUrl: true,
            order: true,
            createdAt: true,
          },
          orderBy: { order: "asc" },
        },
        _count: {
          select: {
            lessons: true,
            enrollments: true,
          },
        },
      },
    });

    res.json(fullCourse);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch course" });
  }
};

//to create a course by instructor
export const createCourse = async (req, res) => {
  try {
    const validatedData = courseSchema.parse(req.body);

    let thumbnailUrl = null;

    //uploading thumbnail to cloudinary
    if (req.file) {
      const result = await uploadToCloudinary(
        req.file.buffer,
        "course_thumbnails",
      );
      thumbnailUrl = result.secure_url;
    }

    const course = await prisma.course.create({
      data: {
        title: validatedData.title,
        description: validatedData.description,
        thumbnailUrl,
        instructorId: req.user.id,
      },
      select: {
        id: true,
        title: true,
        description: true,
        thumbnailUrl: true,
        createdAt: true,
        instructor: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    res.status(201).json({
      message: "Course created successfully",
      course,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        error: "Validation failed",
        details: error.errors,
      });
    }
    console.error(error);
    res.status(500).json({ error: "Failed to create course" });
  }
};

//to get all the courses of an instructor
export const getInstructorCourses = async (req, res) => {
  try {
    const courses = await prisma.course.findMany({
      where: { instructorId: req.user.id },
      select: {
        id: true,
        title: true,
        description: true,
        thumbnailUrl: true,
        createdAt: true,
        _count: {
          select: {
            lessons: true,
            enrollments: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    res.json(courses);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch courses" });
  }
};

//to update a course
export const updateCourse = async (req, res) => {
  try {
    const { id } = req.params;
    const validatedData = courseSchema.parse(req.body);

    const course = await prisma.course.findUnique({
      where: { id },
    });

    if (!course) {
      return res.status(404).json({ error: "Course not found" });
    }

    if (course.instructorId !== req.user.id) {
      return res
        .status(403)
        .json({ error: "You are not authorized to update this course" });
    }

    const updateCourse = {
      title: validatedData.title,
      description: validatedData.description,
    };

    // Upload new thumbnail if provided
    if (req.file) {
      const thumbnailResult = await uploadToCloudinary(
        req.file.buffer,
        "lms/course-thumbnails",
        "image",
      );
      updateCourse.thumbnailUrl = thumbnailResult.secure_url;
    }

    const updatedCourse = await prisma.course.update({
      where: { id },
      data: updateCourse,
      select: {
        id: true,
        title: true,
        description: true,
        thumbnailUrl: true,
        createdAt: true,
        instructor: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    res.json({
      message: "Course updated successfully",
      course: updatedCourse,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        error: "Validation failed",
        details: error.errors,
      });
    }
    console.error(error);
    res.status(500).json({ error: "Failed to update course" });
  }
};

//to delete a course
export const deleteCourse = async (req, res) => {
  try {
    const { id } = req.params;

    const course = await prisma.course.findUnique({
      where: { id },
    });

    if (!course) {
      return res.status(404).json({ error: "Course not found" });
    }

    // Checking  ownership
    if (course.instructorId !== req.user.id) {
      return res
        .status(403)
        .json({ error: "Not authorized to delete this course" });
    }

    await prisma.course.delete({ where: { id } });

    res.json({ message: "Course deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to delete course" });
  }
};
