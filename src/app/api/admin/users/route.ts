import { NextResponse } from "next/server";
import connectDB from "@/utils/db";
import User from "@/utils/models/User";
import bcrypt from "bcryptjs";
import UserCCCD from "@/utils/models/UserCCCD";

export async function GET() {
  try {
    await connectDB();

    interface IUser {
      _id: string;
      username: string;
      email: string;
      isBanned: boolean;
      createdAt: Date;
      updatedAt: Date;
    }

    interface IUserCCCD {
      userId: string;
      verified: boolean;
    }

    // Gắn kiểu cho users
    const users: IUser[] = await User.find(
      { role: "user" },
      "_id username email isBanned createdAt updatedAt"
    ).lean<IUser[]>();

    const userIds = users.map((u) => u._id.toString());

    const userCCCDs: IUserCCCD[] = await UserCCCD.find(
      { userId: { $in: userIds } },
      "userId verified"
    ).lean<IUserCCCD[]>();

    const verifiedMap = new Map(
      userCCCDs.map((u) => [u.userId.toString(), u.verified])
    );

    const usersWithVerified = users.map((user) => ({
      ...user,
      verified: verifiedMap.get(user._id.toString()) ?? false,
    }));

    return NextResponse.json({ users: usersWithVerified });
  } catch (err) {
    console.error("GET /api/admin/users error:", err);
    return NextResponse.json(
      { message: "Failed to fetch users" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    await connectDB();
    const body = await req.json();
    const { username, email, password, role, businessId } = body;

    if (!username || !email || !password || !role) {
      return NextResponse.json(
        { message: "Thiếu thông tin cần thiết" },
        { status: 400 }
      );
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return NextResponse.json(
        { message: "Email đã được sử dụng" },
        { status: 400 }
      );
    }

    const passwordHashed = await bcrypt.hash(password, 10);

    const newUser = await User.create({
      username,
      email,
      password: passwordHashed,
      role,
      verified: false,
      businessId: role === "user" ? businessId : undefined,
    });

    return NextResponse.json({ user: newUser }, { status: 201 });
  } catch (err) {
    console.error("POST /api/admin/users error:", err);
    return NextResponse.json(
      { message: "Đã xảy ra lỗi server" },
      { status: 500 }
    );
  }
}
