// app/api/business/user-cccd/route.ts
import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/utils/db";
import UserCCCD from "@/utils/models/UserCCCD";

export async function GET(req: NextRequest) {
  const userId = req.nextUrl.searchParams.get("userId");

  if (!userId) {
    return NextResponse.json({ message: "Thiếu userId" }, { status: 400 });
  }

  await connectDB();
  const cccd = await UserCCCD.findOne({ userId });

  if (!cccd) {
    return NextResponse.json(
      { message: "Không tìm thấy CCCD" },
      { status: 404 }
    );
  }

  return NextResponse.json({ cccd });
}
