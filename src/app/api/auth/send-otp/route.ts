// /api/auth/send-otp/route.ts
import { NextResponse } from "next/server";
import { Resend } from "resend";
import OTPModel from "../../../../utils/models/OTP"; // bạn cần tạo model OTP
import connectDB from "@/utils/db";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: Request) {
  try {
    await connectDB();
    const { email } = await req.json();

    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();

    await OTPModel.findOneAndUpdate(
      { email },
      { otp: otpCode, expiresAt: Date.now() + 5 * 60 * 1000 },
      { upsert: true }
    );

    await resend.emails.send({
      from: "onboarding@resend.dev",
      to: email,
      subject: "BIOPERSONA: Your OTP Code",
      html: `<p>Your verification code is: <b>${otpCode}</b>. It will expire in 5 minutes.</p>`,
    });

    return NextResponse.json({ message: "OTP sent" });
  } catch (error) {
    console.error("❌ Send OTP error:", error);
    return NextResponse.json(
      { message: "Failed to send OTP" },
      { status: 500 }
    );
  }
}
