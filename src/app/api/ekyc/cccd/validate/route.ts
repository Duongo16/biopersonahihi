import { NextResponse, NextRequest } from "next/server";
// import fs from "fs";
// import path from "path";
import jwt from "jsonwebtoken";
import connectDB from "@/utils/db";
import UserCCCD from "@/utils/models/UserCCCD";
import FormData from "form-data";
import axios from "axios";
import { getBusinessUsers } from "@/app/lib/business";
import cloudinary from "@/utils/cloudinary";
import { fileToDataUri } from "@/utils/clound-file";

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
    console.log(decoded);

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

    // Gửi ảnh mặt trước tới FPT.AI ID Recognition API
    const frontBuffer = Buffer.from(await idFront.arrayBuffer());
    const form = new FormData();
    form.append("image", frontBuffer, {
      filename: "id-front.jpg",
      contentType: idFront.type,
    });
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

      interface BusinessUser {
        id: string;
      }
      const users: BusinessUser[] = await getBusinessUsers(decoded.businessId);
      // Kiểm tra xem số CCCD đã tồn tại hay chưa
      const userIds = users.map((user: BusinessUser) => user.id);
      const duplicateCCCD = await UserCCCD.findOne({
        idNumber: extractedID,
        userId: { $in: userIds },
      });
      console.log(extractedID, decoded.businessId, duplicateCCCD);
      if (duplicateCCCD) {
        return NextResponse.json(
          {
            message:
              "Số CCCD này đã được đăng ký ở doanh nghiệp này. Không thể đăng ký trùng.",
          },
          { status: 400 }
        );
      }

      //Upload ảnh vào public local
      // const uploadDir = path.join(process.cwd(), "public", "uploads");
      // if (!fs.existsSync(uploadDir))
      //   fs.mkdirSync(uploadDir, { recursive: true });

      // const frontFileName = `/uploads/${userId}-id-front-${Date.now()}.${idFront.type.split("/")[1]}`;
      // const backFileName = `/uploads/${userId}-id-back-${Date.now()}.${idBack.type.split("/")[1]}`;

      // const frontPath = path.join(uploadDir, frontFileName);
      // const backPath = path.join(uploadDir, backFileName);

      // fs.writeFileSync(frontPath, frontBuffer);
      // fs.writeFileSync(backPath, Buffer.from(await idBack.arrayBuffer()));

      //Upload lên clound
      const frontDataUri = await fileToDataUri(idFront);
      const frontResult = await cloudinary.uploader.upload(frontDataUri, {
        folder: "biopersona/id-fronts",
        public_id: `${userId}-id-front-${Date.now()}`,
      });

      const backDataUri = await fileToDataUri(idBack);
      const backResult = await cloudinary.uploader.upload(backDataUri, {
        folder: "biopersona/id-backs",
        public_id: `${userId}-id-back-${Date.now()}`,
      });

      const frontFileName = frontResult.secure_url;
      const backFileName = backResult.secure_url;

      await connectDB();
      const newUserCCCD = new UserCCCD({
        userId,
        idNumber: extractedID,
        fullName: extractedName,
        dateOfBirth: extractedDOB,
        idFrontUrl: frontFileName,
        idBackUrl: backFileName,
        verified: true,
      });

      await newUserCCCD.save();

      return NextResponse.json({
        message: "CCCD verified and saved successfully",
        extractedID,
        extractedName,
        extractedDOB,
        frontUrl: frontFileName,
        backUrl: backFileName,
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
