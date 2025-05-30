import { Schema, model, models, Document } from "mongoose";

export interface IVerificationLog extends Document {
  userId: string | null;
  stepPassed: boolean;
  timestamp: Date;
  liveness?: {
    isLive: boolean;
    spoofProb: number;
  };
  faceMatch?: {
    isMatch: boolean;
    similarity: number;
  };
  voice?: {
    isMatch: boolean;
    score: number;
  };
}

const VerificationLogSchema = new Schema<IVerificationLog>({
  userId: { type: String, default: null },
  stepPassed: { type: Boolean, required: true },
  timestamp: { type: Date, default: Date.now },
  liveness: {
    isLive: { type: Boolean },
    spoofProb: { type: Number },
  },
  faceMatch: {
    isMatch: { type: Boolean },
    similarity: { type: Number },
  },
  voice: {
    isMatch: { type: Boolean },
    score: { type: Number },
  },
});

const VerificationLog =
  models.VerificationLog ||
  model<IVerificationLog>("VerificationLog", VerificationLogSchema);

export default VerificationLog;
