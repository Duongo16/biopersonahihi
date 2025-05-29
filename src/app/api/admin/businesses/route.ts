import { NextResponse } from "next/server";
import connectDB from "@/utils/db";
import User from "@/utils/models/User";

export async function GET() {
  try {
    await connectDB();
    const businesses = await User.find({}, "_id username apiKey email").where(
      "role",
      "business"
    );
    console.log("Businesses fetched:", businesses);
    return NextResponse.json({ businesses });
  } catch {
    return NextResponse.json(
      { message: "Failed to fetch businesses" },
      { status: 500 }
    );
  }
}
