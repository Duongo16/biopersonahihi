import { NextRequest, NextResponse } from "next/server";
import { jwtVerify, type JWTPayload } from "jose";

export async function verifyTokenWithRole(
  req: NextRequest,
  allowedRoles: string[]
): Promise<{ user?: JWTPayload; error?: NextResponse }> {
  try {
    const token =
      req.cookies.get("token")?.value ||
      req.headers.get("authorization")?.replace("Bearer ", "");

    if (!token) {
      return {
        error: NextResponse.json({ message: "Unauthorized" }, { status: 401 }),
      };
    }

    const secret = new TextEncoder().encode(process.env.JWT_SECRET || "");
    const { payload } = await jwtVerify(token, secret);

    const role = payload.role as string;
    if (!allowedRoles.includes(role)) {
      return {
        error: NextResponse.json(
          { message: "Không có quyền truy cập" },
          { status: 403 }
        ),
      };
    }

    return { user: payload };
  } catch {
    return {
      error: NextResponse.json(
        { message: "Token không hợp lệ hoặc đã hết hạn" },
        { status: 401 }
      ),
    };
  }
}
