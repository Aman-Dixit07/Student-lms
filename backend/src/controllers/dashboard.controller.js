import prisma from "../utils/db.js";

//student dashboard controller
export const studentDashboard = async (req, res) => {
  try {
    const studentId = req.user.id;

    const enrollments = await prisma.enrollment.findMany({
      where: {
        studentId,
      },
      include: {
        course: {
          include: {
            instructor: {
              select: {
                name: true,
              },
            },
            lessons: true,
          },
        },
      },
      orderBy: {
        enrolledAt: "desc",
      },
    });

    //here we calculate progress done by the student for each cource
    const coursesWithProgress = await Promise.all(
      enrollments.map(async (enrollment) => {
        const totalLessons = enrollment.course.lessons.length;

        const completedLessons = await prisma.progress.count({
          where: {
            studentId,
            lesson: {
              courseId: enrollment.courseId,
            },
            isCompleted: true,
          },
        });

        const progressPercentage =
          totalLessons > 0
            ? Math.round((completedLessons / totalLessons) * 100)
            : 0;

        return {
          courseId: enrollment.course.id,
          courseTitle: enrollment.course.title,
          courseDescription: enrollment.course.description,
          courseThumbnail: enrollment.course.thumbnailUrl,
          instructorName: enrollment.course.instructor.name,
          enrolledAt: enrollment.enrolledAt,
          progress: {
            total: totalLessons,
            completed: completedLessons,
            percentage: progressPercentage,
          },
        };
      }),
    );

    res.json({
      totalEnrolledCourses: enrollments.length,
      courses: coursesWithProgress,
    });
  } catch (error) {}
};

//instructor dashboard controller
export const instructorDashboard = async (req, res) => {
  try {
    const instructorId = req.user.id;

    //here we are getting all the courses by the instructor
    const courses = await prisma.course.findMany({
      where: {
        instructorId,
      },
      include: {
        enrollments: {
          include: {
            student: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
        lessons: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    //calculating progress of each student in each cource
    const dashboardData = await Promise.all(
      courses.map(async (course) => {
        const studentsProgress = await Promise.all(
          course.enrollments.map(async (enrollment) => {
            const completedLessons = await prisma.progress.count({
              where: {
                studentId: enrollment.studentId,
                lesson: { courseId: course.id },
                isCompleted: true,
              },
            });

            const totalLessons = course.lessons.length;
            const progressPercentage =
              totalLessons > 0
                ? Math.round((completedLessons / totalLessons) * 100)
                : 0;

            return {
              student: enrollment.student,
              enrolledAt: enrollment.enrolledAt,
              progress: {
                completed: completedLessons,
                total: totalLessons,
                percentage: progressPercentage,
              },
            };
          }),
        );

        return {
          courseId: course.id,
          courseTitle: course.title,
          courseDescription: course.description,
          courseThumbnail: course.thumbnailUrl,
          totalLessons: course.lessons.length,
          totalStudents: course.enrollments.length,
          students: studentsProgress,
        };
      }),
    );

    res.json(dashboardData);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch instructor dashboard" });
  }
};
