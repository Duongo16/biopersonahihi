import { Schema, model, models, Document } from "mongoose";

export interface IVerificationLog extends Document {
  userId: string | null;
  businessId: string | null;
  type: "face_match" | "liveness";
  result: "passed" | "failed";
  score: number;
  timestamp: Date;
}

const VerificationLogSchema = new Schema<IVerificationLog>({
  userId: { type: String, default: null },
  businessId: { type: String, default: null },
  type: { type: String, enum: ["face_match", "liveness"], required: true },
  result: { type: String, enum: ["passed", "failed"], required: true },
  score: { type: Number, required: true },
  timestamp: { type: Date, default: Date.now },
});

const VerificationLog =
  models.VerificationLog ||
  model<IVerificationLog>("VerificationLog", VerificationLogSchema);
export default VerificationLog;
