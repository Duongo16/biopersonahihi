"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Mail, LockKeyhole, User } from "lucide-react";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Button } from "../components/ui/button";
import { Separator } from "@radix-ui/react-separator";
import toast from "react-hot-toast";

export default function RegisterPage() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [businessId, setBusinessId] = useState("");
  const [businesses, setBusinesses] = useState<
    { _id: string; username: string; email: string }[]
  >([]);
  const router = useRouter();

  useEffect(() => {
    const fetchBusinesses = async () => {
      try {
        const response = await fetch("/api/business/list");
        const data = await response.json();
        setBusinesses(data.businesses);
      } catch (error) {
        console.error("Error fetching businesses:", error);
        toast.error("Đã xảy ra lỗi khi tải danh sách business.");
      }
    };

    fetchBusinesses();
  }, []);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!username || !email || !password || !confirmPassword || !businessId) {
      toast.error("Vui lòng điền đầy đủ thông tin.", { icon: "⚠️" });
      return;
    }

    if (password !== confirmPassword) {
      toast.error("Mật khẩu nhập lại không khớp.");
      return;
    }

    try {
      toast.loading("Đang tạo tài khoản...", { id: "register" });

      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, email, password, businessId }),
      });

      const data = await response.json();

      toast.dismiss("register");

      if (response.ok) {
        toast.success(data.message || "Tạo tài khoản thành công! 🎉");
        router.push("/login");
      } else {
        toast.error(data.message || "Đăng ký thất bại.");
      }
    } catch (error) {
      console.error("❌ Error during registration:", error);
      toast.dismiss("register");
      toast.error("Đã xảy ra lỗi khi tạo tài khoản. Vui lòng thử lại.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center text-main from-slate-100 to-slate-200 p-25">
      <Card className="w-full max-w-md shadow-xl border-0">
        <CardHeader className="space-y-1">
          <div className="flex justify-center mb-2">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
              <User className="h-6 w-6 text-primary" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold text-center text-primary">
            Create an Account
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleRegister} className="space-y-4">
            <div className="space-y-2">
              <div className="relative">
                <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="username"
                  type="text"
                  placeholder="Enter your username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="pl-10"
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10"
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <div className="relative">
                <LockKeyhole className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10"
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <div className="relative">
                <LockKeyhole className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="Re-enter your password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="pl-10"
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <select
                id="business"
                value={businessId}
                onChange={(e) => setBusinessId(e.target.value)}
                className="w-full p-2 border rounded-lg"
                required
              >
                <option value="">Select a business</option>
                {businesses.map((business) => (
                  <option key={business._id} value={business._id}>
                    {business.username} ({business.email})
                  </option>
                ))}
              </select>
            </div>
            <Button type="submit" className="w-full px-8">
              Sign Up
            </Button>
          </form>
        </CardContent>
        <Separator />
        <CardFooter className="flex flex-col space-y-4 pt-4">
          <div className="text-sm text-center text-muted-foreground">
            Already have an account?{" "}
            <Link
              href="/login"
              className="text-primary hover:underline font-medium"
            >
              Sign in
            </Link>
          </div>
          <div className="text-sm text-center text-muted-foreground">
            You want to register your business?{" "}
            <Link
              href="/register-business"
              className="text-primary hover:underline font-medium"
            >
              Register Business
            </Link>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
