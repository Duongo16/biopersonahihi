import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import connectDB from "@/utils/db";
import User from "@/utils/models/User";

export async function GET(req: NextRequest) {
  try {
    const token = req.cookies.get("token")?.value;
    if (!token) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || ""
    ) as jwt.JwtPayload;

    await connectDB();
    const user = await User.findById(decoded.id);
    console.log(user);
    return NextResponse.json({ user }, { status: 200 });
  } catch (error) {
    console.error("❌ Error in me route:", error);
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }
}
