import { create } from "zustand";
import { persist } from "zustand/middleware";
import { authAPI } from "@/utils/api";
import toast from "react-hot-toast";

const getError = (error, fallback) => {
  //For error handling
  const d = error?.response?.data;
  return (
    (d?.details ? Object.values(d.details)[0]?.[0] : d?.message || d?.error) ||
    fallback
  );
};

//For authentication
const useAuthStore = create(
  persist(
    (set) => ({
      authUser: null,
      token: null,
      isLoading: false,
      isCheckingAuth: true,

      checkAuth: async () => {
        set({ isCheckingAuth: true });
        try {
          const res = await authAPI.profile();
          set({ authUser: res.user });
        } catch {
          set({ authUser: null, token: null });
        } finally {
          set({ isCheckingAuth: false });
        }
      },

      //signup
      signup: async (data) => {
        set({ isLoading: true });
        try {
          const res = await authAPI.signup(data);
          set({ authUser: res.user, token: res.token });
          toast.success("Account created successfully!");
          return true;
        } catch (error) {
          toast.error(getError(error, "Signup failed"));
          return false;
        } finally {
          set({ isLoading: false });
        }
      },

      //login
      login: async (data) => {
        set({ isLoading: true });
        try {
          const res = await authAPI.login(data);
          set({ authUser: res.user, token: res.token });
          toast.success("Login successful!");
          return true;
        } catch (error) {
          toast.error(getError(error, "Login failed"));
          return false;
        } finally {
          set({ isLoading: false });
        }
      },

      //login
      logout: async () => {
        try {
          await authAPI.logout();
        } catch {
          // Ignore error, logout anyway
        }
        set({ authUser: null, token: null });
        toast.success("Logged out successfully");
      },
    }),
    {
      name: "auth-storage",
      partialize: (state) => ({ authUser: state.authUser, token: state.token }),
    },
  ),
);

export default useAuthStore;
