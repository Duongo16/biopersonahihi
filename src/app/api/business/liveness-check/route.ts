import { NextRequest, NextResponse } from "next/server";
import path from "path";
import fs from "fs";
import FormData from "form-data";
import axios from "axios";
import connectDB from "@/utils/db";
import UserCCCD from "@/utils/models/UserCCCD";

export async function POST(req: NextRequest) {
  let videoPath = "";
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
    if (!userCCCD || !userCCCD.idFrontUrl) {
      return NextResponse.json(
        { message: "Không tìm thấy ảnh CCCD" },
        { status: 404 }
      );
    }

    // 👉 Lưu video tạm thời
    const uploadDir = path.join(process.cwd(), "public/uploads/liveness");
    if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

    videoPath = path.join(uploadDir, `${userId}-live-${Date.now()}.webm`);
    fs.writeFileSync(videoPath, Buffer.from(await videoFile.arrayBuffer()));

    const cmndPath = path.join("public", userCCCD.faceUrl);

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
    if (result.code !== 200) {
      throw new Error(result.message || "Liveness API error");
    }

    const isLive = result?.liveness?.is_live === "true";
    const isMatch = result?.face_match?.isMatch === "true";

    const similarityRaw = result?.face_match?.similarity;
    const spoofProbRaw = result?.liveness?.spoof_prob;

    const similarity = !isNaN(parseFloat(similarityRaw))
      ? parseFloat(similarityRaw)
      : 0;
    const spoofProb = !isNaN(parseFloat(spoofProbRaw))
      ? parseFloat(spoofProbRaw)
      : 0;

    console.log("Kết quả liveness:", {
      isLive,
      isMatch,
      similarity,
      spoofProb,
    });

    return NextResponse.json({
      is_live: isLive,
      is_match: isMatch,
      similarity,
    });
  } catch (err) {
    console.error("Lỗi kiểm tra liveness:", err);
    return NextResponse.json(
      { message: "Lỗi kiểm tra liveness" + err },
      { status: 500 }
    );
  } finally {
    // 👉 Xóa video sau khi xử lý xong
    try {
      fs.unlinkSync(videoPath);
    } catch (err) {
      console.warn("⚠️ Không thể xóa video tạm:", videoPath, err);
    }
  }
}
