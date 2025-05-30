import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import connectDB from "@/utils/db";
import VerificationLog from "@/utils/models/VerificationLog";
import { getBusinessUsers } from "@/app/lib/business";

export async function GET() {
  try {
    const cookieStore = cookies();
    const token = (await cookieStore).get("token")?.value;

    if (!token) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || ""
    ) as jwt.JwtPayload;

    interface BusinessUser {
      _id: string;
    }
    const users = await getBusinessUsers(decoded.id);
    const userIds = users.map((user: BusinessUser) => user._id);

    await connectDB();

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
