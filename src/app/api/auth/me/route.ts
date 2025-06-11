import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";
import connectDB from "@/utils/db";
import User from "@/utils/models/User";

export async function GET(req: NextRequest) {
  try {
    const token = req.cookies.get("token")?.value;
    if (!token) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const secret = new TextEncoder().encode(process.env.JWT_SECRET || "");
    const { payload: decoded } = await jwtVerify(token, secret);

    await connectDB();
    const user = await User.findById(decoded.id);
    console.log(user);
    return NextResponse.json({ user }, { status: 200 });
  } catch (error) {
    console.error("❌ Error in me route:", error);
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }
}
