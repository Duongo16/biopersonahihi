import { NextResponse } from "next/server";
import connectDB from "@/utils/db";
import User from "@/utils/models/User";
import bcrypt from "bcryptjs";

export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
) {
  await connectDB();
  const { username, email, password } = await req.json();
  const updateData: { username: string; email: string; password?: string } = {
    username,
    email,
  };
  if (password) updateData.password = await bcrypt.hash(password, 10);

  const user = await User.findByIdAndUpdate(params.id, updateData, {
    new: true,
  });
  return NextResponse.json({ user });
}
