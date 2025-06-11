import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";
import connectDB from "@/utils/db";
import User from "@/utils/models/User";

export async function PUT(req: NextRequest) {
  try {
    await connectDB();

    const token = req.cookies.get("token")?.value;
    if (!token) {
      return NextResponse.json({ message: "Chưa đăng nhập" }, { status: 401 });
    }

    const secret = new TextEncoder().encode(process.env.JWT_SECRET || "");
    const { payload: decoded } = await jwtVerify(token, secret);

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
