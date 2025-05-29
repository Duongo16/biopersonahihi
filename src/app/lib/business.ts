import connectDB from "@/utils/db";
import User from "@/utils/models/User";

export async function getAllBusinesses() {
  await connectDB();
  const businesses = await User.find({ role: "business" })
    .select("_id name email apiKey createdAt")
    .exec();
  return businesses;
}

export async function getBusinessUsers(businessId: string) {
  await connectDB();
  const users = await User.find({ businessId })
    .select("_id username email createdAt role")
    .exec();
  return users;
}
