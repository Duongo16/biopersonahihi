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
        { message: "Chỉ business mới có quyền truy cập." },
        { status: 403 }
      );
    }

    await connectDB();

    // Lấy tất cả user thuộc business này
    const users = await User.find({ businessId: decoded.id })
      .select("_id username email createdAt role")
      .exec();

    return NextResponse.json({ users });
  } catch (error) {
    console.error("Error fetching business users:", error);
    return NextResponse.json(
      { message: "Đã xảy ra lỗi khi lấy danh sách user." },
      { status: 500 }
    );
  }
}
