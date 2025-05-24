"use client";

import "./globals.css";
import { ReactNode, useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import useAuthStore from "@/store/authStore";
import toast, { Toaster } from "react-hot-toast";

export default function RootLayout({ children }: { children: ReactNode }) {
  const user = useAuthStore((state) => state.user);
  const setUser = useAuthStore((state) => state.setUser);
  const router = useRouter();
  const [dropdownOpen, setDropdownOpen] = useState(false);

  useEffect(() => {
    const handleClick = () => {
      setDropdownOpen(false);
    };
    if (dropdownOpen) {
      window.addEventListener("click", handleClick);
    }
    return () => window.removeEventListener("click", handleClick);
  }, [dropdownOpen]);

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
        <nav className="bg-main text-white p-2 shadow-lg fixed top-0 left-0 w-full ">
          <div className="container mx-auto flex justify-between items-center">
            <div className="flex items-center space-x-4 ml-6">
              <Link href="/" className="text-2xl font-bold tracking-tight">
                <Image src="/logo.png" alt="Logo" width={200} height={200} />
              </Link>
            </div>
            <div className="flex items-center space-x-4 mr-6">
              {user ? (
                <>
                  <div className="relative">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setDropdownOpen((open) => !open);
                      }}
                      className="flex items-center font-semibold focus:outline-none"
                    >
                      Hello, {user.username}
                      {dropdownOpen ? (
                        <svg
                          className="w-4 h-4 ml-1"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M5 15l7-7 7 7"
                          />
                        </svg>
                      ) : (
                        <svg
                          className="w-4 h-4 ml-1"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19 9l-7 7-7-7"
                          />
                        </svg>
                      )}
                    </button>
                    {dropdownOpen && (
                      <div
                        className="absolute right-0 mt-2 w-48 bg-white text-black rounded-md shadow-lg z-50"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Link
                          href={
                            user.role == "business"
                              ? "/dashboard-business"
                              : "/dashboard"
                          }
                          className="block px-4 py-2 hover:bg-gray-100"
                          onClick={() => setDropdownOpen(false)}
                        >
                          Dashboard
                        </Link>
                        <Link
                          href="/ekyc"
                          className="block px-4 py-2 hover:bg-gray-100"
                          onClick={() => setDropdownOpen(false)}
                        >
                          Đăng ký eKYC
                        </Link>
                        <button
                          onClick={() => {
                            setDropdownOpen(false);
                            handleLogout();
                          }}
                          className="block w-full text-left px-4 py-2 text-red-600 hover:bg-gray-100"
                        >
                          Đăng xuất
                        </button>
                      </div>
                    )}
                  </div>
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
