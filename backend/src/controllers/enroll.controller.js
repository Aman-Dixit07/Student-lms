import prisma from "../utils/db.js";

//to enroll in a course
export const enrollCourse = async (req, res) => {
  try {
    const { courseId } = req.params;
    const studentId = req.user.id;

    const course = await prisma.course.findUnique({
      where: { id: courseId },
      select: {
        id: true,
        title: true,
        description: true,
        thumbnailUrl: true,
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

    if (course.instructor.id === studentId) {
      return res
        .status(400)
        .json({ error: "Instructors cannot enroll in their own courses" });
    }

    const existingEnrollment = await prisma.enrollment.findUnique({
      where: {
        studentId_courseId: { studentId, courseId },
      },
    });

    if (existingEnrollment) {
      return res.status(400).json({ error: "Already enrolled in this course" });
    }

    const enrollment = await prisma.enrollment.create({
      data: { studentId, courseId },
      include: {
        course: {
          select: {
            id: true,
            title: true,
            description: true,
            thumbnailUrl: true,
            instructor: {
              select: { name: true },
            },
          },
        },
      },
    });

    res.status(201).json({
      message: "Enrolled successfully",
      enrollment,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to enroll in course" });
  }
};

//student enrolled courses
export const getEnrolledCourses = async (req, res) => {
  try {
    const studentId = req.user.id;

    const enrollments = await prisma.enrollment.findMany({
      where: { studentId },
      include: {
        course: {
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
              },
            },
          },
        },
      },
      orderBy: { enrolledAt: "desc" },
    });

    const coursesWithProgress = await Promise.all(
      enrollments.map(async (enrollment) => {
        const totalLessons = enrollment.course.lessons.length;

        const completedLessons = await prisma.progress.count({
          where: {
            studentId,
            lesson: { courseId: enrollment.course.id },
            isCompleted: true,
          },
        });

        const progressPercentage =
          totalLessons > 0
            ? Math.round((completedLessons / totalLessons) * 100)
            : 0;

        return {
          enrollmentId: enrollment.id,
          enrolledAt: enrollment.enrolledAt,
          course: {
            id: enrollment.course.id,
            title: enrollment.course.title,
            description: enrollment.course.description,
            thumbnailUrl: enrollment.course.thumbnailUrl,
            createdAt: enrollment.course.createdAt,
            instructor: {
              id: enrollment.course.instructor.id,
              name: enrollment.course.instructor.name,
            },
          },
          progress: {
            totalLessons,
            completedLessons,
            percentage: progressPercentage,
          },
        };
      }),
    );

    res.json(coursesWithProgress);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch enrolled courses" });
  }
};

//toggle mark and unmark lesson
export const toggleLessonComplete = async (req, res) => {
  try {
    const { lessonId } = req.params;
    const studentId = req.user.id;

    const lesson = await prisma.lesson.findUnique({
      where: { id: lessonId },
      select: {
        id: true,
        title: true,
        courseId: true,
      },
    });

    if (!lesson) {
      return res.status(404).json({ error: "Lesson not found" });
    }

    const enrollment = await prisma.enrollment.findUnique({
      where: {
        studentId_courseId: {
          studentId,
          courseId: lesson.courseId,
        },
      },
    });

    if (!enrollment) {
      return res.status(403).json({ error: "Not enrolled in this course" });
    }

    const existingProgress = await prisma.progress.findUnique({
      where: {
        studentId_lessonId: { studentId, lessonId },
      },
    });

    if (existingProgress) {
      const updatedProgress = await prisma.progress.update({
        where: {
          studentId_lessonId: { studentId, lessonId },
        },
        data: {
          isCompleted: !existingProgress.isCompleted,
          completedAt: !existingProgress.isCompleted ? new Date() : null,
        },
      });

      return res.json({
        message: updatedProgress.isCompleted
          ? "Lesson marked as complete"
          : "Lesson marked as incomplete",
        isCompleted: updatedProgress.isCompleted,
        completedAt: updatedProgress.completedAt,
      });
    } else {
      const newProgress = await prisma.progress.create({
        data: {
          studentId,
          lessonId,
          isCompleted: true,
          completedAt: new Date(),
        },
      });

      return res.json({
        message: "Lesson marked as complete",
        isCompleted: true,
        completedAt: newProgress.completedAt,
      });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to toggle lesson completion" });
  }
};

//course progress status
export const getCourseProgress = async (req, res) => {
  try {
    const { courseId } = req.params;
    const studentId = req.user.id;

    const enrollment = await prisma.enrollment.findUnique({
      where: {
        studentId_courseId: { studentId, courseId },
      },
    });

    if (!enrollment) {
      return res.status(403).json({ error: "Not enrolled in this course" });
    }

    const course = await prisma.course.findUnique({
      where: { id: courseId },
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

    const progressRecords = await prisma.progress.findMany({
      where: {
        studentId,
        lesson: { courseId },
      },
      select: {
        lessonId: true,
        isCompleted: true,
        completedAt: true,
      },
    });

    const progressMap = {};
    progressRecords.forEach((p) => {
      progressMap[p.lessonId] = {
        isCompleted: p.isCompleted,
        completedAt: p.completedAt,
      };
    });

    const lessonsWithStatus = lessons.map((lesson) => ({
      ...lesson,
      isCompleted: progressMap[lesson.id]?.isCompleted || false,
      completedAt: progressMap[lesson.id]?.completedAt || null,
    }));

    const completedCount = progressRecords.filter((p) => p.isCompleted).length;

    const progressPercentage =
      lessons.length > 0
        ? Math.round((completedCount / lessons.length) * 100)
        : 0;

    res.json({
      course,
      lessons: lessonsWithStatus,
      progress: {
        total: lessons.length,
        completed: completedCount,
        percentage: progressPercentage,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch course progress" });
  }
};
