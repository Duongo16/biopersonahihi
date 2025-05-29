"use client";

import { useState } from "react";
import { Input } from "../components/ui/input";
import { Button } from "../components/ui/button";
import toast from "react-hot-toast";

export default function ChangePasswordPage() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChangePassword = async () => {
    if (newPassword !== confirmPassword) {
      toast.error("❌ Mật khẩu mới không khớp");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/auth/change-password", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword }),
      });

      const data = await res.json();
      if (res.ok) {
        toast.success(data.message || "✅ Đổi mật khẩu thành công");
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
      } else {
        toast.error(data.message || "❌ Đổi mật khẩu thất bại");
      }
    } catch {
      toast.error("❌ Lỗi hệ thống");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-md mx-auto space-y-4 min-h-screen flex flex-col justify-center">
      <h1 className="text-2xl font-bold text-center">🔐 Đổi mật khẩu</h1>
      <Input
        type="password"
        placeholder="Mật khẩu hiện tại"
        value={currentPassword}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
          setCurrentPassword(e.target.value)
        }
      />
      <Input
        type="password"
        placeholder="Mật khẩu mới"
        value={newPassword}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
          setNewPassword(e.target.value)
        }
      />
      <Input
        type="password"
        placeholder="Xác nhận mật khẩu mới"
        value={confirmPassword}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
          setConfirmPassword(e.target.value)
        }
      />
      <Button
        onClick={handleChangePassword}
        disabled={loading}
        className="w-full"
      >
        {loading ? "Đang xử lý..." : "💾 Đổi mật khẩu"}
      </Button>
    </div>
  );
}
