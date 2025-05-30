"use client";

import "./globals.css";
import { ReactNode, useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { usePathname } from "next/navigation";
import useAuthStore from "@/store/authStore";
import toast, { Toaster } from "react-hot-toast";
import useFetchUserOnce from "@/hooks/useFetchUserOnce";

export default function RootLayout({ children }: { children: ReactNode }) {
  const user = useAuthStore((state) => state.user);
  const router = useRouter();
  const pathname = usePathname();
  const [ekycDone, setEkycDone] = useState<boolean | null>(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  useFetchUserOnce();

  useEffect(() => {
    const checkEkycDone = async () => {
      try {
        const res = await fetch("/api/ekyc/enrolled", {
          method: "GET",
          credentials: "include",
        });
        const data = await res.json();
        setEkycDone(data.done);
      } catch {
        setEkycDone(null);
      }
    };
    if (user) checkEkycDone();
    else setEkycDone(null);
  }, [user]);

  useEffect(() => {
    const handleClick = () => setDropdownOpen(false);
    if (dropdownOpen) window.addEventListener("click", handleClick);
    return () => window.removeEventListener("click", handleClick);
  }, [dropdownOpen]);

  const handleLogout = async () => {
    try {
      const response = await fetch("/api/auth/logout", {
        method: "GET",
        credentials: "include",
      });
      const data = await response.json();

      if (response.ok) {
        toast.success(data.message || "Đăng xuất thành công! 👋");
        useAuthStore.getState().logout();
        router.push("/login");
      }
    } catch (error) {
      console.error("❌ Error during logout:", error);
      alert("Đã xảy ra lỗi. Vui lòng thử lại.");
    }
  };

  return (
    <html lang="en">
      <body>
        <nav className="bg-main text-white p-2 shadow-lg fixed top-0 left-0 w-full z-50">
          <div className="container mx-auto flex justify-between items-center">
            <div className="flex items-center space-x-4 ml-6">
              <Link href="/" className="text-2xl font-bold tracking-tight">
                <Image src="/logo.png" alt="Logo" width={200} height={200} />
              </Link>
            </div>
            <div className="flex items-center space-x-4 mr-6">
              {user ? (
                <div className="relative">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setDropdownOpen((open) => !open);
                    }}
                    className="flex items-center font-semibold focus:outline-none"
                  >
                    Hello, {user.username}
                    <svg
                      className="w-4 h-4 ml-1"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d={dropdownOpen ? "M5 15l7-7 7 7" : "M19 9l-7 7-7-7"}
                      />
                    </svg>
                  </button>
                  {dropdownOpen && (
                    <div
                      className="absolute right-0 mt-2 w-48 bg-white text-black rounded-md shadow-lg z-50"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Link
                        href="/profile"
                        onClick={() => {
                          setDropdownOpen(false);
                        }}
                        className="block w-full text-left px-4 py-2 hover:bg-gray-100"
                      >
                        Profile
                      </Link>
                      <Link
                        href={
                          user.role === "business"
                            ? "/dashboard-business"
                            : user.role === "admin"
                              ? "dashboard-admin"
                              : "/dashboard"
                        }
                        className="block px-4 py-2 hover:bg-gray-100"
                        onClick={() => setDropdownOpen(false)}
                      >
                        Dashboard
                      </Link>
                      {user.role === "business" ? (
                        <Link
                          href="/dashboard-business/verify-user"
                          className="block px-4 py-2 hover:bg-gray-100"
                          onClick={() => setDropdownOpen(false)}
                        >
                          Xác thực người dùng
                        </Link>
                      ) : user.role === "user" ? (
                        <Link
                          href="/ekyc"
                          className="block px-4 py-2 hover:bg-gray-100"
                          onClick={() => setDropdownOpen(false)}
                        >
                          Đăng ký eKYC
                        </Link>
                      ) : null}

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

        {user &&
          user.role == "user" &&
          ekycDone !== null &&
          pathname !== "/ekyc" &&
          pathname !== "/dashboard" && (
            <div className="pt-15 flex justify-center z-40 absolute w-full">
              <div
                className={`flex justify-between items-center gap-4 px-6 py-3 mx-auto max-w-4xl w-full rounded-md shadow-md transition-all duration-300 ${
                  ekycDone
                    ? "bg-green-100 text-green-800"
                    : "bg-yellow-100 text-yellow-800"
                }`}
              >
                <div className="flex items-center gap-2">
                  <svg
                    className="w-5 h-5 flex-shrink-0"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d={
                        ekycDone
                          ? "M5 13l4 4L19 7"
                          : "M13 16h-1v-4h-1m0-4h.01M12 20c4.418 0 8-3.582 8-8s-3.582-8-8-8-8 3.582-8 8 3.582 8 8 8z"
                      }
                    />
                  </svg>
                  <p className="text-sm">
                    {ekycDone ? (
                      <>Bạn đã hoàn thành đăng ký eKYC.</>
                    ) : (
                      <>
                        Bạn chưa hoàn thành đăng ký eKYC.{" "}
                        <Link
                          href="/ekyc"
                          className="underline text-main font-medium"
                        >
                          Đăng ký ngay
                        </Link>
                      </>
                    )}
                  </p>
                </div>
                <button
                  onClick={() => setEkycDone(null)}
                  className="text-gray-500 hover:text-gray-700 transition"
                  aria-label="Đóng thông báo"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>
            </div>
          )}

        <main className="container mx-auto mt-6">{children}</main>
        <Toaster position="top-center" reverseOrder={false} />
      </body>
    </html>
  );
}
