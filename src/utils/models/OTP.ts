import mongoose from "mongoose";

const OTPSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  otp: { type: String, required: true },
  expiresAt: {
    type: Date,
    required: true,
    index: { expires: 0 },
  },
  verified: { type: Boolean, default: false },
});

export default mongoose.models.OTP || mongoose.model("OTP", OTPSchema);
