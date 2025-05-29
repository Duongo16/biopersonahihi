import { NextResponse } from "next/server";
import connectDB from "@/utils/db";
import User from "@/utils/models/User";

export async function GET() {
  try {
    await connectDB();
    const users = await User.find(
      {},
      "_id username email verified createdAt"
    ).where("role", "user");
    return NextResponse.json({ users });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { message: "Failed to fetch users" },
      { status: 500 }
    );
  }
}
