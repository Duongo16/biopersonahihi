import { NextResponse, NextRequest } from "next/server";
import connectDB from "@/utils/db";
import User from "@/utils/models/User";
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

    if (!decoded || decoded.role !== "business") {
      return NextResponse.json(
        { message: "Chỉ business mới có quyền cập nhật API key." },
        { status: 403 }
      );
    }

    await connectDB();

    const business = await User.findById(decoded.id).select("apiKey");

    return NextResponse.json({ apiKey: business?.apiKey || "" });
  } catch (error) {
    console.error("Error getting API key:", error);
    return NextResponse.json(
      { message: "Đã xảy ra lỗi khi lấy API key." },
      { status: 500 }
    );
  }
}
