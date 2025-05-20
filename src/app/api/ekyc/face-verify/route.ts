import { NextResponse, NextRequest } from "next/server";
import fs from "fs";
import path from "path";
import jwt from "jsonwebtoken";
import connectDB from "@/utils/db";
import UserCCCD from "@/utils/models/UserCCCD";
import FormData from "form-data";
import axios from "axios";

export const config = {
  api: {
    bodyParser: false,
  },
};

export async function POST(req: NextRequest) {
  try {
    const token = req.cookies.get("token")?.value;
    if (!token) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || ""
    ) as jwt.JwtPayload;
    const userId = decoded.id;

    await connectDB();

    // Lấy thông tin CCCD đã đăng ký
    const userCCCD = await UserCCCD.findOne({ userId });
    if (!userCCCD) {
      return NextResponse.json(
        { message: "Người dùng chưa đăng ký CCCD." },
        { status: 400 }
      );
    }

    // Lấy dữ liệu FormData
    const formData = await req.formData();
    const faceImage = formData.get("faceImage") as File;

    if (!faceImage) {
      return NextResponse.json(
        { message: "Không tìm thấy file ảnh khuôn mặt." },
        { status: 400 }
      );
    }

    // Kiểm tra định dạng file
    const allowedTypes = ["image/png", "image/jpeg", "image/jpg"];
    if (!allowedTypes.includes(faceImage.type)) {
      return NextResponse.json(
        { message: "Định dạng ảnh không hợp lệ. Chỉ chấp nhận PNG và JPG." },
        { status: 400 }
      );
    }

    // Lưu file tạm để gửi tới FPT.AI
    const uploadDir = path.join(process.cwd(), "public", "uploads", "faces");
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    const faceFileName = `${userId}-face-${Date.now()}.${
      faceImage.type.split("/")[1]
    }`;
    const faceFilePath = path.join(uploadDir, faceFileName);
    fs.writeFileSync(faceFilePath, Buffer.from(await faceImage.arrayBuffer()));

    // Gửi ảnh khuôn mặt tới FPT.AI Check Face API
    const form = new FormData();
    form.append(
      "file[]",
      fs.createReadStream(
        path.join(process.cwd(), "public", userCCCD.idFrontUrl)
      )
    );
    form.append("file[]", fs.createReadStream(faceFilePath));

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

    const fptData = fptResponse.data;
    console.log("FPT.AI response:", fptData);

    // Kiểm tra kết quả xác minh khuôn mặt
    if (fptData && fptData.data && fptData.data.similarity >= 80) {
      // Lưu ảnh khuôn mặt nếu xác minh thành công
      userCCCD.faceUrl = `/uploads/faces/${faceFileName}`;
      await userCCCD.save();

      return NextResponse.json({
        message:
          "Khuôn mặt đã được xác minh và lưu thành công. " +
          "Điểm tương đồng: " +
          fptData.data.similarity,
        similarity: fptData.data.similarity,
      });
    }

    return NextResponse.json(
      {
        message: "Khuôn mặt không khớp với ảnh CCCD.",
        similarity: fptData.data.similarity,
      },
      { status: 400 }
    );
  } catch (error) {
    console.error("❌ Error verifying face:", error);
    return NextResponse.json(
      { message: "Đã xảy ra lỗi khi xác minh khuôn mặt." },
      { status: 500 }
    );
  }
}
