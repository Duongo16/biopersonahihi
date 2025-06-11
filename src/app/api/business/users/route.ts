import { NextResponse, NextRequest } from "next/server";
import { getBusinessUsers } from "@/app/lib/business";
import { verifyTokenWithRole } from "@/app/lib/auth";

export async function GET(req: NextRequest) {
  try {
    const { user: businessUser, error } = await verifyTokenWithRole(req, [
      "business",
    ]);
    if (error || !businessUser) return error;

    const businessId = businessUser.id;
    console.log("Business:", businessUser);

    if (typeof businessId !== "string" && typeof businessId !== "number") {
      return NextResponse.json(
        { message: "businessId không hợp lệ" },
        { status: 400 }
      );
    }

    // Lấy tất cả user thuộc business này
    const users = await getBusinessUsers(businessId.toString());
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
