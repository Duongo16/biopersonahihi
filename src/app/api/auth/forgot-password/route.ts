import { NextResponse } from "next/server";
import connectDB from "@/utils/db";
import User from "@/utils/models/User";
import bcrypt from "bcryptjs";
import nodemailer from "nodemailer";

export async function POST(req: Request) {
  try {
    await connectDB();
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json(
        { message: "Email là bắt buộc" },
        { status: 400 }
      );
    }

    const user = await User.findOne({ email });
    if (!user) {
      return NextResponse.json(
        { message: "Không tìm thấy người dùng" },
        { status: 404 }
      );
    }

    // Tạo mật khẩu mới ngẫu nhiên
    const newPassword = Math.random().toString(36).slice(-8); // ví dụ: "g7x9q2jz"
    const hashed = await bcrypt.hash(newPassword, 10);

    user.password = hashed;
    await user.save();

    // Gửi mật khẩu mới qua email
    const transporter = nodemailer.createTransport({
      service: "Gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: "🔐 Mật khẩu mới từ hệ thống",
      html: `
        <p>Chào ${user.username},</p>
        <p>Mật khẩu mới của bạn là: <strong>${newPassword}</strong></p>
        <p>Vui lòng đăng nhập và đổi lại mật khẩu ngay sau đó.</p>
        <p>Trân trọng,<br/>Đội ngũ hỗ trợ</p>
      `,
    });

    return NextResponse.json({
      message: "✅ Mật khẩu mới đã được gửi đến email của bạn",
    });
  } catch (error) {
    console.error("Forgot password error:", error);
    return NextResponse.json({ message: "❌ Lỗi hệ thống" }, { status: 500 });
  }
}
