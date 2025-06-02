"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import useAuthStore from "@/store/authStore";

import { LockKeyhole, Mail } from "lucide-react";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Label } from "@radix-ui/react-label";
import { Input } from "../components/ui/input";
import { Checkbox } from "../components/ui/checkbox";
import { Button } from "../components/ui/button";
import { Separator } from "@radix-ui/react-separator";
import toast from "react-hot-toast";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);

  const router = useRouter();
  const setUser = useAuthStore((state) => state.setUser);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !password) {
      toast.error("Vui lòng nhập đầy đủ email và mật khẩu.", {
        icon: "⚠️",
      });
      return;
    }

    try {
      toast.loading("Đang đăng nhập...", { id: "login" });

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_AUTH_API}/auth/login`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email, password, rememberMe }),
          credentials: "include",
        }
      );

      const data = await response.json();

      if (response.ok) {
        toast.dismiss("login");
        toast.success(data.message || "Đăng nhập thành công! 🎉");

        // Lấy thông tin người dùng
        const userResponse = await fetch(
          `${process.env.NEXT_PUBLIC_AUTH_API}/auth/me`,
          {
            method: "GET",
            credentials: "include",
          }
        );
        const userData = await userResponse.json();

        if (userResponse.ok) {
          setUser(userData.user);
        }

        router.push("/");
      } else {
        toast.dismiss("login");
        toast.error(data.detail || "Đăng nhập thất bại.");
      }
    } catch (error) {
      console.error("❌ Error during login:", error);
      toast.dismiss("login");
      toast.error("Đã xảy ra lỗi khi đăng nhập. Vui lòng thử lại.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center text-main from-slate-100 to-slate-200 p-4">
      <Card className="w-full max-w-md shadow-xl border-0">
        <CardHeader className="space-y-1">
          <div className="flex justify-center mb-2">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
              <LockKeyhole className="h-6 w-6 text-primary" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold text-center text-primary">
            Welcome Back
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
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
            <div className="flex items-center space-x-2">
              <Checkbox
                id="remember"
                checked={rememberMe}
                className="h-4 w-4 text-primary border-gray-300 rounded focus:ring-primary"
                onCheckedChange={(checked) => setRememberMe(checked === true)}
              />

              <Label htmlFor="remember" className="text-sm font-medium">
                Remember me
              </Label>
              <div className="flex items-center ml-auto">
                <Link
                  href="/forgot-password"
                  className="text-xs text-primary hover:underline"
                >
                  Forgot password?
                </Link>
              </div>
            </div>
            <Button type="submit" className="w-full px-8">
              Sign In
            </Button>
          </form>
        </CardContent>
        <Separator />
        <CardFooter className="flex flex-col space-y-4 pt-4">
          <div className="text-sm text-center text-muted-foreground">
            Don&apos;t have an account?{" "}
            <Link
              href="/register"
              className="text-primary hover:underline font-medium"
            >
              Sign up
            </Link>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
