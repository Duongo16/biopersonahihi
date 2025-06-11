import { NextResponse, NextRequest } from "next/server";
import connectDB from "@/utils/db";
import UserCCCD from "@/utils/models/UserCCCD";
import { jwtVerify } from "jose";

export async function GET(req: NextRequest) {
  try {
    const token = req.cookies.get("token")?.value;
    if (!token) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const secret = new TextEncoder().encode(process.env.JWT_SECRET || "");
    const { payload: decoded } = await jwtVerify(token, secret);
    const userId = decoded.id as string;

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
