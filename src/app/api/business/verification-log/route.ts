import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";
import connectDB from "@/utils/db";
import VerificationLog from "@/utils/models/VerificationLog";
import { getBusinessUsers } from "@/app/lib/business";

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

    // ✅ Giải mã token bằng jose
    const secret = new TextEncoder().encode(process.env.JWT_SECRET || "");
    const { payload: decoded } = await jwtVerify(token, secret);

    interface BusinessUser {
      _id: string;
    }

    await connectDB();

    const users = await getBusinessUsers(decoded.id as string);
    const userIds = users.map((user: BusinessUser) => user._id);

    const logs = await VerificationLog.find({ userId: { $in: userIds } })
      .sort({ timestamp: -1 })
      .limit(100);

    return NextResponse.json({ success: true, logs });
  } catch (error) {
    console.error("Lỗi lấy danh sách log xác thực:", error);
    return NextResponse.json(
      { success: false, message: "Không thể lấy danh sách log" },
      { status: 500 }
    );
  }
}
