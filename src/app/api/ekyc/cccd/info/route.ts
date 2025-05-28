import { NextResponse, NextRequest } from "next/server";
import connectDB from "@/utils/db";
import UserCCCD from "@/utils/models/UserCCCD";
import jwt from "jsonwebtoken";

export async function GET(req: NextRequest) {
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

    // Kết nối tới database và lấy thông tin CCCD
    await connectDB();
    const userCCCD = await UserCCCD.findOne({ userId });
    if (!userCCCD) {
      return NextResponse.json(
        { message: "CCCD not registered" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      idNumber: userCCCD.idNumber,
      fullName: userCCCD.fullName,
      dateOfBirth: userCCCD.dateOfBirth,
      idFrontUrl: userCCCD.idFrontUrl,
      idBackUrl: userCCCD.idBackUrl,
      verified: userCCCD.verified,
      faceUrl: userCCCD.faceUrl,
      voiceVector: userCCCD.voiceVector,
    });
  } catch (error) {
    console.error("Error fetching CCCD info:", error);
    return NextResponse.json(
      { message: "Failed to fetch CCCD info" },
      { status: 500 }
    );
  }
}
