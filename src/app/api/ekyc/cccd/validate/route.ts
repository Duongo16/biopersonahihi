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
    // Lấy token từ cookie
    const token = req.cookies.get("token")?.value;
    if (!token) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    // Giải mã token để lấy user ID
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || ""
    ) as jwt.JwtPayload;
    const userId = decoded.id;

    // Tải lên file ảnh CCCD
    const formData = await req.formData();
    const idFront = formData.get("idFront") as File;
    const idBack = formData.get("idBack") as File;

    if (!idFront || !idBack) {
      return NextResponse.json(
        { message: "Thiếu ảnh mặt trước hoặc mặt sau của CCCD" },
        { status: 400 }
      );
    }

    // Kiểm tra loại file
    const allowedTypes = ["image/png", "image/jpeg", "image/jpg"];
    if (
      !allowedTypes.includes(idFront.type) ||
      !allowedTypes.includes(idBack.type)
    ) {
      return NextResponse.json(
        { message: "Định dạng ảnh không hợp lệ. Chỉ chấp nhận PNG và JPG." },
        { status: 400 }
      );
    }

    // Lưu file tạm để gửi tới FPT.AI
    const uploadDir = path.join(process.cwd(), "public", "uploads");
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    const frontFileName = `${userId}-id-front-${Date.now()}.${
      idFront.type.split("/")[1]
    }`;
    const backFileName = `${userId}-id-back-${Date.now()}.${
      idBack.type.split("/")[1]
    }`;
    const frontFilePath = path.join(uploadDir, frontFileName);
    const backFilePath = path.join(uploadDir, backFileName);
    fs.writeFileSync(frontFilePath, Buffer.from(await idFront.arrayBuffer()));
    fs.writeFileSync(backFilePath, Buffer.from(await idBack.arrayBuffer()));

    // Gửi ảnh mặt trước tới FPT.AI ID Recognition API
    const form = new FormData();
    form.append("image", fs.createReadStream(frontFilePath));
    form.append("type", "identity_card");

    const fptResponse = await axios.post(
      "https://api.fpt.ai/vision/idr/vnm",
      form,
      {
        headers: {
          "api-key": process.env.FPT_AI_API_KEY || "",
          ...form.getHeaders(),
        },
      }
    );

    const fptData = fptResponse.data;

    if (fptResponse.status === 200 && fptData.data) {
      const extractedID = fptData.data[0].id;
      const extractedName = fptData.data[0].name;
      const extractedDOB = fptData.data[0].dob;

      // Kiểm tra xem số CCCD đã tồn tại hay chưa
      const duplicateCCCD = await UserCCCD.findOne({ idNumber: extractedID });
      if (duplicateCCCD) {
        return NextResponse.json(
          { message: "Số CCCD này đã tồn tại. Không thể đăng ký trùng." },
          { status: 400 }
        );
      }

      // Lưu thông tin CCCD vào database
      await connectDB();
      const newUserCCCD = new UserCCCD({
        userId,
        idNumber: extractedID,
        fullName: extractedName,
        dateOfBirth: extractedDOB,
        idFrontUrl: `/uploads/${frontFileName}`,
        idBackUrl: `/uploads/${backFileName}`,
        verified: true,
      });

      await newUserCCCD.save();

      return NextResponse.json({
        message: "CCCD verified and saved successfully",
        extractedID,
        extractedName,
        extractedDOB,
        frontUrl: `/uploads/${frontFileName}`,
        backUrl: `/uploads/${backFileName}`,
      });
    }

    console.error("FPT API Response Error:", fptData);
    return NextResponse.json(
      { message: "CCCD verification failed" },
      { status: 400 }
    );
  } catch (error) {
    console.error("Error validating CCCD:", error);
    return NextResponse.json(
      { message: "Failed to validate CCCD" },
      { status: 500 }
    );
  }
}
