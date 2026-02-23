"use client";

import { useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Navbar from "@/components/navbar/Navbar";
import useAuthStore from "@/store/authStore";
import useCourseStore from "@/store/courseStore";
import useEnrollmentStore from "@/store/enrollmentStore";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { BookOpen, Users, Clock, CheckCircle } from "lucide-react";

export default function CourseDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const { authUser } = useAuthStore();
  const { selectedCourse, fetchCourse, isLoading } = useCourseStore();
  const {
    enrollCourse,
    isEnrolled,
    fetchEnrolledCourses,
    isLoading: enrolling,
  } = useEnrollmentStore();

  useEffect(() => {
    fetchCourse(params.id);
    if (authUser) {
      fetchEnrolledCourses();
    }
  }, [params.id, authUser]);

  const handleEnroll = async () => {
    if (!authUser) {
      router.push("/login");
      return;
    }

    if (authUser.role === "INSTRUCTOR") {
      return;
    }

    const success = await enrollCourse(params.id);
    if (success) {
      router.push("/dashboard");
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-4xl mx-auto px-4 py-12">
          <Card className="animate-pulse">
            <CardHeader>
              <div className="h-64 bg-gray-200 rounded"></div>
            </CardHeader>
            <CardContent>
              <div className="h-8 bg-gray-200 rounded w-3/4 mb-4"></div>
              <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-full"></div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (!selectedCourse) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-4xl mx-auto px-4 py-12 text-center">
          <p className="text-gray-500">Course not found</p>
        </div>
      </div>
    );
  }

  const enrolled = isEnrolled(params.id);
  const isInstructor = authUser?.role === "INSTRUCTOR";
  const isOwner = authUser?.id === selectedCourse.instructor.id;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-4xl mx-auto px-4 py-12">
        <Card className="overflow-hidden">
          {/* Course Thumbnail */}
          <div className="relative h-64 bg-gradient-to-br from-blue-500 to-purple-600">
            {selectedCourse.thumbnailUrl ? (
              <img
                src={selectedCourse.thumbnailUrl}
                alt={selectedCourse.title}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <BookOpen className="h-24 w-24 text-white" />
              </div>
            )}
          </div>

          <CardHeader>
            <div className="flex justify-between items-start mb-2">
              <Badge variant="secondary">Course</Badge>
              {enrolled && (
                <Badge className="bg-green-500">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Enrolled
                </Badge>
              )}
            </div>
            <CardTitle className="text-3xl">{selectedCourse.title}</CardTitle>
            <CardDescription className="text-base">
              By {selectedCourse.instructor.name}
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Course Stats */}
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center gap-2 text-gray-600">
                <BookOpen className="h-5 w-5" />
                <span>{selectedCourse._count.lessons} Lessons</span>
              </div>
              <div className="flex items-center gap-2 text-gray-600">
                <Users className="h-5 w-5" />
                <span>{selectedCourse._count.enrollments} Students</span>
              </div>
            </div>

            <Separator />

            {/* Description */}
            <div>
              <h3 className="text-lg font-semibold mb-2">About this course</h3>
              <p className="text-gray-700 leading-relaxed">
                {selectedCourse.description}
              </p>
            </div>

            <Separator />

            {/* Course Info */}
            <div>
              <h3 className="text-lg font-semibold mb-2">Course Details</h3>
              <div className="space-y-2 text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  <span>
                    Created on{" "}
                    {new Date(selectedCourse.createdAt).toLocaleDateString(
                      "en-US",
                      {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      },
                    )}
                  </span>
                </div>
              </div>
            </div>

            {/* Enroll/View Button */}
            <div className="pt-4">
              {isOwner ? (
                <Button
                  onClick={() => router.push("/dashboard")}
                  className="w-full"
                  size="lg"
                >
                  Manage Course
                </Button>
              ) : enrolled ? (
                <Button
                  onClick={() => router.push("/dashboard")}
                  className="w-full"
                  size="lg"
                >
                  Go to Course
                </Button>
              ) : (
                <Button
                  onClick={handleEnroll}
                  disabled={enrolling || isInstructor}
                  className="w-full"
                  size="lg"
                >
                  {enrolling ? "Enrolling..." : "Enroll Now"}
                </Button>
              )}

              {isInstructor && !isOwner && (
                <p className="text-sm text-gray-500 text-center mt-2">
                  Instructors cannot enroll in courses
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
