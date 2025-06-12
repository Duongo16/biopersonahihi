import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify, createRemoteJWKSet } from "jose";

const OIDC_ISSUER = "https://oidc.vercel.app/biopersonahihi";
const JWKS = createRemoteJWKSet(
  new URL(`${OIDC_ISSUER}/.well-known/jwks.json`)
);

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

  // 🧠 Lấy token từ các nguồn: cookie, x-vercel-oidc-token, Authorization: Bearer
  const cookieToken = req.cookies.get("token")?.value;
  const headerToken = req.headers.get("x-vercel-oidc-token");

  const authHeader = req.headers.get("authorization");
  const bearerToken = authHeader?.startsWith("Bearer ")
    ? authHeader.slice(7)
    : null;

  const token = cookieToken || headerToken || bearerToken;

  console.log(`🔍 Middleware path: ${pathname}, token exists: ${!!token}`);

  // 🔐 Nếu là path cần bảo vệ nhưng không có token → về login
  if (!token && isProtectedPath) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  // 🔐 Nếu đã có token mà lại vào trang public (login, register) → về trang chủ
  if (token && isPublicPath) {
    return NextResponse.redirect(new URL("/", req.url));
  }

  if (token) {
    try {
      let payload;

      if (cookieToken) {
        // ✅ Token tự cấp - HS256 (HMAC)
        const { payload: verifiedPayload } = await jwtVerify(
          cookieToken,
          new TextEncoder().encode(process.env.JWT_SECRET || "")
        );
        payload = verifiedPayload;
      } else {
        // ✅ Token OIDC (từ x-vercel-oidc-token hoặc Authorization) - RS256
        const { payload: verifiedPayload } = await jwtVerify(
          headerToken || bearerToken!,
          JWKS,
          { algorithms: ["RS256"] }
        );
        payload = verifiedPayload;
      }

      const role = payload?.role as string;

      // ⚠️ Phân quyền chi tiết theo role
      if (pathname.startsWith("/dashboard-business") && role !== "business") {
        return NextResponse.redirect(new URL("/unauthorized", req.url));
      }

      if (pathname.startsWith("/dashboard-admin") && role !== "admin") {
        return NextResponse.redirect(new URL("/unauthorized", req.url));
      }

      return NextResponse.next();
    } catch (err) {
      console.error("❌ Token invalid:", err);
      return NextResponse.redirect(new URL("/login", req.url));
    }
  }

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
