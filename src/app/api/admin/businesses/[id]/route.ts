import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/utils/db";
import User from "@/utils/models/User";

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();
    const { id } = params;
    const { apiKey } = await req.json();

    const updated = await User.findByIdAndUpdate(id, { apiKey }, { new: true });
    if (!updated) {
      return NextResponse.json(
        { message: "Business not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: "API key updated", business: updated });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { message: "Failed to update business" },
      { status: 500 }
    );
  }
}
