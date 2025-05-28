import { NextResponse, NextRequest } from "next/server";
import { getBusinessUsers } from "@/app/lib/business";
import { verifyTokenWithRole } from "@/app/lib/auth";

export async function GET(req: NextRequest) {
  try {
    const { user: businessUser, error } = verifyTokenWithRole(req, [
      "business",
    ]);
    if (error) return error;

    // Lấy tất cả user thuộc business này
    const users = await getBusinessUsers(businessUser.id);
    console.log("Business users:", users);
    return NextResponse.json({ users });
  } catch (error) {
    console.error("Error fetching business users:", error);
    return NextResponse.json(
      { message: "Đã xảy ra lỗi khi lấy danh sách user." },
      { status: 500 }
    );
  }
}
