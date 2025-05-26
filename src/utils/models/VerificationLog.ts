import { Schema, model, models, Document } from "mongoose";

export interface IVerificationLog extends Document {
  userId: string | null;
  businessId: string | null;
  type: "liveness" | "voice";
  stepPassed: boolean;
  score: number;
  timestamp: Date;
  extra?: Record<string, unknown>;
}

const VerificationLogSchema = new Schema<IVerificationLog>({
  userId: { type: String, default: null },
  businessId: { type: String, default: null },
  type: {
    type: String,
    enum: ["liveness", "voice"],
    required: true,
  },
  stepPassed: { type: Boolean, required: true },
  score: { type: Number, required: true },
  timestamp: { type: Date, default: Date.now },
  extra: { type: Schema.Types.Mixed, default: {} },
});

const VerificationLog =
  models.VerificationLog ||
  model<IVerificationLog>("VerificationLog", VerificationLogSchema);

export default VerificationLog;
