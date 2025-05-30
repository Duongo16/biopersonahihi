import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/utils/db";
import VerificationLog from "@/utils/models/VerificationLog";

export async function POST(req: NextRequest) {
  await connectDB();
  const body = await req.json();

  try {
    const { userId, stepPassed, liveness, faceMatch, voice } = body;

    const newLog = await VerificationLog.create({
      userId,
      stepPassed: stepPassed ? stepPassed : false,
      timestamp: new Date(),
      liveness,
      faceMatch,
      voice,
    });

    return NextResponse.json({ success: true, log: newLog });
  } catch (error) {
    console.error("Verification log error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to create verification log" },
      { status: 500 }
    );
  }
}
