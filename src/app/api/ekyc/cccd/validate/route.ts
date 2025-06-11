import { NextResponse, NextRequest } from "next/server";
import connectDB from "@/utils/db";
import UserCCCD from "@/utils/models/UserCCCD";
import FormData from "form-data";
import axios from "axios";
import { getBusinessUsers } from "@/app/lib/business";
import cloudinary from "@/utils/cloudinary";
import { fileToDataUri } from "@/utils/clound-file";
import { jwtVerify } from "jose";

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

    // ✅ Giải mã token bằng jose
    const secret = new TextEncoder().encode(process.env.JWT_SECRET || "");
    const { payload: decoded } = await jwtVerify(token, secret);
    const userId = decoded.id as string;
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
      const users: BusinessUser[] = await getBusinessUsers(
        decoded.businessId as string
      );
      const userIds = users.map((user) => user.id);

      const duplicateCCCD = await UserCCCD.findOne({
        idNumber: extractedID,
        userId: { $in: userIds },
      });

      if (duplicateCCCD) {
        return NextResponse.json(
          {
            message:
              "Số CCCD này đã được đăng ký ở doanh nghiệp này. Không thể đăng ký trùng.",
          },
          { status: 400 }
        );
      }

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
