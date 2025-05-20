import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import jwt from "jsonwebtoken";

export function middleware(req: NextRequest) {
  const token = req.cookies.get("token")?.value;

  // // Định nghĩa các trang công khai
  // const publicPaths = ["/login", "/register"];
  // const isPublicPath = publicPaths.some((path) =>
  //   req.nextUrl.pathname.startsWith(path)
  // );

  // // Đã đăng nhập nhưng cố truy cập login hoặc register
  // if (token && isPublicPath) {
  //   return NextResponse.redirect(new URL("/dashboard", req.url));
  // }

  // Chưa đăng nhập nhưng cố truy cập dashboard
  if (
    !token &&
    (req.nextUrl.pathname.startsWith("/dashboard") ||
      req.nextUrl.pathname.startsWith("/ekyc"))
  ) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  // Xác thực token
  try {
    if (token) {
      const decoded = jwt.verify(
        token,
        process.env.JWT_SECRET || ""
      ) as jwt.JwtPayload;

      // Đính kèm thông tin người dùng vào request
      req.headers.set("user-id", decoded.id || "");
      req.headers.set("username", decoded.username || "");
      req.headers.set("email", decoded.email || "");
    }

    return NextResponse.next();
  } catch (error) {
    console.error("❌ Token verification error:", error);
    return NextResponse.redirect(new URL("/login", req.url));
  }
}

export const config = {
  matcher: [
    // "/dashboard/:path*",
    // "/ekyc/:path*",
    "/login",
    "/register",
  ],
};
