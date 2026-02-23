"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import useAuthStore from "@/store/authStore";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  GraduationCap,
  LogOut,
  LayoutDashboard,
  PlusCircle,
} from "lucide-react";

export default function Navbar() {
  const { authUser, logout } = useAuthStore();
  const router = useRouter();

  const handleLogout = async () => {
    await logout();
    router.push("/");
  };

  // Get user initials for avatar
  const getUserInitials = () => {
    if (!authUser?.name) return "U";
    const names = authUser.name.split(" ");
    if (names.length >= 2) {
      return names[0][0] + names[1][0];
    }
    return authUser.name[0];
  };

  return (
    <nav className="border-b bg-white sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <GraduationCap className="h-8 w-8 text-blue-600" />
            <span className="text-xl font-bold text-gray-900">LearnHub</span>
          </Link>

          {/* Right side - Auth buttons or User menu */}
          <div className="flex items-center gap-4">
            {authUser ? (
              <>
                {/* Dashboard Link */}
                <Button
                  variant="ghost"
                  onClick={() => router.push("/dashboard")}
                  className="hidden sm:flex items-center gap-2"
                >
                  <LayoutDashboard className="h-4 w-4" />
                  Dashboard
                </Button>

                {/* Create Course (Instructor only) */}
                {authUser.role === "INSTRUCTOR" && (
                  <Button
                    onClick={() => router.push("/dashboard")}
                    className="hidden sm:flex items-center gap-2"
                  >
                    <PlusCircle className="h-4 w-4" />
                    Create Course
                  </Button>
                )}

                {/* User Dropdown */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="flex items-center gap-2 focus:outline-none">
                      <Avatar className="h-9 w-9 cursor-pointer">
                        <AvatarFallback className="bg-blue-600 text-white">
                          {getUserInitials()}
                        </AvatarFallback>
                      </Avatar>
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <DropdownMenuLabel>
                      <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium">{authUser.name}</p>
                        <p className="text-xs text-gray-500">
                          {authUser.email}
                        </p>
                        <p className="text-xs text-blue-600 font-semibold">
                          {authUser.role}
                        </p>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => router.push("/dashboard")}>
                      <LayoutDashboard className="mr-2 h-4 w-4" />
                      Dashboard
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={handleLogout}
                      className="text-red-600"
                    >
                      <LogOut className="mr-2 h-4 w-4" />
                      Logout
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <>
                {/* login button */}
                <Button variant="ghost" onClick={() => router.push("/login")}>
                  Login
                </Button>

                {/* signup button */}
                <Button onClick={() => router.push("/signup")}>Sign Up</Button>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
