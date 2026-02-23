"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/navbar/Navbar";
import useAuthStore from "@/store/authStore";
import useCourseStore from "@/store/courseStore";
import useEnrollmentStore from "@/store/enrollmentStore";
import CreateCourseModal from "@/components/modals/CreateCourseModal";
import UpdateCourseModal from "@/components/modals/UpdateCourseModal";
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
import { BookOpen, Trash2, Edit, Users, Award } from "lucide-react";
import { useState } from "react";

export default function DashboardPage() {
  const { authUser } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    if (!authUser) {
      router.push("/login");
    }
  }, [authUser, router]);

  if (!authUser) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      {authUser.role === "INSTRUCTOR" ? (
        <InstructorDashboard />
      ) : (
        <StudentDashboard />
      )}
    </div>
  );
}

// ========================================
// STUDENT DASHBOARD
// ========================================

function StudentDashboard() {
  const { enrolledCourses, fetchEnrolledCourses, isLoading } =
    useEnrollmentStore();
  const router = useRouter();

  useEffect(() => {
    fetchEnrolledCourses();
  }, []);

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <Card key={i}>
                <CardHeader>
                  <div className="h-6 bg-gray-200 rounded"></div>
                </CardHeader>
                <CardContent>
                  <div className="h-4 bg-gray-200 rounded mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">My Courses</h1>
        <p className="text-gray-600">Continue your learning journey</p>
      </div>

      {enrolledCourses.length === 0 ? (
        <Card className="text-center py-12">
          <CardContent>
            <BookOpen className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No courses yet</h3>
            <p className="text-gray-500 mb-4">
              Start learning by enrolling in a course
            </p>
            <Button onClick={() => router.push("/")}>Browse Courses</Button>
          </CardContent>
        </Card>
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

// ========================================
// INSTRUCTOR DASHBOARD
// ========================================

function InstructorDashboard() {
  const { courses, fetchInstructorCourses, deleteCourse, isLoading } =
    useCourseStore();
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [updateModalOpen, setUpdateModalOpen] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const router = useRouter();

  useEffect(() => {
    fetchInstructorCourses();
  }, []);

  const handleDelete = async (courseId) => {
    if (confirm("Delete this course? All lessons will be deleted too.")) {
      await deleteCourse(courseId);
    }
  };

  const handleUpdateClick = (course) => {
    setSelectedCourse(course);
    setUpdateModalOpen(true);
  };

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <Card key={i}>
                <CardHeader>
                  <div className="h-6 bg-gray-200 rounded"></div>
                </CardHeader>
                <CardContent>
                  <div className="h-4 bg-gray-200 rounded mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">My Courses</h1>
          <p className="text-gray-600">Manage your courses and lessons</p>
        </div>
        <CreateCourseModal
          open={createModalOpen}
          onOpenChange={setCreateModalOpen}
        />
      </div>

      {courses.length === 0 ? (
        <Card className="text-center py-12">
          <CardContent>
            <BookOpen className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No courses yet</h3>
            <p className="text-gray-500 mb-4">
              Create your first course to get started
            </p>
            <Button onClick={() => setCreateModalOpen(true)}>
              Create Course
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.map((course) => (
            <Card key={course.id} className="hover:shadow-lg transition-shadow">
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
              <CardFooter className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1"
                  onClick={() => handleUpdateClick(course)}
                >
                  <Edit className="h-4 w-4 mr-1" />
                  Edit
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1"
                  onClick={() => router.push(`/courses/${course.id}`)}
                >
                  View
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => handleDelete(course.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}

      {selectedCourse && (
        <UpdateCourseModal
          open={updateModalOpen}
          onOpenChange={setUpdateModalOpen}
          course={selectedCourse}
        />
      )}
    </div>
  );
}
