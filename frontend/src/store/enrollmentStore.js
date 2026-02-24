import { create } from "zustand";
import { enrollmentAPI } from "@/utils/api";
import toast from "react-hot-toast";

const getError = (error, fallback) => {
  //For error handling
  const d = error?.response?.data;
  return (
    (d?.details ? Object.values(d.details)[0]?.[0] : d?.message || d?.error) ||
    fallback
  );
};

const useEnrollmentStore = create((set, get) => ({
  // State
  enrolledCourses: [],
  courseProgress: null,
  isLoading: false,

  // Fetch enrolled courses
  fetchEnrolledCourses: async () => {
    set({ isLoading: true });
    try {
      const data = await enrollmentAPI.getMyCourses();
      set({ enrolledCourses: data });
      return data;
    } catch (error) {
      //error handled by backend
      return [];
    } finally {
      set({ isLoading: false });
    }
  },

  // Enroll in course
  enrollCourse: async (courseId) => {
    set({ isLoading: true });
    try {
      await enrollmentAPI.enroll(courseId);
      toast.success("Enrolled successfully!");

      await get().fetchEnrolledCourses();
      return true;
    } catch (error) {
      toast.error(getError(error, "Failed to enroll"));
      return false;
    } finally {
      set({ isLoading: false });
    }
  },

  // Get course progress
  fetchCourseProgress: async (courseId) => {
    set({ isLoading: true });
    try {
      const data = await enrollmentAPI.getProgress(courseId);
      set({ courseProgress: data });
      return data;
    } catch (error) {
      //error handled by backend
      return null;
    } finally {
      set({ isLoading: false });
    }
  },

  // Toggle lesson completion
  toggleLessonComplete: async (lessonId, courseId) => {
    try {
      const res = await enrollmentAPI.toggleComplete(lessonId);
      // Refresh progress
      await get().fetchCourseProgress(courseId);
      return res.isCompleted;
    } catch (error) {
      toast.error("Failed to update progress");
      return null;
    }
  },

  // Check if enrolled in course
  isEnrolled: (courseId) => {
    const { enrolledCourses } = get();
    return enrolledCourses.some((e) => e.course.id === courseId);
  },
}));

export default useEnrollmentStore;
