import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";

export async function GET(req: NextRequest) {
  try {
    const token = req.cookies.get("token")?.value;
    if (!token) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || ""
    ) as jwt.JwtPayload;

    const user = {
      id: decoded.id,
      username: decoded.username,
      email: decoded.email,
    };

    return NextResponse.json({ user }, { status: 200 });
  } catch (error) {
    console.error("❌ Error in me route:", error);
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }
}
