import { create } from "zustand";
import { courseAPI, lessonAPI } from "@/utils/api";
import toast from "react-hot-toast";

const useCourseStore = create((set, get) => ({
  // State
  courses: [],
  selectedCourse: null,
  lessons: [],
  isLoading: false,

  // Fetch all courses (public)
  fetchAllCourses: async () => {
    set({ isLoading: true });
    try {
      const data = await courseAPI.getAll();
      set({ courses: data });
    } catch (error) {
      toast.error("Failed to load courses");
    } finally {
      set({ isLoading: false });
    }
  },

  // Fetch instructor's courses
  fetchInstructorCourses: async () => {
    set({ isLoading: true, courses: [] }); // clear stale data to avoid _count crash
    try {
      const data = await courseAPI.getInstructorCourses();
      set({ courses: data });
    } catch (error) {
      toast.error(error.response?.data?.error || "Failed to load your courses");
    } finally {
      set({ isLoading: false });
    }
  },

  // Fetch single course
  fetchCourse: async (id) => {
    set({ isLoading: true });
    try {
      const data = await courseAPI.getById(id);
      set({ selectedCourse: data });
      return data;
    } catch (error) {
      toast.error("Failed to load course");
      return null;
    } finally {
      set({ isLoading: false });
    }
  },

  // Create course
  createCourse: async (formData) => {
    set({ isLoading: true });
    try {
      const res = await courseAPI.create(formData);
      toast.success("Course created successfully!");
      get().fetchInstructorCourses();
      return true;
    } catch (error) {
      toast.error(error.response?.data?.error || "Failed to create course");
      return false;
    } finally {
      set({ isLoading: false });
    }
  },

  // Update course
  updateCourse: async (id, formData) => {
    set({ isLoading: true });
    try {
      await courseAPI.update(id, formData);
      toast.success("Course updated successfully!");
      get().fetchInstructorCourses();
      return true;
    } catch (error) {
      toast.error(error.response?.data?.error || "Failed to update course");
      return false;
    } finally {
      set({ isLoading: false });
    }
  },

  // Delete course
  deleteCourse: async (id) => {
    set({ isLoading: true });
    try {
      await courseAPI.delete(id);
      toast.success("Course deleted successfully");
      set((state) => ({
        courses: state.courses.filter((c) => c.id !== id),
      }));
      return true;
    } catch (error) {
      toast.error("Failed to delete course");
      return false;
    } finally {
      set({ isLoading: false });
    }
  },

  // Fetch lessons for a course
  fetchLessons: async (courseId) => {
    set({ isLoading: true });
    try {
      const data = await lessonAPI.getByCourse(courseId);
      set({ lessons: data });
      return data;
    } catch (error) {
      toast.error("Failed to load lessons");
      return [];
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
      await get().fetchLessons(courseId);
      return true;
    } catch (error) {
      toast.error(error.response?.data?.error || "Failed to add lesson");
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

  // Clear selected course
  clearSelectedCourse: () => {
    set({ selectedCourse: null, lessons: [] });
  },
}));

export default useCourseStore;
