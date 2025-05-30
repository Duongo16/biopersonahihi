import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import connectDB from "@/utils/db";
import User from "@/utils/models/User";

export async function PUT(req: NextRequest) {
  try {
    await connectDB();

    const token = req.cookies.get("token")?.value;
    if (!token) {
      return NextResponse.json({ message: "Chưa đăng nhập" }, { status: 401 });
    }

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || ""
    ) as jwt.JwtPayload;

    const { username } = await req.json();
    if (!username || typeof username !== "string" || username.trim() === "") {
      return NextResponse.json(
        { message: "Tên người dùng không hợp lệ" },
        { status: 400 }
      );
    }

    await User.findByIdAndUpdate(decoded.id, { username: username.trim() });

    return NextResponse.json({ message: "Cập nhật tên người dùng thành công" });
  } catch (err) {
    console.error("❌ Error updating username:", err);
    return NextResponse.json(
      { message: "Lỗi máy chủ khi cập nhật" },
      { status: 500 }
    );
  }
}
