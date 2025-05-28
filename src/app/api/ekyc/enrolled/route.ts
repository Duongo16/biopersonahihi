import connectDB from "@/utils/db";
import UserCCCD from "@/utils/models/UserCCCD";
import { NextRequest, NextResponse } from "next/server";
import jwt, { JwtPayload } from "jsonwebtoken";

export async function GET(req: NextRequest) {
  const token = req.cookies.get("token")?.value;

  if (!token) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }
  const decoded = jwt.verify(token, process.env.JWT_SECRET || "") as JwtPayload;
  await connectDB();

  const user = await UserCCCD.findOne({ userId: decoded.id });
  if (
    user &&
    user.idFrontUrl &&
    user.idBackUrl &&
    user.faceUrl &&
    user.voiceVector
  ) {
    return NextResponse.json({ done: true });
  }

  return NextResponse.json({ done: false });
}
