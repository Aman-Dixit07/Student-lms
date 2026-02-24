"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Navbar from "@/components/navbar/Navbar";
import useAuthStore from "@/store/authStore";
import useLessonStore from "@/store/lessonStore";
import useEnrollmentStore from "@/store/enrollmentStore";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  CheckCircle,
  Circle,
  ChevronLeft,
  PlayCircle,
  FileText,
  BookOpen,
  Download,
} from "lucide-react";

export default function LessonViewerPage() {
  const params = useParams();
  const router = useRouter();
  const { authUser } = useAuthStore();
  const { currentLesson, fetchLesson, isLoading, clearCurrentLesson } =
    useLessonStore();
  const { courseProgress, fetchCourseProgress, toggleLessonComplete } =
    useEnrollmentStore();

  const [toggling, setToggling] = useState(false);

  //Fetching the lesson data
  useEffect(() => {
    if (authUser) {
      fetchLessonData();
    }

    return () => {
      clearCurrentLesson();
    };
  }, [params.id, authUser]);

  //Fetching the lesson data
  const fetchLessonData = async () => {
    const data = await fetchLesson(params.id);
    if (data && data.courseId) {
      await fetchCourseProgress(data.courseId);
    } else if (!data) {
      router.push("/dashboard");
    }
  };

  //Complete or uncomplete lesson toggle
  const handleToggleComplete = async () => {
    if (!currentLesson) return;

    setToggling(true);
    try {
      await toggleLessonComplete(currentLesson.id, currentLesson.courseId);
    } catch (error) {
      //here the error is handled by the store
    } finally {
      setToggling(false);
    }
  };

  const handleBackToCourse = () => {
    if (currentLesson) {
      router.push(`/courses/${currentLesson.courseId}`);
    } else {
      router.push("/dashboard");
    }
  };

  const handleLessonNavigation = (lessonId) => {
    router.push(`/lessons/${lessonId}`);
  };

  //Download PDF
  const handleDownloadPDF = () => {
    if (currentLesson?.contentUrl) {
      window.open(currentLesson.contentUrl, "_blank");
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-6xl mx-auto px-4 py-8">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-200 rounded w-32"></div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-6">
                <Card>
                  <CardContent className="p-0">
                    <div className="h-96 bg-gray-200 rounded"></div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <div className="h-6 bg-gray-200 rounded w-3/4 mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                  </CardHeader>
                  <CardContent>
                    <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded w-full"></div>
                  </CardContent>
                </Card>
              </div>
              <div className="lg:col-span-1">
                <Card>
                  <CardHeader>
                    <div className="h-6 bg-gray-200 rounded w-1/2"></div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {[1, 2, 3, 4].map((i) => (
                        <div key={i} className="h-16 bg-gray-200 rounded"></div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!currentLesson) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-6xl mx-auto px-4 py-12 text-center">
          <BookOpen className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">Lesson not found</h2>
          <p className="text-gray-500 mb-4">
            This lesson may have been deleted or you don't have access
          </p>
          <Button onClick={() => router.push("/dashboard")}>
            Go to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  //check the progress if lesson is completed
  const lessonProgress = courseProgress?.lessons?.find(
    (l) => l.id === currentLesson.id,
  );
  const isCompleted = lessonProgress?.isCompleted || false;

  const progress = courseProgress?.progress || {
    total: 0,
    completed: 0,
    percentage: 0,
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Back button */}
        <Button variant="ghost" onClick={handleBackToCourse} className="mb-6">
          <ChevronLeft className="h-4 w-4 mr-2" />
          Back to Course
        </Button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Video or PDF preview */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="overflow-hidden">
              <CardContent className="p-0">
                {currentLesson.contentType === "video" ? (
                  // Video player
                  <div
                    className="relative bg-black"
                    style={{ paddingTop: "56.25%" }}
                  >
                    <video
                      key={currentLesson.contentUrl}
                      className="absolute top-0 left-0 w-full h-full"
                      controls
                      controlsList="nodownload"
                      src={currentLesson.contentUrl}
                      preload="metadata"
                    />
                  </div>
                ) : (
                  //PDF
                  <div className="bg-gray-100">
                    <div className="p-4 border-b bg-white flex justify-between items-center">
                      <span className="text-sm text-gray-600">
                        PDF Document
                      </span>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleDownloadPDF}
                      >
                        <Download className="h-4 w-4 mr-2" />
                        Download PDF
                      </Button>
                    </div>
                    {/* I used Google docs viewer to display the PDF */}
                    <iframe
                      key={currentLesson.contentUrl}
                      src={`https://docs.google.com/viewer?url=${encodeURIComponent(currentLesson.contentUrl)}&embedded=true`}
                      className="w-full"
                      style={{ height: "700px", border: "none" }}
                      title={currentLesson.title}
                    />
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Lesson details */}
            <Card>
              <CardHeader>
                <div className="flex flex-wrap items-center gap-2 mb-2">
                  <Badge variant="outline">
                    {currentLesson.contentType === "video" ? (
                      <>
                        <PlayCircle className="h-3 w-3 mr-1" />
                        Video Lesson
                      </>
                    ) : (
                      <>
                        <FileText className="h-3 w-3 mr-1" />
                        PDF Document
                      </>
                    )}
                  </Badge>
                  <Badge
                    className={isCompleted ? "bg-green-500" : "bg-gray-400"}
                  >
                    {isCompleted ? (
                      <>
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Completed
                      </>
                    ) : (
                      <>
                        <Circle className="h-3 w-3 mr-1" />
                        Not Completed
                      </>
                    )}
                  </Badge>
                  <Badge variant="secondary">
                    Lesson {currentLesson.order}
                  </Badge>
                </div>
                <CardTitle className="text-2xl">
                  {currentLesson.title}
                </CardTitle>
                {currentLesson.description && (
                  <CardDescription className="mt-2 text-base">
                    {currentLesson.description}
                  </CardDescription>
                )}
              </CardHeader>

              <Separator />

              <CardContent className="pt-6">
                <div className="space-y-4">
                  <div>
                    <h3 className="text-sm font-semibold text-gray-500 mb-2">
                      COURSE
                    </h3>
                    <div className="flex items-center gap-2">
                      <BookOpen className="h-4 w-4 text-gray-400" />
                      <span className="font-medium">
                        {currentLesson.course?.title || "Unknown Course"}
                      </span>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-sm font-semibold text-gray-500 mb-2">
                      INSTRUCTOR
                    </h3>
                    <span className="font-medium">
                      {currentLesson.course?.instructor?.name ||
                        "Unknown Instructor"}
                    </span>
                  </div>

                  <Separator />

                  {/* Complete toggle */}
                  <div>
                    <Button
                      onClick={handleToggleComplete}
                      disabled={toggling}
                      className="w-full"
                      size="lg"
                      variant={isCompleted ? "outline" : "default"}
                    >
                      {toggling ? (
                        <>
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                          Updating...
                        </>
                      ) : isCompleted ? (
                        <>
                          <Circle className="h-5 w-5 mr-2" />
                          Mark as Incomplete
                        </>
                      ) : (
                        <>
                          <CheckCircle className="h-5 w-5 mr-2" />
                          Mark as Complete
                        </>
                      )}
                    </Button>
                    <p className="text-xs text-center text-gray-500 mt-2">
                      {isCompleted
                        ? "You can unmark this lesson if needed"
                        : "Mark this lesson as complete to track your progress"}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar to show all lessons*/}
          <div className="lg:col-span-1">
            <Card className="sticky top-24">
              <CardHeader>
                <CardTitle className="text-lg">Course Content</CardTitle>
                <CardDescription>
                  {progress.completed} of {progress.total} completed
                </CardDescription>
                <div className="mt-2">
                  <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-blue-600 rounded-full transition-all duration-300"
                      style={{ width: `${progress.percentage}%` }}
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-1 text-right">
                    {progress.percentage}%
                  </p>
                </div>
              </CardHeader>

              <Separator />

              <CardContent className="p-0 max-h-[500px] overflow-y-auto">
                {courseProgress?.lessons &&
                courseProgress.lessons.length > 0 ? (
                  <div className="divide-y">
                    {courseProgress.lessons.map((lessonItem) => {
                      const isCurrent = lessonItem.id === currentLesson.id;
                      const lessonCompleted = lessonItem.isCompleted;

                      return (
                        <button
                          key={lessonItem.id}
                          onClick={() => handleLessonNavigation(lessonItem.id)}
                          className={`w-full text-left p-4 hover:bg-gray-50 transition-colors ${
                            isCurrent
                              ? "bg-blue-50 border-l-4 border-blue-600"
                              : ""
                          }`}
                        >
                          <div className="flex items-start gap-3">
                            <div
                              className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold ${
                                lessonCompleted
                                  ? "bg-green-500 text-white"
                                  : isCurrent
                                    ? "bg-blue-600 text-white"
                                    : "bg-gray-100 text-gray-600"
                              }`}
                            >
                              {lessonCompleted ? (
                                <CheckCircle className="h-4 w-4" />
                              ) : (
                                lessonItem.order
                              )}
                            </div>

                            <div className="flex-1 min-w-0">
                              <p
                                className={`text-sm font-medium truncate ${
                                  isCurrent ? "text-blue-600" : ""
                                }`}
                              >
                                {lessonItem.title}
                              </p>
                              <div className="flex items-center gap-2 text-xs text-gray-500 mt-1">
                                {lessonItem.contentType === "video" ? (
                                  <>
                                    <PlayCircle className="h-3 w-3" />
                                    <span>Video</span>
                                  </>
                                ) : (
                                  <>
                                    <FileText className="h-3 w-3" />
                                    <span>PDF</span>
                                  </>
                                )}
                              </div>
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                ) : (
                  <div className="p-6 text-center">
                    <BookOpen className="h-10 w-10 text-gray-400 mx-auto mb-2" />
                    <p className="text-gray-500 text-sm">
                      No lessons available
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
