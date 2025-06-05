import { NextResponse } from "next/server";
import connectDB from "@/utils/db";
import User from "@/utils/models/User";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function PATCH(req: Request, context: any) {
  await connectDB();

  const user = await User.findById(context.params.id);
  if (!user)
    return NextResponse.json({ message: "User not found" }, { status: 404 });

  user.isBanned = !user.isBanned;
  await user.save();

  return NextResponse.json({ user });
}
