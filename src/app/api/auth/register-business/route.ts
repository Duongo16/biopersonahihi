import { NextResponse, NextRequest } from "next/server";
import bcrypt from "bcryptjs";
import { nanoid } from "nanoid";
import connectDB from "@/utils/db";
import User from "@/utils/models/User";
import OTPModel from "@/utils/models/OTP";

export async function POST(req: NextRequest) {
  try {
    const { username, email, password } = await req.json();

    if (!username || !email || !password) {
      return NextResponse.json(
        { message: "Vui lòng điền đầy đủ thông tin." },
        { status: 400 }
      );
    }

    await connectDB();

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return NextResponse.json(
        { message: "Email này đã được sử dụng." },
        { status: 400 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const apiKey = nanoid(32);

    const newBusiness = new User({
      username,
      email,
      password: hashedPassword,
      role: "business",
      apiKey,
    });

    await newBusiness.save();
    await OTPModel.deleteOne({ email }); // Xóa OTP đã dùng

    return NextResponse.json({
      message: "Đăng ký business thành công.",
      apiKey,
    });
  } catch (error) {
    console.error("Error registering business:", error);
    return NextResponse.json(
      { message: "Đã xảy ra lỗi khi đăng ký business." },
      { status: 500 }
    );
  }
}
