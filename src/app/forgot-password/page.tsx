"use client";

import { useState } from "react";
import { Input } from "../components/ui/input";
import { Button } from "../components/ui/button";
import toast from "react-hot-toast";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const handleForgotPassword = async () => {
    if (!email) {
      toast.error("Vui lòng nhập email");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_AUTH_API}/auth/forgot-password`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email }),
          credentials: "include",
        }
      );

      const data = await res.json();
      if (res.ok) {
        toast.success(data.message || "Đã gửi email đặt lại mật khẩu");
        setEmail("");
      } else {
        toast.error(data.message || "Không thể xử lý yêu cầu");
      }
    } catch {
      toast.error("Lỗi hệ thống");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-md mx-auto space-y-4">
      <h1 className="text-2xl font-bold text-center">📧 Quên mật khẩu</h1>
      <p className="text-sm text-gray-600 text-center">
        Nhập email để nhận liên kết đặt lại mật khẩu
      </p>
      <Input
        type="email"
        placeholder="Địa chỉ email"
        value={email}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
          setEmail(e.target.value)
        }
      />
      <Button
        onClick={handleForgotPassword}
        disabled={loading}
        className="w-full"
      >
        {loading ? "Đang gửi..." : "📨 Gửi email khôi phục"}
      </Button>
    </div>
  );
}
