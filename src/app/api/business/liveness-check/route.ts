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

    // 👉 Lưu video tạm thời
    const uploadDir = path.join(process.cwd(), "public/uploads/liveness");
    if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

    const videoPath = path.join(uploadDir, `${userId}-live-${Date.now()}.webm`);
    fs.writeFileSync(videoPath, Buffer.from(await videoFile.arrayBuffer()));

    const cmndPath = path.join("public", userCCCD.idFrontUrl);

    // 👉 Gửi đến FPT AI
    const form = new FormData();
    form.append("video", fs.createReadStream(videoPath), {
      filename: "video.webm",
      contentType: "video/webm",
    });
    form.append("cmnd", fs.createReadStream(cmndPath), {
      filename: "face.jpg",
      contentType: "image/jpeg",
    });

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

    const isLive = result?.liveness?.is_live === "true";
    const isMatch = result?.face_match?.isMatch === "true";
    const similarity = parseFloat(result?.face_match?.similarity || "0");
    const spoofProb = parseFloat(result?.liveness?.spoof_prob || "0");

    // 👉 Ghi log
    await VerificationLog.create({
      userId,
      businessId: user?.businessId || null,
      type: "liveness",
      stepPassed: isLive,
      score: similarity,
      timestamp: new Date(),
      extra: {
        isMatch,
        similarity,
        spoofProb,
        warning: result?.liveness?.warning || null,
      },
    });

    // 👉 Xóa video sau khi xử lý xong
    try {
      fs.unlinkSync(videoPath);
    } catch (err) {
      console.warn("⚠️ Không thể xóa video tạm:", videoPath, err);
    }

    return NextResponse.json({
      is_live: isLive,
      is_match: isMatch,
      similarity,
    });
  } catch (err) {
    console.error("Lỗi kiểm tra liveness:", err);
    return NextResponse.json(
      { message: "Lỗi kiểm tra liveness" },
      { status: 500 }
    );
  }
}
