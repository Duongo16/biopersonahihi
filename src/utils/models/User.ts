import { Document, Schema, model, models } from "mongoose";

export interface IUser extends Document {
  username: string;
  email: string;
  password: string;
  createdAt: Date;
  role: "admin" | "business" | "user";
  apiKey?: string;
  businessId?: string;
}

const UserSchema = new Schema<IUser>({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ["admin", "business", "user"], default: "user" },
  apiKey: { type: String, unique: true, sparse: true },
  businessId: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: function () {
      return this.role === "user";
    },
  },
  createdAt: { type: Date, default: Date.now },
});

const User = models.User || model<IUser>("User", UserSchema);
export default User;
