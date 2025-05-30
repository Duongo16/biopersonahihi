import { NextResponse } from "next/server";
import connectDB from "@/utils/db";
import User from "@/utils/models/User";

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  await connectDB();
  const user = await User.findById(params.id);
  if (!user)
    return NextResponse.json({ message: "User not found" }, { status: 404 });

  user.isBanned = !user.isBanned;
  await user.save();

  return NextResponse.json({ user });
}
