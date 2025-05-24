import { NextRequest, NextResponse } from "next/server";
import path from "path";
import fs from "fs";
import FormData from "form-data";
import axios from "axios";
import connectDB from "@/utils/db";
import UserCCCD from "@/utils/models/UserCCCD";
import User from "@/utils/models/User";
import VerificationLog from "@/utils/models/VerificationLog";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const userId = formData.get("userId") as string;
    const videoFile = formData.get("video") as File;

    if (!userId || !videoFile) {
      return NextResponse.json(
        { message: "Thiếu userId hoặc video" },
        { status: 400 }
      );
    }

    await connectDB();

    const user = await User.findById(userId);
    const userCCCD = await UserCCCD.findOne({ userId });
    if (!userCCCD || !userCCCD.idFrontUrl) {
      return NextResponse.json(
        { message: "Không tìm thấy ảnh CCCD" },
        { status: 404 }
      );
    }

    // 👉 Lưu video
    const uploadDir = path.join(process.cwd(), "public/uploads/liveness");
    if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

    const videoPath = path.join(uploadDir, `${userId}-live-${Date.now()}.mp4`);
    fs.writeFileSync(videoPath, Buffer.from(await videoFile.arrayBuffer()));

    const cmndPath = path.join("public", userCCCD.idFrontUrl);

    // 👉 Gửi video + ảnh CCCD đến FPT AI
    const form = new FormData();
    form.append("video", fs.createReadStream(videoPath));
    form.append("cmnd", fs.createReadStream(cmndPath));

    const response = await axios.post(
      "https://api.fpt.ai/dmp/liveness/v3",
      form,
      {
        headers: {
          "api-key": process.env.FPT_AI_API_KEY || "",
          ...form.getHeaders(),
        },
      }
    );

    const result = response.data;
    const isLive = result.data?.liveness === true;
    const score = result.data?.liveness_score ?? 0;

    // 👉 Ghi log
    await VerificationLog.create({
      userId,
      businessId: user?.businessId || null,
      type: "liveness",
      result: isLive ? "passed" : "failed",
      score,
      timestamp: new Date(),
    });

    return NextResponse.json({ is_live: isLive, score });
  } catch (err) {
    console.error("Lỗi khi kiểm tra liveness:", err);
    return NextResponse.json(
      { message: "Lỗi kiểm tra liveness" },
      { status: 500 }
    );
  }
}
