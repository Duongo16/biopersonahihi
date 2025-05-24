"use client";

import "./globals.css";
import { ReactNode, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import useAuthStore from "@/store/authStore";
import toast, { Toaster } from "react-hot-toast";

export default function RootLayout({ children }: { children: ReactNode }) {
  const user = useAuthStore((state) => state.user);
  const setUser = useAuthStore((state) => state.setUser);
  const router = useRouter();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await fetch("/api/auth/me", {
          method: "GET",
          credentials: "include",
        });
        const data = await response.json();

        if (response.ok) {
          setUser(data.user);
        } else {
          setUser(null);
        }
      } catch (error) {
        console.error("❌ Error checking auth status:", error);
        setUser(null);
      }
    };

    fetchUser();
  }, [setUser]);

  const handleLogout = async () => {
    try {
      const response = await fetch("/api/auth/logout", {
        method: "GET",
        credentials: "include",
      });
      const data = await response.json();

      if (response.ok) {
        toast.success(data.message || "Đăng xuất thành công! 👋");
        router.push("/login");
      }
    } catch (error) {
      console.error("❌ Error during logout:", error);
      alert("Something went wrong. Please try again.");
    }
  };

  return (
    <html lang="en">
      <body>
        <nav className="bg-black text-white p-4 shadow-lg">
          <div className="container mx-auto flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <Link href="/" className="text-2xl font-bold tracking-tight">
                Biometric Platform
              </Link>
              <Link
                href={
                  user
                    ? user.role == "business"
                      ? "/dashboard-business"
                      : "/dashboard"
                    : "/login"
                }
                className="text-white hover:text-gray-200"
              >
                Dashboard
              </Link>
              <Link href="/ekyc" className="text-white hover:text-gray-200">
                eKYC Register
              </Link>
            </div>
            <div className="flex items-center space-x-4">
              {user ? (
                <>
                  <span className="font-semibold">Hello, {user.username}</span>

                  <button
                    onClick={handleLogout}
                    className="bg-accent text-white px-4 py-2 rounded-md font-bold hover:bg-accent/80"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link
                    href="/register"
                    className="text-white hover:text-gray-200"
                  >
                    Register
                  </Link>

                  <Link
                    href="/login"
                    className="bg-accent text-white px-4 py-2 rounded-md font-bold"
                  >
                    Login
                  </Link>
                </>
              )}
            </div>
          </div>
        </nav>
        <main className="container mx-auto">{children}</main>
        <Toaster position="top-right" reverseOrder={false} />
      </body>
    </html>
  );
}
