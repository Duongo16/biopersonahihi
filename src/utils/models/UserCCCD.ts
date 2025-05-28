import { Schema, Document, model, models } from "mongoose";

export interface IUserCCCD extends Document {
  userId: string;
  idNumber: string;
  fullName: string;
  dateOfBirth: string;
  idFrontUrl: string;
  idBackUrl: string;
  faceUrl?: string;
  voiceVector?: number[];
  verified: boolean;
  createdAt: Date;
}

const UserCCCDSchema = new Schema<IUserCCCD>({
  userId: { type: String, required: true },
  idNumber: { type: String, required: true },
  fullName: { type: String, required: true },
  dateOfBirth: { type: String, required: true },
  idFrontUrl: { type: String, required: true },
  idBackUrl: { type: String, required: true },
  faceUrl: { type: String, default: "" },
  voiceVector: { type: [Number], default: [] },
  verified: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
});

const UserCCCD =
  models.UserCCCD || model<IUserCCCD>("UserCCCD", UserCCCDSchema);
export default UserCCCD;
