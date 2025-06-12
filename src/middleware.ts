import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const publicPaths = ["/login", "/register"];
  const protectedPaths = [
    "/dashboard",
    "/ekyc",
    "/dashboard-business",
    "/dashboard-admin",
    "/profile",
  ];

  const isPublicPath = publicPaths.some((path) => pathname.startsWith(path));
  const isProtectedPath = protectedPaths.some((path) =>
    pathname.startsWith(path)
  );

  const token =
    req.headers.get("authorization")?.split(" ")[1] ||
    req.cookies.get("token")?.value;

  console.log(
    `🔍 Middleware path: ${pathname}, token exists: ${!!token}, req:${req.headers}.get("authorization")`
  );

  // Nếu chưa đăng nhập mà truy cập trang bảo vệ => redirect
  if (!token && isProtectedPath) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  // Nếu đã đăng nhập mà vào trang công khai => redirect
  if (token && isPublicPath) {
    return NextResponse.redirect(new URL("/", req.url));
  }

  // Nếu có token => kiểm tra role
  if (token) {
    try {
      const { payload } = await jwtVerify(
        token,
        new TextEncoder().encode(process.env.JWT_SECRET || "")
      );

      const role = payload.role as string;

      if (pathname.startsWith("/dashboard-business") && role !== "business") {
        return NextResponse.redirect(new URL("/unauthorized", req.url));
      }

      if (pathname.startsWith("/dashboard-admin") && role !== "admin") {
        return NextResponse.redirect(new URL("/unauthorized", req.url));
      }

      // Token hợp lệ => cho phép truy cập
      return NextResponse.next();
    } catch (err) {
      console.error("❌ Token invalid:", err);
      return NextResponse.redirect(new URL("/login", req.url));
    }
  }

  // Nếu là public path hoặc không cần auth
  return NextResponse.next();
}

export const config = {
  matcher: [
    "/login",
    "/register",
    "/forgot-password",
    "/profile",
    "/dashboard",
    "/dashboard/:path*",
    "/ekyc",
    "/ekyc/:path*",
    "/dashboard-business",
    "/dashboard-business/:path*",
    "/dashboard-admin",
    "/dashboard-admin/:path*",
  ],
};
