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
    const liveFace = formData.get("face") as File;

    if (!userId || !liveFace) {
      return NextResponse.json(
        { message: "Thiếu userId hoặc ảnh khuôn mặt." },
        { status: 400 }
      );
    }

    await connectDB();

    const userCCCD = await UserCCCD.findOne({ userId });
    const user = await User.findById(userId);

    if (!userCCCD || !userCCCD.idFrontUrl) {
      return NextResponse.json(
        { message: "Không tìm thấy ảnh CCCD người dùng." },
        { status: 404 }
      );
    }

    const uploadDir = path.join(process.cwd(), "public/uploads/faces");
    if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

    const faceName = `${userId}-live-${Date.now()}.png`;
    const facePath = path.join(uploadDir, faceName);
    fs.writeFileSync(facePath, Buffer.from(await liveFace.arrayBuffer()));

    const form = new FormData();
    form.append(
      "file[]",
      fs.createReadStream(path.join("public", userCCCD.idFrontUrl))
    );
    form.append("file[]", fs.createReadStream(facePath));

    const fptResponse = await axios.post(
      "https://api.fpt.ai/dmp/checkface/v1",
      form,
      {
        headers: {
          "api-key": process.env.FPT_AI_API_KEY || "",
          ...form.getHeaders(),
        },
      }
    );

    const result = fptResponse.data;
    const matching_similarity = result.data.similarity;
    const matched = matching_similarity >= 80;

    await VerificationLog.create({
      userId,
      businessId: user?.businessId || null,
      type: "face_match",
      result: matched ? "passed" : "failed",
      score: matching_similarity,
      timestamp: new Date(),
    });

    return NextResponse.json({ matched, matching_similarity });
  } catch (err) {
    console.error("Error verifying face:", err);
    return NextResponse.json(
      { message: "Lỗi khi xác minh khuôn mặt." },
      { status: 500 }
    );
  }
}
