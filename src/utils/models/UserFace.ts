import { Schema, Document, model, models } from "mongoose";

export interface IUserFace extends Document {
  userId: string;
  faceImageUrl: string;
  createdAt: Date;
}

const UserFaceSchema = new Schema<IUserFace>({
  userId: { type: String, required: true },
  faceImageUrl: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

const UserFace =
  models.UserFace || model<IUserFace>("UserFace", UserFaceSchema);
export default UserFace;
