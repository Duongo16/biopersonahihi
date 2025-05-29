import { NextResponse, NextRequest } from "next/server";
import connectDB from "@/utils/db";
import User from "@/utils/models/User";
import { nanoid } from "nanoid";
import jwt from "jsonwebtoken";

export async function PATCH(req: NextRequest) {
  try {
    const token = req.cookies.get("token")?.value;

    if (!token) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || ""
    ) as jwt.JwtPayload;

    if (!decoded || (decoded.role !== "business" && decoded.role !== "admin")) {
      return NextResponse.json(
        { message: "Chỉ business hoặc admin mới có quyền cập nhật API key." },
        { status: 403 }
      );
    }

    await connectDB();

    // Tạo API key mới
    const newApiKey = nanoid(32);

    // Cập nhật API key cho business
    const updatedBusiness = await User.findByIdAndUpdate(
      decoded.id,
      { apiKey: newApiKey },
      { new: true }
    );

    return NextResponse.json({
      message: "API key đã được cập nhật thành công.",
      apiKey: updatedBusiness?.apiKey,
    });
  } catch (error) {
    console.error("Error updating API key:", error);
    return NextResponse.json(
      { message: "Đã xảy ra lỗi khi cập nhật API key." },
      { status: 500 }
    );
  }
}
