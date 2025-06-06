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
      toast.error("Please enter your email");
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
        toast.success(data.message || "Password reset email sent");
        setEmail("");
      } else {
        toast.error(data.message || "Unable to process request");
      }
    } catch {
      toast.error("System error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-md mx-auto space-y-4">
      <h1 className="text-2xl font-bold text-center">📧 Forgot Password</h1>
      <p className="text-sm text-gray-600 text-center">
        Enter your email to receive a password reset link
      </p>
      <Input
        type="email"
        placeholder="Email address"
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
        {loading ? "Sending..." : "📨 Send recovery email"}
      </Button>
    </div>
  );
}
