import { NextResponse } from "next/server";
import connectDB from "@/utils/db";
import User from "@/utils/models/User";
import bcrypt from "bcryptjs";

export async function PUT(req: Request, context: { params: { id: string } }) {
  try {
    await connectDB();

    const { username, email, password } = await req.json();

    const updateData: { username: string; email: string; password?: string } = {
      username,
      email,
    };

    if (password) {
      updateData.password = await bcrypt.hash(password, 10);
    }

    const user = await User.findByIdAndUpdate(context.params.id, updateData, {
      new: true,
    });

    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    return NextResponse.json({ user });
  } catch (err) {
    console.error("PUT /api/admin/users/[id] error:", err);
    return NextResponse.json(
      { message: "Failed to update user" },
      { status: 500 }
    );
  }
}
