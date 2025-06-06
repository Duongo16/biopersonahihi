"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Input } from "../components/ui/input";
import { Button } from "../components/ui/button";
import toast from "react-hot-toast";

export default function VerifyOtpPage() {
  const [otp, setOtp] = useState("");
  const [mode, setMode] = useState<"user" | "business" | null>(null);
  const router = useRouter();

  useEffect(() => {
    const pendingUser = localStorage.getItem("pendingUser");
    const pendingBusiness = localStorage.getItem("pendingBusiness");

    if (pendingUser) setMode("user");
    else if (pendingBusiness) setMode("business");
    else toast.error("Registration information not found.");
  }, []);

  const handleVerify = async () => {
    const localData =
      mode === "user"
        ? localStorage.getItem("pendingUser")
        : localStorage.getItem("pendingBusiness");

    if (!localData) {
      toast.error("No information found to verify.");
      return;
    }

    const payload = JSON.parse(localData);

    // Bước 1: xác minh OTP
    const verifyRes = await fetch(
      `${process.env.NEXT_PUBLIC_AUTH_API}/auth/verify-otp`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email: payload.email, otp }),
      }
    );

    if (!verifyRes.ok) {
      const data = await verifyRes.json();
      toast.error(data.message || "OTP is incorrect or expired.");
      return;
    }

    // Bước 2: gửi đăng ký thực sự
    const registerEndpoint =
      mode === "user"
        ? `${process.env.NEXT_PUBLIC_AUTH_API}/auth/register`
        : `${process.env.NEXT_PUBLIC_AUTH_API}/auth/register-business`;

    const registerRes = await fetch(registerEndpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      credentials: "include",
    });

    const resData = await registerRes.json();

    if (registerRes.ok) {
      localStorage.removeItem(
        mode === "user" ? "pendingUser" : "pendingBusiness"
      );
      toast.success("Registration successful! 🎉");
      router.push("/login");
    } else {
      toast.error(resData.message || "Registration failed.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="max-w-md w-full space-y-6 bg-white p-6 shadow-md rounded-md">
        <h2 className="text-2xl font-bold text-center text-main">
          Enter the OTP code sent to your email
        </h2>
        <Input
          type="text"
          placeholder="Mã OTP"
          value={otp}
          onChange={(e) => setOtp(e.target.value)}
        />
        <Button className="w-full" onClick={handleVerify}>
          Verify and register
        </Button>
      </div>
    </div>
  );
}
