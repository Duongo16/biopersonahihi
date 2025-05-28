// /api/auth/verify-otp/route.ts
import { NextResponse } from "next/server";
import OTPModel from "@/utils/models/OTP";
import connectDB from "@/utils/db";

export async function POST(req: Request) {
  try {
    await connectDB();
    const { email, otp } = await req.json();

    const record = await OTPModel.findOne({ email });
    if (!record || record.otp !== otp) {
      return NextResponse.json({ message: "Mã không hợp lệ" }, { status: 400 });
    }

    if (record.expiresAt < new Date()) {
      return NextResponse.json({ message: "Mã đã hết hạn" }, { status: 400 });
    }

    // ✅ Xác minh thành công
    await OTPModel.deleteOne({ email });

    return NextResponse.json({ message: "Email verified" });
  } catch (error) {
    console.error("❌ Verify OTP error:", error);
    return NextResponse.json(
      { message: "Error verifying OTP" },
      { status: 500 }
    );
  }
}
