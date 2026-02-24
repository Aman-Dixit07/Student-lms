"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/navbar/Navbar";
import useAuthStore from "@/store/authStore";
import useCourseStore from "@/store/courseStore";
import useEnrollmentStore from "@/store/enrollmentStore";
import UpdateCourseModal from "@/components/modals/UpdateCourseModal";
import CreateCourseModal from "@/components/modals/CreateCourseModal";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { BookOpen, Trash2, Edit, Users, Award, Eye } from "lucide-react";
import { dashboardAPI } from "@/utils/api";
import toast from "react-hot-toast";

export default function DashboardPage() {
  const { authUser } = useAuthStore();

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      {authUser?.role === "INSTRUCTOR" ? (
        <InstructorDashboard />
      ) : (
        <StudentDashboard />
      )}
    </div>
  );
}

// Student dashboard

function StudentDashboard() {
  const { enrolledCourses, fetchEnrolledCourses, isLoading } =
    useEnrollmentStore();
  const router = useRouter();

  useEffect(() => {
    fetchEnrolledCourses();
  }, []);

  if (isLoading) {
    return <DashboardSkeleton />;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">My Courses</h1>
        <p className="text-gray-600">Continue your learning journey</p>
      </div>

      {enrolledCourses.length === 0 ? (
        <EmptyState
          title="No courses yet"
          description="Start learning by enrolling in a course"
          buttonText="Browse Courses"
          onClick={() => router.push("/")}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {enrolledCourses.map((enrollment) => (
            <Card
              key={enrollment.enrollmentId}
              className="hover:shadow-lg transition-shadow"
            >
              <CardHeader className="p-0">
                {enrollment.course.thumbnailUrl ? (
                  <img
                    src={enrollment.course.thumbnailUrl}
                    alt={enrollment.course.title}
                    className="w-full h-48 object-cover rounded-t-lg"
                  />
                ) : (
                  <div className="w-full h-48 bg-gradient-to-br from-blue-500 to-purple-600 rounded-t-lg flex items-center justify-center">
                    <BookOpen className="h-16 w-16 text-white" />
                  </div>
                )}
              </CardHeader>
              <CardContent className="p-6">
                <CardTitle className="mb-2 line-clamp-1">
                  {enrollment.course.title}
                </CardTitle>
                <CardDescription className="line-clamp-2 mb-4">
                  {enrollment.course.description}
                </CardDescription>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>Progress</span>
                    <span className="font-semibold">
                      {enrollment.progress.percentage}%
                    </span>
                  </div>
                  <Progress
                    value={enrollment.progress.percentage}
                    className="h-2"
                  />
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>
                      {enrollment.progress.completedLessons} /{" "}
                      {enrollment.progress.totalLessons} lessons
                    </span>
                    {enrollment.progress.percentage === 100 && (
                      <Badge className="bg-green-500">
                        <Award className="h-3 w-3 mr-1" />
                        Completed
                      </Badge>
                    )}
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button
                  className="w-full"
                  onClick={() =>
                    router.push(`/courses/${enrollment.course.id}`)
                  }
                >
                  Continue Learning
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

// Instructor Dashboard

function InstructorDashboard() {
  const { courses, fetchInstructorCourses, deleteCourse, isLoading } =
    useCourseStore();
  const [updateModalOpen, setUpdateModalOpen] = useState(false);
  const [progressModalOpen, setProgressModalOpen] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [dashboardData, setDashboardData] = useState([]);
  const [selectedCourseProgress, setSelectedCourseProgress] = useState(null);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    fetchInstructorCourses();
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const data = await dashboardAPI.instructor();
      setDashboardData(data);
    } catch (error) {
      toast.error("Failed to fetch dashboard data");
    }
  };

  const handleDelete = async (courseId) => {
    if (confirm("Delete this course? All lessons will be deleted too.")) {
      const success = await deleteCourse(courseId);
      if (success) {
        fetchDashboardData();
      }
    }
  };

  const handleUpdateClick = (course) => {
    setSelectedCourse(course);
    setUpdateModalOpen(true);
  };

  const handleViewProgress = (courseId) => {
    const courseData = dashboardData.find((c) => c.courseId === courseId);
    setSelectedCourseProgress(courseData);
    setProgressModalOpen(true);
  };

  if (isLoading) {
    return <DashboardSkeleton />;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">My Courses</h1>
          <p className="text-gray-600">
            Manage your courses and track student progress
          </p>
        </div>
        <CreateCourseModal
          open={createModalOpen}
          onOpenChange={setCreateModalOpen}
          hideTrigger
        />
      </div>

      {courses.length === 0 ? (
        <EmptyState
          title="No courses yet"
          description="Create your first course to get started"
          buttonText="Create Course"
          onClick={() => setCreateModalOpen(true)}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.map((course) => {
            const courseStats = dashboardData.find(
              (c) => c.courseId === course.id,
            );

            return (
              <Card
                key={course.id}
                className="hover:shadow-lg transition-shadow"
              >
                <CardHeader className="p-0">
                  {course.thumbnailUrl ? (
                    <img
                      src={course.thumbnailUrl}
                      alt={course.title}
                      className="w-full h-48 object-cover rounded-t-lg"
                    />
                  ) : (
                    <div className="w-full h-48 bg-gradient-to-br from-blue-500 to-purple-600 rounded-t-lg flex items-center justify-center">
                      <BookOpen className="h-16 w-16 text-white" />
                    </div>
                  )}
                </CardHeader>
                <CardContent className="p-6">
                  <CardTitle className="mb-2 line-clamp-1">
                    {course.title}
                  </CardTitle>
                  <CardDescription className="line-clamp-2 mb-4">
                    {course.description}
                  </CardDescription>
                  <div className="grid grid-cols-2 gap-2 text-sm text-gray-600">
                    <div className="flex items-center gap-1">
                      <BookOpen className="h-4 w-4" />
                      <span>{course._count?.lessons ?? 0} Lessons</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Users className="h-4 w-4" />
                      <span>{course._count?.enrollments ?? 0} Students</span>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="flex flex-wrap gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleViewProgress(course.id)}
                    disabled={!courseStats || courseStats.totalStudents === 0}
                  >
                    <Eye className="h-4 w-4 mr-1" />
                    Progress
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleUpdateClick(course)}
                  >
                    <Edit className="h-4 w-4 mr-1" />
                    Edit
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => router.push(`/courses/${course.id}`)}
                  >
                    View
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    className="hover:bg-red-700"
                    onClick={() => handleDelete(course.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </CardFooter>
              </Card>
            );
          })}
        </div>
      )}

      {selectedCourse && (
        <UpdateCourseModal
          open={updateModalOpen}
          onOpenChange={setUpdateModalOpen}
          course={selectedCourse}
        />
      )}

      {selectedCourseProgress && (
        <StudentProgressModal
          open={progressModalOpen}
          onOpenChange={setProgressModalOpen}
          courseData={selectedCourseProgress}
        />
      )}
    </div>
  );
}

// Student progress modal

function StudentProgressModal({ open, onOpenChange, courseData }) {
  if (!courseData) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{courseData.courseTitle}</DialogTitle>
          <DialogDescription>
            {courseData.totalStudents} students enrolled •{" "}
            {courseData.totalLessons} lessons
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {courseData.students.length === 0 ? (
            <div className="text-center py-8">
              <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No students enrolled yet</p>
            </div>
          ) : (
            <div className="space-y-3">
              {courseData.students.map((studentData) => (
                <Card key={studentData.student.id}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-semibold">
                          {studentData.student.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-semibold">
                            {studentData.student.name}
                          </p>
                          <p className="text-sm text-gray-500">
                            {studentData.student.email}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold text-blue-600">
                          {studentData.progress.percentage}%
                        </p>
                        {studentData.progress.percentage === 100 && (
                          <Badge className="bg-green-500">Completed</Badge>
                        )}
                      </div>
                    </div>
                    <div className="space-y-1">
                      <div className="flex justify-between text-sm text-gray-600">
                        <span>
                          {studentData.progress.completed} /{" "}
                          {studentData.progress.total} lessons
                        </span>
                        <span className="text-xs text-gray-400">
                          Enrolled:{" "}
                          {new Date(
                            studentData.enrolledAt,
                          ).toLocaleDateString()}
                        </span>
                      </div>
                      <Progress
                        value={studentData.progress.percentage}
                        className="h-2"
                      />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

//Skeletons and other components

function DashboardSkeleton() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="animate-pulse space-y-4">
        <div className="h-8 bg-gray-200 rounded w-1/4"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardHeader>
                <div className="h-48 bg-gray-200 rounded"></div>
              </CardHeader>
              <CardContent>
                <div className="h-6 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}

function EmptyState({ title, description, buttonText, onClick }) {
  return (
    <Card className="text-center py-12">
      <CardContent>
        <BookOpen className="h-16 w-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-semibold mb-2">{title}</h3>
        <p className="text-gray-500 mb-4">{description}</p>
        <Button onClick={onClick}>{buttonText}</Button>
      </CardContent>
    </Card>
  );
}
