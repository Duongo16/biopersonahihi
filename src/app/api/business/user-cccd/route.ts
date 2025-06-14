import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/utils/db";
import UserCCCD from "@/utils/models/UserCCCD";
import { verifyTokenWithRole } from "../../..//lib/auth";
import { getBusinessUsers } from "../../../lib/business";

export async function GET(req: NextRequest) {
  const { user: businessUser, error } = await verifyTokenWithRole(req, [
    "business",
  ]);
  if (error || !businessUser) return error;

  const businessId = businessUser.id;

  if (typeof businessId !== "string" && typeof businessId !== "number") {
    return NextResponse.json(
      { message: "businessId không hợp lệ" },
      { status: 400 }
    );
  }

  const userId = req.nextUrl.searchParams.get("userId");
  if (!userId) {
    return NextResponse.json({ message: "Thiếu userId" }, { status: 400 });
  }

  const users = await getBusinessUsers(businessId.toString());
  const userIds = users.map((u) => u._id.toString());
  if (!userIds.includes(userId)) {
    return NextResponse.json(
      { message: "Người dùng không thuộc quyền quản lý của bạn" },
      { status: 403 }
    );
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
