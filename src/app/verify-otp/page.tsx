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
    else toast.error("Không tìm thấy thông tin đăng ký.");
  }, []);

  const handleVerify = async () => {
    const localData =
      mode === "user"
        ? localStorage.getItem("pendingUser")
        : localStorage.getItem("pendingBusiness");

    if (!localData) {
      toast.error("Không tìm thấy thông tin để xác minh.");
      return;
    }

    const payload = JSON.parse(localData);

    // Bước 1: xác minh OTP
    const verifyRes = await fetch("/api/auth/verify-otp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: payload.email, otp }),
    });

    if (!verifyRes.ok) {
      const data = await verifyRes.json();
      toast.error(data.message || "OTP sai hoặc đã hết hạn.");
      return;
    }

    // Bước 2: gửi đăng ký thực sự
    const registerEndpoint =
      mode === "user" ? "/api/auth/register" : "/api/auth/register-business";

    const registerRes = await fetch(registerEndpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const resData = await registerRes.json();

    if (registerRes.ok) {
      localStorage.removeItem(
        mode === "user" ? "pendingUser" : "pendingBusiness"
      );
      toast.success("Đăng ký thành công! 🎉");
      router.push("/login");
    } else {
      toast.error(resData.message || "Đăng ký thất bại.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="max-w-md w-full space-y-6 bg-white p-6 shadow-md rounded-md">
        <h2 className="text-2xl font-bold text-center text-main">
          Nhập mã OTP đã được gửi đến email
        </h2>
        <Input
          type="text"
          placeholder="Mã OTP"
          value={otp}
          onChange={(e) => setOtp(e.target.value)}
        />
        <Button className="w-full" onClick={handleVerify}>
          Xác minh và đăng ký
        </Button>
      </div>
    </div>
  );
}
