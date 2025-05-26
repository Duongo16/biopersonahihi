import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import axios from "axios";
import connectDB from "@/utils/db";
import UserCCCD from "@/utils/models/UserCCCD";

const AZURE_REGION = process.env.AZURE_SPEAKER_REGION;
const AZURE_KEY = process.env.AZURE_SPEAKER_KEY;
const AZURE_BASE = `https://${AZURE_REGION}.api.cognitive.microsoft.com`;

export async function POST(req: NextRequest) {
  try {
    const form = await req.formData();
    const userId = form.get("userId") as string;
    const voice = form.get("voice") as File;

    if (!userId || !voice) {
      return NextResponse.json(
        { message: "Thiếu userId hoặc voice" },
        { status: 400 }
      );
    }

    await connectDB();

    // 1️⃣ Tạo profile mới (Text-Dependent API mới)
    const createProfileRes = await axios.post(
      `${AZURE_BASE}/speaker-recognition/verification/text-dependent/profiles`,
      { locale: "en-us" },
      {
        headers: {
          "Ocp-Apim-Subscription-Key": AZURE_KEY!,
          "Content-Type": "application/json",
        },
      }
    );

    const profileId = createProfileRes.data.verificationProfileId;

    // 2️⃣ Gửi file wav để enroll
    const tempPath = path.join(process.cwd(), `temp-${Date.now()}.wav`);
    fs.writeFileSync(tempPath, Buffer.from(await voice.arrayBuffer()));

    const enrollRes = await axios.post(
      `${AZURE_BASE}/speaker-recognition/verification/text-dependent/profiles/${profileId}/enrollments`,
      fs.createReadStream(tempPath),
      {
        headers: {
          "Ocp-Apim-Subscription-Key": AZURE_KEY!,
          "Content-Type": "audio/wav",
        },
      }
    );

    fs.unlinkSync(tempPath);

    const result = enrollRes.data;

    // 3️⃣ Lưu profileId vào voiceUrl
    await UserCCCD.findOneAndUpdate(
      { userId },
      { voiceUrl: profileId },
      { new: true }
    );

    return NextResponse.json({
      success: true,
      profileId,
      enrollmentStatus: result.enrollmentStatus,
      enrollmentsCount: result.enrollmentsCount,
      remainingEnrollmentsCount: result.remainingEnrollmentsCount,
    });
  } catch (error: unknown) {
    if (axios.isAxiosError(error)) {
      console.error(
        "❌ Voice enroll error:",
        error.response?.data || error.message
      );
    } else {
      console.error("❌ Voice enroll error:", error);
    }
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}
