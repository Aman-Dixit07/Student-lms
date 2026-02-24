"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Navbar from "@/components/navbar/Navbar";
import useAuthStore from "@/store/authStore";
import useLessonStore from "@/store/lessonStore";
import useCourseStore from "@/store/courseStore";
import useEnrollmentStore from "@/store/enrollmentStore";
import AddLessonModal from "@/components/modals/AddLessonModal";
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
import { Progress } from "@/components/ui/progress";
import {
  BookOpen,
  Users,
  Clock,
  CheckCircle,
  Trash2,
  PlayCircle,
  FileText,
  Download,
  ChevronRight,
} from "lucide-react";
import { generateCertificate } from "@/utils/generateCertificate";

export default function CourseDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const { authUser } = useAuthStore();
  const { selectedCourse, fetchCourse, isLoading } = useCourseStore();
  const { lessons, fetchLessons, deleteLesson } = useLessonStore();
  const {
    enrollCourse,
    isEnrolled,
    fetchEnrolledCourses,
    courseProgress,
    fetchCourseProgress,
    isLoading: enrolling,
  } = useEnrollmentStore();

  const [lessonModalOpen, setLessonModalOpen] = useState(false);

  //fetching the course data buy not full data
  useEffect(() => {
    fetchCourse(params.id);
  }, [params.id]);

  //fetching the course all data (if the user is logged in)
  useEffect(() => {
    if (authUser) {
      fetchEnrolledCourses();
      fetchLessons(params.id);
    }
  }, [params.id, authUser]);

  //fetch progress of students
  useEffect(() => {
    if (authUser && authUser.role === "STUDENT") {
      fetchCourseProgress(params.id);
    }
  }, [authUser, params.id]);

  //if the student is not signed in than he will be redirected to the login page first
  const handleEnroll = async () => {
    if (!authUser) {
      router.push("/login");
      return;
    }

    //getting course data after the student enrolls the course
    const success = await enrollCourse(params.id);
    if (success) {
      fetchCourseProgress(params.id);
      fetchLessons(params.id);
    }
  };

  //deleting the lesson
  const handleDeleteLesson = async (e, lessonId) => {
    e.stopPropagation();
    if (confirm("Delete this lesson? This cannot be undone.")) {
      await deleteLesson(lessonId, params.id);
    }
  };

  //if student is enrolled than he will go to thee lesson preview page
  const handleLessonClick = (lessonId) => {
    if (enrolled && !isOwner) {
      router.push(`/lessons/${lessonId}`);
    }
  };

  //certificate download
  const handleDownloadCertificate = () => {
    generateCertificate(authUser.name, selectedCourse.title);
  };

  // Loading state / skeleton
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-6xl mx-auto px-4 py-12">
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
        <div className="max-w-6xl mx-auto px-4 py-12 text-center">
          <BookOpen className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500 text-lg">Course not found</p>
          <Button className="mt-4" onClick={() => router.push("/")}>
            Go Home
          </Button>
        </div>
      </div>
    );
  }

  //here checking if the user is instructor than he cannot view the lessons
  const enrolled = isEnrolled(params.id);
  const isInstructor = authUser?.role === "INSTRUCTOR";
  const isOwner = authUser?.id === selectedCourse.instructor?.id;
  const canViewLessons = isOwner || enrolled;

  //calculating the progress of the student
  const progress = courseProgress?.progress || {
    total: 0,
    completed: 0,
    percentage: 0,
  };
  const isCompleted = progress.percentage === 100 && progress.total > 0;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-6xl mx-auto px-4 py-12">
        {/*Header*/}
        <Card className="overflow-hidden mb-6">
          {/* Thumbnail */}
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
            {/* Badges */}
            <div className="flex justify-between items-start mb-2">
              <Badge variant="secondary">Course</Badge>
              <div className="flex gap-2">
                {enrolled && (
                  <Badge className="bg-green-500">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Enrolled
                  </Badge>
                )}
                {isCompleted && (
                  <Badge className="bg-yellow-500">🏆 Completed</Badge>
                )}
                {isOwner && <Badge className="bg-blue-500">Your Course</Badge>}
              </div>
            </div>

            <CardTitle className="text-3xl">{selectedCourse.title}</CardTitle>
            <CardDescription className="text-base">
              By {selectedCourse.instructor?.name || "Unknown Instructor"}
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Course Stats */}
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center gap-2 text-gray-600">
                <BookOpen className="h-5 w-5" />
                <span>{selectedCourse._count?.lessons || 0} Lessons</span>
              </div>
              <div className="flex items-center gap-2 text-gray-600">
                <Users className="h-5 w-5" />
                <span>{selectedCourse._count?.enrollments || 0} Students</span>
              </div>
            </div>

            <Separator />

            <div>
              <h3 className="text-lg font-semibold mb-2">About this course</h3>
              <p className="text-gray-700 leading-relaxed">
                {selectedCourse.description}
              </p>
            </div>

            <Separator />

            <div>
              <h3 className="text-lg font-semibold mb-2">Course Details</h3>
              <div className="flex items-center gap-2 text-sm text-gray-600">
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

            {/* Progress Bar - Only enrolled students can see */}
            {enrolled && !isOwner && (
              <>
                <Separator />
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="text-lg font-semibold">Your Progress</h3>
                    <span className="text-sm font-semibold text-blue-600">
                      {progress.percentage}%
                    </span>
                  </div>
                  <Progress value={progress.percentage} className="h-3" />
                  <p className="text-sm text-gray-500 mt-2">
                    {progress.completed} of {progress.total} lessons completed
                  </p>
                </div>
              </>
            )}

            {/* Action Buttons */}
            <div className="pt-4 space-y-3">
              {/* Enroll Button - Show only if not enrolled and not owner */}
              {!canViewLessons && (
                <>
                  <Button
                    onClick={handleEnroll}
                    disabled={enrolling || isInstructor}
                    className="w-full"
                    size="lg"
                  >
                    {enrolling ? "Enrolling..." : "Enroll Now"}
                  </Button>
                  {isInstructor && !isOwner && (
                    <p className="text-sm text-gray-500 text-center">
                      Instructors cannot enroll in courses
                    </p>
                  )}
                </>
              )}

              {/* Certificate download */}
              {enrolled && !isOwner && (
                <Button
                  onClick={handleDownloadCertificate}
                  className="w-full"
                  variant="outline"
                  size="lg"
                  disabled={!isCompleted}
                  title={
                    !isCompleted ? "Complete the course to get certificate" : ""
                  }
                >
                  <Download className="h-4 w-4 mr-2" />
                  {isCompleted
                    ? "Download Certificate"
                    : "Complete the course to get certificate"}
                </Button>
              )}

              {/* Manage course - only for Instructor */}
              {isOwner && (
                <Button
                  onClick={() => router.push("/dashboard")}
                  className="w-full"
                  variant="outline"
                  size="lg"
                >
                  Go to Dashboard
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Lessons Section */}
        {canViewLessons && (
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Course Lessons</CardTitle>
                  <CardDescription>
                    {isOwner
                      ? "Manage your course content"
                      : "Click on a lesson to start learning"}
                  </CardDescription>
                </div>
                {isOwner && (
                  <AddLessonModal
                    courseId={params.id}
                    open={lessonModalOpen}
                    onOpenChange={setLessonModalOpen}
                  />
                )}
              </div>
            </CardHeader>

            <CardContent>
              {lessons.length === 0 ? (
                // Empty State
                <div className="text-center py-12">
                  <BookOpen className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No lessons yet</h3>
                  {isOwner ? (
                    <>
                      <p className="text-gray-500 mb-4">
                        Add your first lesson to get started
                      </p>
                      <Button onClick={() => setLessonModalOpen(true)}>
                        Add Lesson
                      </Button>
                    </>
                  ) : (
                    <p className="text-gray-500">
                      The instructor hasn't added any lessons yet
                    </p>
                  )}
                </div>
              ) : (
                <div className="space-y-3">
                  {lessons.map((lesson) => {
                    const lessonProgress = courseProgress?.lessons?.find(
                      (l) => l.id === lesson.id,
                    );
                    const completed = lessonProgress?.isCompleted || false;

                    return (
                      <Card
                        key={lesson.id}
                        className={`transition-all ${
                          completed ? "border-green-500 bg-green-50/30" : ""
                        } ${
                          enrolled && !isOwner
                            ? "cursor-pointer hover:shadow-md hover:border-blue-300"
                            : ""
                        }`}
                        onClick={() => handleLessonClick(lesson.id)}
                      >
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between gap-4">
                            <div className="flex items-center gap-4 flex-1">
                              <div
                                className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center font-semibold ${
                                  completed
                                    ? "bg-green-500 text-white"
                                    : "bg-blue-100 text-blue-600"
                                }`}
                              >
                                {completed ? (
                                  <CheckCircle className="h-5 w-5" />
                                ) : (
                                  lesson.order
                                )}
                              </div>

                              {/* Lesson details */}
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                  <h4 className="font-semibold truncate">
                                    {lesson.title}
                                  </h4>
                                  <Badge
                                    variant="outline"
                                    className="text-xs flex-shrink-0"
                                  >
                                    {lesson.contentType === "video" ? (
                                      <>
                                        <PlayCircle className="h-3 w-3 mr-1" />
                                        Video
                                      </>
                                    ) : (
                                      <>
                                        <FileText className="h-3 w-3 mr-1" />
                                        PDF
                                      </>
                                    )}
                                  </Badge>
                                </div>
                                {lesson.description && (
                                  <p className="text-sm text-gray-600 truncate">
                                    {lesson.description}
                                  </p>
                                )}
                              </div>
                            </div>

                            <div className="flex items-center gap-2 flex-shrink-0">
                              {/* For student to open the lesson*/}
                              {enrolled && !isOwner && (
                                <ChevronRight className="h-5 w-5 text-gray-400" />
                              )}

                              {/* For instructor to delete the lesson*/}
                              {isOwner && (
                                <Button
                                  size="sm"
                                  variant="destructive"
                                  className="hover:bg-red-700"
                                  onClick={(e) =>
                                    handleDeleteLesson(e, lesson.id)
                                  }
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
