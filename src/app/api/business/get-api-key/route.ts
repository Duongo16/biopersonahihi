import { NextResponse, NextRequest } from "next/server";
import connectDB from "@/utils/db";
import User from "@/utils/models/User";
import { jwtVerify } from "jose";

export async function GET(req: NextRequest) {
  try {
    const authHeader = req.headers.get("authorization");

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const token = authHeader.split(" ")[1];

    if (!token) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const secret = new TextEncoder().encode(process.env.JWT_SECRET || "");
    const { payload: decoded } = await jwtVerify(token, secret);

    if (!decoded || decoded.role !== "business") {
      return NextResponse.json(
        { message: "Chỉ business mới có quyền xem API key." },
        { status: 403 }
      );
    }

    await connectDB();

    const business = await User.findById(decoded.id).select("apiKey");

    return NextResponse.json({ apiKey: business?.apiKey || "" });
  } catch (error) {
    console.error("Error getting API key:", error);
    return NextResponse.json(
      { message: "Đã xảy ra lỗi khi lấy API key." },
      { status: 500 }
    );
  }
}
