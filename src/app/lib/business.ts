import connectDB from "@/utils/db";
import User from "@/utils/models/User";

export async function getBusinessUsers(businessId: string) {
  await connectDB();
  const users = await User.find({ businessId })
    .select("_id username email createdAt role")
    .exec();
  return users;
}
