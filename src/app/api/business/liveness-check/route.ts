import { NextRequest, NextResponse } from "next/server";
import FormData from "form-data";
import axios from "axios";
import connectDB from "@/utils/db";
import UserCCCD from "@/utils/models/UserCCCD";
import { downloadFileBuffer } from "@/utils/clound-file";

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
    const userCCCD = await UserCCCD.findOne({ userId });
    if (!userCCCD || !userCCCD.faceUrl) {
      return NextResponse.json(
        { message: "Không tìm thấy ảnh khuôn mặt" },
        { status: 404 }
      );
    }

    // 👉 Convert video File to Buffer
    const videoBuffer = Buffer.from(await videoFile.arrayBuffer());

    // 👉 Tải ảnh mặt từ faceUrl trên Cloudinary
    const cmndBuffer = await downloadFileBuffer(userCCCD.faceUrl);

    // 👉 Tạo form gửi FPT.AI
    const form = new FormData();
    form.append("video", videoBuffer, {
      filename: "video.webm",
      contentType: "video/webm",
    });
    form.append("cmnd", cmndBuffer, {
      filename: "face.jpg",
      contentType: "image/jpeg", // đảm bảo đúng loại ảnh
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
    console.log(result);
    if (
      result.code !== "200" ||
      result?.liveness?.code !== "200" ||
      result?.face_match?.code !== "200"
    ) {
      throw new Error(result.message);
    }

    const isLive = result?.liveness?.is_live === "true";
    const isMatch = result?.face_match?.isMatch === "true";
    const similarity = parseFloat(result?.face_match?.similarity || "0");
    const spoofProb = parseFloat(result?.liveness?.spoof_prob || "0");

    return NextResponse.json({
      is_live: isLive,
      is_match: isMatch,
      similarity,
      spoofProb,
    });
  } catch (err) {
    console.error("Lỗi kiểm tra liveness:", err);
    return NextResponse.json(
      { message: "Lỗi kiểm tra liveness: " + err },
      { status: 500 }
    );
  }
}
