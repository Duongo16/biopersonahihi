import { NextResponse } from "next/server";

export async function GET() {
  try {
    // Xóa token bằng cách thiết lập cookie rỗng
    const response = NextResponse.json(
      { message: "Đăng xuất thành công" },
      { status: 200 }
    );
    response.cookies.set("token", "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 0,
    });
    return response;
  } catch (error) {
    console.error("❌ Error in logout route:", error);
    return NextResponse.json({ message: "Lỗi máy chủ" }, { status: 500 });
  }
}
