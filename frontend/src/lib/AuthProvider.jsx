"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import useAuthStore from "@/store/authStore";

const PUBLIC_PATHS = ["/", "/login", "/signup"];

export default function AuthProvider({ children }) {
  const { authUser, isCheckingAuth, checkAuth } = useAuthStore();
  const router = useRouter();
  const pathname = usePathname();

  // Validating cookie from backend - /auth/profile
  useEffect(() => {
    checkAuth();
  }, []);

  // Checking auth and handling redirects
  useEffect(() => {
    if (isCheckingAuth) return;

    const isPublic = PUBLIC_PATHS.includes(pathname);

    if (!authUser && !isPublic) {
      router.replace("/login");
    } else if (authUser && (pathname === "/login" || pathname === "/signup")) {
      router.replace("/dashboard");
    }
  }, [isCheckingAuth, authUser, pathname]);

  //Loading screen
  if (isCheckingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 mx-auto mb-3" />
          <p className="text-sm text-gray-500">Loading...</p>
        </div>
      </div>
    );
  }

  return children;
}
