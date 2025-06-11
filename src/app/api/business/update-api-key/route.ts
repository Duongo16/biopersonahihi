import { NextResponse, NextRequest } from "next/server";
import connectDB from "@/utils/db";
import User from "@/utils/models/User";
import { nanoid } from "nanoid";
import { jwtVerify } from "jose";

export async function PATCH(req: NextRequest) {
  try {
    const token = req.cookies.get("token")?.value;

    if (!token) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const secret = new TextEncoder().encode(process.env.JWT_SECRET || "");
    const { payload: decoded } = await jwtVerify(token, secret);

    if (!decoded || (decoded.role !== "business" && decoded.role !== "admin")) {
      return NextResponse.json(
        { message: "Chỉ business hoặc admin mới có quyền cập nhật API key." },
        { status: 403 }
      );
    }

    await connectDB();

    const newApiKey = nanoid(32);

    const updatedBusiness = await User.findByIdAndUpdate(
      decoded.id as string,
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
