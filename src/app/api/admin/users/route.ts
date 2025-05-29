import { NextResponse } from "next/server";
import connectDB from "@/utils/db";
import User from "@/utils/models/User";
import bcrypt from "bcryptjs";

export async function GET() {
  try {
    await connectDB();
    const users = await User.find(
      {},
      "_id username email verified isBanned createdAt updatedAt"
    ).where("role", "user");
    return NextResponse.json({ users });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { message: "Failed to fetch users" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    await connectDB();
    const body = await req.json();
    const { username, email, password, role, businessId } = body;

    if (!username || !email || !password || !role) {
      return NextResponse.json(
        { message: "Thiếu thông tin cần thiết" },
        { status: 400 }
      );
    }

    // Kiểm tra email đã tồn tại chưa
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return NextResponse.json(
        { message: "Email đã được sử dụng" },
        { status: 400 }
      );
    }
    const passwordHashed = await bcrypt.hash(password, 10);

    // Tạo người dùng mới
    const newUser = await User.create({
      username,
      email,
      password: passwordHashed,
      role,
      verified: false,
      businessId: role === "user" ? businessId : undefined,
    });

    return NextResponse.json({ user: newUser }, { status: 201 });
  } catch (err) {
    console.error("POST /api/admin/users error:", err);
    return NextResponse.json(
      { message: "Đã xảy ra lỗi server" },
      { status: 500 }
    );
  }
}
