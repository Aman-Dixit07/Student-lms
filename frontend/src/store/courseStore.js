import { create } from "zustand";
import { courseAPI } from "@/utils/api";
import toast from "react-hot-toast";

const getError = (error, fallback) => {
  const d = error?.response?.data;
  return (
    (d?.details ? Object.values(d.details)[0]?.[0] : d?.message || d?.error) ||
    fallback
  );
};

const useCourseStore = create((set, get) => ({
  courses: [],
  selectedCourse: null,
  isLoading: false,

  //Fetch all courses
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
    set({ isLoading: true });
    try {
      const data = await courseAPI.getInstructorCourses();
      set({ courses: data });
    } catch (error) {
      toast.error("Failed to load your courses");
    } finally {
      set({ isLoading: false });
    }
  },

  // Fetch single course with more details
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
      // Refresh courses list
      get().fetchInstructorCourses();
      return true;
    } catch (error) {
      toast.error(getError(error, "Failed to create course"));
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
      // Refresh courses list
      get().fetchInstructorCourses();
      return true;
    } catch (error) {
      toast.error(getError(error, "Failed to update course"));
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
      // Remove from state
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
}));

export default useCourseStore;
