import axiosInstance from "@/lib/axios";

//auth api's
export const authAPI = {
  signup: async (data) => {
    const res = await axiosInstance.post("/auth/signup", data);
    return res.data;
  },
  login: async (data) => {
    const res = await axiosInstance.post("/auth/login", data);
    return res.data;
  },
  logout: async () => {
    const res = await axiosInstance.post("/auth/logout");
    return res.data;
  },
};

//courses api's
export const courseAPI = {
  getAll: async () => {
    const res = await axiosInstance.get("/courses");
    return res.data;
  },
  getById: async (id) => {
    const res = await axiosInstance.get(`/courses/${id}`);
    return res.data;
  },
  create: async (formData) => {
    const res = await axiosInstance.post("/courses", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return res.data;
  },
  update: async (id, formData) => {
    const res = await axiosInstance.put(`/courses/${id}`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return res.data;
  },
  delete: async (id) => {
    const res = await axiosInstance.delete(`/courses/${id}`);
    return res.data;
  },
  getInstructorCourses: async () => {
    const res = await axiosInstance.get("/courses/instructor/my-courses");
    return res.data;
  },
};

//lessons api's
export const lessonAPI = {
  getByCourse: async (courseId) => {
    const res = await axiosInstance.get(`/lessons/course/${courseId}`);
    return res.data;
  },
  create: async (courseId, formData) => {
    const res = await axiosInstance.post(
      `/lessons/course/${courseId}`,
      formData,
      {
        headers: { "Content-Type": "multipart/form-data" },
      },
    );
    return res.data;
  },
  delete: async (id) => {
    const res = await axiosInstance.delete(`/lessons/${id}`);
    return res.data;
  },
};

//enrollments api's
export const enrollmentAPI = {
  enroll: async (courseId) => {
    const res = await axiosInstance.post(`/enrollments/${courseId}`);
    return res.data;
  },
  getMyCourses: async () => {
    const res = await axiosInstance.get("/enrollments/my-courses");
    return res.data;
  },
  toggleComplete: async (lessonId) => {
    const res = await axiosInstance.post(
      `/enrollments/lesson/${lessonId}/toggle`,
    );
    return res.data;
  },
  getProgress: async (courseId) => {
    const res = await axiosInstance.get(
      `/enrollments/course/${courseId}/progress`,
    );
    return res.data;
  },
};

//dashboard api's
export const dashboardAPI = {
  instructor: async () => {
    const res = await axiosInstance.get("/dashboard/instructor");
    return res.data;
  },
  student: async () => {
    const res = await axiosInstance.get("/dashboard/student");
    return res.data;
  },
};
