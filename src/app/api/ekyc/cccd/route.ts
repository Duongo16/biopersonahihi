import { NextResponse, NextRequest } from "next/server";
import fs from "fs";
import path from "path";
import jwt from "jsonwebtoken";
import connectDB from "@/utils/db";
import UserCCCD from "@/utils/models/UserCCCD";

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

    const formData = await req.formData();
    const idFront = formData.get("idFront") as File;
    const idBack = formData.get("idBack") as File;

    if (!idFront || !idBack) {
      return NextResponse.json({ message: "Thiếu ảnh CCCD" }, { status: 400 });
    }

    // Đường dẫn thư mục lưu ảnh
    const uploadDir = path.join(process.cwd(), "public", "uploads");
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    // Tạo đường dẫn file
    const idFrontFileName = `${userId}-id-front-${Date.now()}.png`;
    const idBackFileName = `${userId}-id-back-${Date.now()}.png`;
    const idFrontPath = path.join(uploadDir, idFrontFileName);
    const idBackPath = path.join(uploadDir, idBackFileName);

    // Lưu file vào server
    fs.writeFileSync(idFrontPath, Buffer.from(await idFront.arrayBuffer()));
    fs.writeFileSync(idBackPath, Buffer.from(await idBack.arrayBuffer()));

    // Lưu thông tin vào MongoDB
    await connectDB();
    const userCCCD = new UserCCCD({
      userId,
      idFrontUrl: `/uploads/${idFrontFileName}`,
      idBackUrl: `/uploads/${idBackFileName}`,
    });
    await userCCCD.save();

    return NextResponse.json({ message: "CCCD uploaded successfully" });
  } catch (error) {
    console.error("Error uploading CCCD:", error);
    return NextResponse.json(
      { message: "Failed to upload CCCD" },
      { status: 500 }
    );
  }
}
