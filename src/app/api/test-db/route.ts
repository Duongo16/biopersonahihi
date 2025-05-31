import { NextResponse } from "next/server";
import connectDB from "@/utils/db";
import User from "@/utils/models/User";

export async function GET() {
  try {
    await connectDB();

    const users = await User.find().limit(5);

    return NextResponse.json({
      message: "✅ MongoDB connected successfully",
      users,
    });
  } catch (error) {
    console.error("❌ MongoDB connection error:", error);
    return NextResponse.json(
      { message: "❌ Failed to connect to MongoDB", error },
      { status: 500 }
    );
  }
}
