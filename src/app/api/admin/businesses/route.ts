import { NextResponse } from "next/server";
import connectDB from "@/utils/db";
import User from "@/utils/models/User";
import bcrypt from "bcryptjs";
import { nanoid } from "nanoid";

export async function GET() {
  try {
    await connectDB();
    const businesses = await User.find(
      {},
      "_id username apiKey email createdAt updatedAt isBanned"
    ).where("role", "business");
    console.log("Businesses fetched:", businesses);
    return NextResponse.json({ businesses });
  } catch {
    return NextResponse.json(
      { message: "Failed to fetch businesses" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    await connectDB();
    const body = await req.json();
    const { username, email, password, role } = body;

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
    const apiKey = nanoid(32);

    // Tạo người dùng mới
    const newUser = await User.create({
      username,
      email,
      password: passwordHashed,
      role,
      verified: false,
      isBanned: false,
      apiKey: apiKey,
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
