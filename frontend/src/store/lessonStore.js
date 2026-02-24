import { create } from "zustand";
import { lessonAPI } from "@/utils/api";
import toast from "react-hot-toast";

const getError = (error, fallback) => {
  const d = error?.response?.data;
  return (
    (d?.details ? Object.values(d.details)[0]?.[0] : d?.message || d?.error) ||
    fallback
  );
};

const useLessonStore = create((set, get) => ({
  lessons: [],
  currentLesson: null,
  isLoading: false,

  // Fetch lessons for a course
  fetchLessons: async (courseId) => {
    set({ isLoading: true });
    try {
      const data = await lessonAPI.getByCourse(courseId);
      set({ lessons: data });
      return data;
    } catch (error) {
      //toast.error("Failed to load lessons");
      //error handled by backend
      return [];
    } finally {
      set({ isLoading: false });
    }
  },

  // Fetch single lesson
  fetchLesson: async (lessonId) => {
    set({ isLoading: true });
    try {
      const data = await lessonAPI.getById(lessonId);
      set({ currentLesson: data });
      return data;
    } catch (error) {
      toast.error("Failed to load lesson");
      return null;
    } finally {
      set({ isLoading: false });
    }
  },

  // Create lesson
  createLesson: async (courseId, formData) => {
    set({ isLoading: true });
    try {
      await lessonAPI.create(courseId, formData);
      toast.success("Lesson added successfully!");
      // Refresh lessons
      await get().fetchLessons(courseId);
      return true;
    } catch (error) {
      toast.error(getError(error, "Failed to add lesson"));
      return false;
    } finally {
      set({ isLoading: false });
    }
  },

  // Delete lesson
  deleteLesson: async (lessonId, courseId) => {
    set({ isLoading: true });
    try {
      await lessonAPI.delete(lessonId);
      toast.success("Lesson deleted successfully");

      set((state) => ({
        lessons: state.lessons.filter((l) => l.id !== lessonId),
      }));
      return true;
    } catch (error) {
      toast.error("Failed to delete lesson");
      return false;
    } finally {
      set({ isLoading: false });
    }
  },

  // Clear current lesson
  clearCurrentLesson: () => {
    set({ currentLesson: null });
  },
}));

export default useLessonStore;
