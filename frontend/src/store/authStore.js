import { create } from "zustand";
import { persist } from "zustand/middleware";
import { authAPI } from "@/utils/api";
import toast from "react-hot-toast";

const useAuthStore = create(
  persist(
    (set) => ({
      authUser: null,
      token: null,
      isLoading: false,

      signup: async (data) => {
        set({ isLoading: true });
        try {
          const res = await authAPI.signup(data);
          set({ authUser: res.user, token: res.token });
          toast.success("Account created successfully!");
          return true;
        } catch (error) {
          toast.error(error.response?.data?.error || "Signup failed");
          return false;
        } finally {
          set({ isLoading: false });
        }
      },

      login: async (data) => {
        set({ isLoading: true });
        try {
          const res = await authAPI.login(data);
          set({ authUser: res.user, token: res.token });
          toast.success("Login successful!");
          return true;
        } catch (error) {
          toast.error(error.response?.data?.error || "Login failed");
          return false;
        } finally {
          set({ isLoading: false });
        }
      },

      logout: async () => {
        try {
          await authAPI.logout();
        } catch (error) {
          // Ignore error, logout anyway
        }
        set({ authUser: null, token: null });
        toast.success("Logged out successfully");
      },
    }),
    {
      name: "auth-storage",
    },
  ),
);

export default useAuthStore;
