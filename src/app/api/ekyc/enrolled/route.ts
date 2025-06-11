import connectDB from "@/utils/db";
import UserCCCD from "@/utils/models/UserCCCD";
import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";

export async function GET(req: NextRequest) {
  const token = req.cookies.get("token")?.value;

  if (!token) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const secret = new TextEncoder().encode(process.env.JWT_SECRET || "");
    const { payload } = await jwtVerify(token, secret);

    await connectDB();

    const user = await UserCCCD.findOne({ userId: payload.id });

    if (
      user &&
      user.idFrontUrl &&
      user.idBackUrl &&
      user.faceUrl &&
      user.voiceVector &&
      user.voiceVector.length > 0
    ) {
      return NextResponse.json({ done: true });
    }

    return NextResponse.json({ done: false });
  } catch {
    return NextResponse.json(
      { message: "Invalid or expired token" },
      { status: 401 }
    );
  }
}
