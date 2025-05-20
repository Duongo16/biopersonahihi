import { NextResponse } from "next/server";
import connectDB from "@/utils/db";
import User from "@/utils/models/User";

export async function GET() {
  try {
    await connectDB();

    // Lấy tất cả các business
    const businesses = await User.find({ role: "business" }).select(
      "_id username email"
    );

    return NextResponse.json({ businesses });
  } catch (error) {
    console.error("Error fetching businesses:", error);
    return NextResponse.json(
      { message: "Đã xảy ra lỗi khi lấy danh sách business." },
      { status: 500 }
    );
  }
}
