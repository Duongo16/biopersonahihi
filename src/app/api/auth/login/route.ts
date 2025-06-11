import { NextResponse, NextRequest } from "next/server";
import bcrypt from "bcryptjs";
import { SignJWT } from "jose";
import connectDB from "@/utils/db";
import User from "@/utils/models/User";

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const { email, password, rememberMe } = await req.json();

    const user = await User.findOne({ email });
    if (!user) {
      return NextResponse.json(
        { message: "Email không tồn tại" },
        { status: 404 }
      );
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return NextResponse.json(
        { message: "Mật khẩu không đúng" },
        { status: 401 }
      );
    }

    if (user.isBanned) {
      return NextResponse.json(
        { message: "Tài khoản đã bị ban, không thể đăng nhập" },
        { status: 403 }
      );
    }

    const secret = new TextEncoder().encode(process.env.JWT_SECRET || "");
    const token = await new SignJWT({
      id: user._id,
      username: user.username,
      email: user.email,
      role: user.role,
      businessId: user.businessId,
    })
      .setProtectedHeader({ alg: "HS256" })
      .setExpirationTime(rememberMe ? "7d" : "1h")
      .setIssuedAt()
      .sign(secret);

    const response = NextResponse.json(
      { message: "Đăng nhập thành công" },
      { status: 200 }
    );
    response.cookies.set("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: rememberMe ? 60 * 60 * 24 * 7 : 60 * 60, // 7 ngày hoặc 1h
      path: "/",
    });

    return response;
  } catch (error) {
    console.error("❌ Error in login route:", error);
    return NextResponse.json({ message: "Lỗi máy chủ" }, { status: 500 });
  }
}
