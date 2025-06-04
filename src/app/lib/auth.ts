import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";

export function verifyTokenWithRole(req: NextRequest, allowedRoles: string[]) {
  const authHeader = req.headers.get("authorization");

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return {
      error: NextResponse.json({ message: "Unauthorized" }, { status: 401 }),
    };
  }

  const token = authHeader.split(" ")[1];
  console.log("token hihi: " + token);

  if (!token) {
    return {
      error: NextResponse.json({ message: "Unauthorized" }, { status: 401 }),
    };
  }

  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || ""
    ) as jwt.JwtPayload;

    if (!decoded || !allowedRoles.includes(decoded.role)) {
      return {
        error: NextResponse.json(
          { message: "Không có quyền truy cập" },
          { status: 403 }
        ),
      };
    }

    return { user: decoded };
  } catch {
    return {
      error: NextResponse.json(
        { message: "Token không hợp lệ" },
        { status: 401 }
      ),
    };
  }
}
