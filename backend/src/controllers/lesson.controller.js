import prisma from "../utils/db.js";
import z from "zod";
import cloudinary from "../utils/cloudinary.js";
import streamifier from "streamifier";

//validation schema for lesson
const lessonSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters long"),
  description: z.string().optional(),
  contentType: z.enum(["video", "pdf"], {
    errorMap: () => ({ message: "Content type must be either video or pdf" }),
  }),
  order: z.string().transform(Number),
});

//cloudinary helper
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

//create lesson (Instructor only)
export const createLesson = async (req, res) => {
  try {
    const { courseId } = req.params;

    const validatedData = lessonSchema.parse(req.body);

    const course = await prisma.course.findUnique({
      where: { id: courseId },
    });

    if (!course) {
      return res.status(404).json({ error: "Course not found" });
    }

    if (course.instructorId !== req.user.id) {
      return res
        .status(403)
        .json({ error: "Not authorized to add lessons to this course" });
    }

    let contentUrl = null;
    let thumbnailUrl = null;

    if (validatedData.contentType === "video") {
      if (!req.files?.video) {
        return res
          .status(400)
          .json({ error: "Video file is required for video lessons" });
      }

      const videoResult = await uploadToCloudinary(
        req.files.video[0].buffer,
        "lms/videos",
        "video",
      );
      contentUrl = videoResult.secure_url;
    } else if (validatedData.contentType === "pdf") {
      if (!req.files?.pdf) {
        return res
          .status(400)
          .json({ error: "PDF file is required for PDF lessons" });
      }

      const pdfResult = await uploadToCloudinary(
        req.files.pdf[0].buffer,
        "lms/documents",
        "raw",
      );
      contentUrl = pdfResult.secure_url;
    }

    if (req.files?.thumbnail) {
      const thumbnailResult = await uploadToCloudinary(
        req.files.thumbnail[0].buffer,
        "lms/lesson-thumbnails",
        "image",
      );
      thumbnailUrl = thumbnailResult.secure_url;
    }

    const lesson = await prisma.lesson.create({
      data: {
        title: validatedData.title,
        description: validatedData.description || "",
        contentType: validatedData.contentType,
        contentUrl,
        thumbnailUrl,
        order: validatedData.order,
        courseId,
      },
    });

    res.status(201).json({
      message: "Lesson created successfully",
      lesson,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        error: "Validation failed",
        details: error.errors,
      });
    }
    console.error(error);
    res.status(500).json({ error: "Failed to create lesson" });
  }
};

//getting lessons of a course
export const getCourseLessons = async (req, res) => {
  try {
    const { courseId } = req.params;
    const userId = req.user.id;

    const course = await prisma.course.findUnique({
      where: { id: courseId },
    });

    if (!course) {
      return res.status(404).json({ error: "Course not found" });
    }

    const isInstructor = course.instructorId === userId;

    const enrollment = await prisma.enrollment.findUnique({
      where: {
        studentId_courseId: {
          studentId: userId,
          courseId,
        },
      },
    });

    if (!isInstructor && !enrollment) {
      return res.status(403).json({
        error: "You must enroll in this course to view lessons",
      });
    }

    const lessons = await prisma.lesson.findMany({
      where: { courseId },
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
    });

    if (!isInstructor && enrollment) {
      const progressRecords = await prisma.progress.findMany({
        where: {
          studentId: userId,
          lesson: { courseId },
        },
      });

      const progressMap = {};
      progressRecords.forEach((p) => {
        progressMap[p.lessonId] = {
          isCompleted: p.isCompleted,
          completedAt: p.completedAt,
        };
      });

      const lessonsWithProgress = lessons.map((lesson) => ({
        ...lesson,
        isCompleted: progressMap[lesson.id]?.isCompleted || false,
        completedAt: progressMap[lesson.id]?.completedAt || null,
      }));

      return res.json(lessonsWithProgress);
    }

    res.json(lessons);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch lessons" });
  }
};

//get single lesson
export const getLessonById = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const lesson = await prisma.lesson.findUnique({
      where: { id },
      include: {
        course: {
          select: {
            id: true,
            title: true,
            thumbnailUrl: true,
            instructorId: true,
            instructor: {
              select: { id: true, name: true },
            },
          },
        },
      },
    });

    if (!lesson) {
      return res.status(404).json({ error: "Lesson not found" });
    }

    const isInstructor = lesson.course.instructorId === userId;

    const enrollment = await prisma.enrollment.findUnique({
      where: {
        studentId_courseId: {
          studentId: userId,
          courseId: lesson.courseId,
        },
      },
    });

    if (!isInstructor && !enrollment) {
      return res.status(403).json({
        error: "You must enroll in this course to view this lesson",
      });
    }

    let isCompleted = false;
    let completedAt = null;

    if (!isInstructor && enrollment) {
      const progress = await prisma.progress.findUnique({
        where: {
          studentId_lessonId: {
            studentId: userId,
            lessonId: id,
          },
        },
      });

      if (progress) {
        isCompleted = progress.isCompleted;
        completedAt = progress.completedAt;
      }
    }

    res.json({
      ...lesson,
      isCompleted,
      completedAt,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch lesson" });
  }
};

//delete lesson
export const deleteLesson = async (req, res) => {
  try {
    const { id } = req.params;

    const lesson = await prisma.lesson.findUnique({
      where: { id },
      include: { course: true },
    });

    if (!lesson) {
      return res.status(404).json({ error: "Lesson not found" });
    }

    if (lesson.course.instructorId !== req.user.id) {
      return res
        .status(403)
        .json({ error: "Not authorized to delete this lesson" });
    }

    await prisma.lesson.delete({ where: { id } });

    res.json({ message: "Lesson deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to delete lesson" });
  }
};
