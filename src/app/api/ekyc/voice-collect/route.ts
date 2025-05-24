import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/utils/db";
import UserCCCD from "@/utils/models/UserCCCD";
import fs from "fs";
import path from "path";
import FormData from "form-data";
import axios from "axios";

const RESEMBLE_API_KEY = process.env.RESEMBLE_API_KEY;
const RESEMBLE_BASE_URL = "https://app.resemble.ai/api/v1";

export async function POST(req: NextRequest) {
  try {
    const form = await req.formData();
    const userId = form.get("userId") as string;
    const voiceFile = form.get("voice") as File;

    if (!userId) {
      return NextResponse.json({ message: "Thiếu userId " }, { status: 400 });
    }
    if (!voiceFile) {
      return NextResponse.json(
        { message: "Thiếu file giọng nói" },
        { status: 400 }
      );
    }

    await connectDB();

    // 1️⃣ Tạo voice profile
    const voiceName = `voice-${userId}`;
    const voiceRes = await axios.post(
      `${RESEMBLE_BASE_URL}/voices`,
      {
        name: voiceName,
        description: `Voice profile for userId ${userId}`,
        gender: "neutral",
      },
      {
        headers: {
          Authorization: `Bearer ${RESEMBLE_API_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    const voiceId = voiceRes.data?.item?.uuid;
    if (!voiceId) {
      return NextResponse.json(
        { message: "Không tạo được voice profile" },
        { status: 500 }
      );
    }

    // 2️⃣ Upload voice file
    const tempPath = path.join(process.cwd(), `temp-${userId}.wav`);
    fs.writeFileSync(tempPath, Buffer.from(await voiceFile.arrayBuffer()));

    const formData = new FormData();
    formData.append("voice", voiceId);
    formData.append("file", fs.createReadStream(tempPath));
    formData.append("is_active", "true");

    await axios.post(`${RESEMBLE_BASE_URL}/recordings`, formData, {
      headers: {
        Authorization: `Token ${RESEMBLE_API_KEY}`,
        ...formData.getHeaders(),
      },
    });

    fs.unlinkSync(tempPath);

    // 3️⃣ Lưu voiceId vào DB
    await UserCCCD.findOneAndUpdate(
      { userId },
      { voiceUrl: voiceId },
      { new: true }
    );

    return NextResponse.json({ success: true, voiceId });
  } catch (err: unknown) {
    if (
      err &&
      typeof err === "object" &&
      "response" in err &&
      "message" in err
    ) {
      console.error(
        "Lỗi xử lý voice enroll:",
        typeof err.response === "object" &&
          err.response &&
          "data" in err.response
          ? (err.response as { data?: unknown }).data
          : err.message
      );
    } else {
      console.error("Lỗi xử lý voice enroll:", err);
    }
    return NextResponse.json(
      { message: "Lỗi khi xử lý voice enroll" },
      { status: 500 }
    );
  }
}
