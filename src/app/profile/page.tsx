// FULL VERSION WITH RESPONSIVE SIDEBAR
"use client";

import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Badge } from "../components/ui/badge";
import { Label } from "../components/ui/label";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "../components/ui/dialog";
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "../components/ui/sidebar";
import {
  User,
  Settings,
  Shield,
  Key,
  Camera,
  Edit,
  Save,
  Calendar,
  UserCheck,
  Lock,
  X,
  UserRoundX,
} from "lucide-react";
import toast from "react-hot-toast";

const sidebarItems = [
  { title: "Thông tin cá nhân", icon: User, id: "profile" },
  { title: "Bảo mật", icon: Shield, id: "security" },
  { title: "Cài đặt", icon: Settings, id: "settings" },
];

type UserType = {
  username: string;
  email: string;
  verified: boolean;
  role?: string;
  createdAt: string;
  updatedAt: string;
};

export default function ProfilePage() {
  const [user, setUser] = useState<UserType | null>(null);
  const [activeTab, setActiveTab] = useState("profile");
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);
  const closeSidebar = () => setIsSidebarOpen(false);

  const [formData, setFormData] = useState({
    username: "",
    email: "",
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await fetch("/api/auth/me");
        const data = await res.json();
        if (res.ok) {
          setUser(data.user);
          setFormData({
            username: data.user.username,
            email: data.user.email,
            currentPassword: "",
            newPassword: "",
            confirmPassword: "",
          });
        } else {
          toast.error("Không thể lấy thông tin người dùng");
        }
      } catch {
        toast.error("Lỗi kết nối server");
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, []);

  const handleUpdateProfile = async () => {
    setIsUpdating(true);
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_AUTH_API}/auth/update-account`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ username: formData.username }),
          credentials: "include",
        }
      );
      const data = await res.json();
      if (res.ok) {
        toast.success("✅ Cập nhật thông tin thành công!");
        if (user) {
          setUser({
            ...user,
            username: formData.username,
          });
        }
        setIsEditing(false);
      } else {
        toast.error(data.detail || "❌ Lỗi cập nhật hihi");
      }
    } catch {
      toast.error("Không thể kết nối server");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleChangePassword = async () => {
    if (formData.newPassword !== formData.confirmPassword) {
      toast.error("Mật khẩu xác nhận không khớp");
      return;
    }
    if (formData.newPassword.length < 6) {
      toast.error("Mật khẩu mới phải có ít nhất 6 ký tự");
      return;
    }
    setIsUpdating(true);
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_AUTH_API}/auth/change-password`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            currentPassword: formData.currentPassword,
            newPassword: formData.newPassword,
          }),
          credentials: "include",
        }
      );
      const data = await res.json();
      if (res.ok) {
        toast.success("✅ Đổi mật khẩu thành công!");
        setFormData({
          ...formData,
          currentPassword: "",
          newPassword: "",
          confirmPassword: "",
        });
      } else {
        toast.error(data.message || "❌ Lỗi đổi mật khẩu");
      }
    } catch {
      toast.error("Không thể kết nối server");
    } finally {
      setIsUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">🔄 Đang tải dữ liệu...</div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg text-red-500">
          ❌ Không thể tải thông tin người dùng
        </div>
      </div>
    );
  }

  const renderProfile = () => (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight text-main">
          Thông tin cá nhân
        </h2>
        <p className="text-muted-foreground">
          Quản lý thông tin tài khoản của bạn
        </p>
      </div>

      {/* Profile Header */}
      <Card>
        <CardContent className="pt-6">
          <div className="md:flex items-center space-x-4">
            <div className="relative">
              <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                {user.username?.charAt(0)?.toUpperCase() || "U"}
              </div>
              <Button
                size="icon"
                variant="outline"
                className="absolute -bottom-1 -right-1 h-8 w-8 rounded-full"
              >
                <Camera className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-semibold">{user.username}</h3>
              <p className="text-muted-foreground">{user.email}</p>
              <div className="flex items-center gap-2 mt-2">
                <Badge variant={user.verified ? "default" : "secondary"}>
                  {user.verified ? "Đã xác thực" : "Chưa xác thực"}
                </Badge>
                <Badge variant="outline">{user.role || "User"}</Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Profile Information */}
      <Card>
        <CardHeader>
          <CardTitle className="text-main">Thông tin chi tiết</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="username">Tên người dùng</Label>
              <Input
                id="username"
                value={formData.username}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setFormData({ ...formData, username: e.target.value })
                }
                disabled={!isEditing}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" value={formData.email} disabled />
            </div>
            <div className="space-y-2">
              <Label>Ngày tạo tài khoản</Label>
              <div className="flex items-center gap-2 p-2 bg-muted rounded-md">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">
                  {new Date(user.createdAt).toLocaleDateString()}
                </span>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Cập nhật lần cuối</Label>
              <div className="flex items-center gap-2 p-2 bg-muted rounded-md">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">
                  {new Date(user.updatedAt).toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>

          {isEditing ? (
            <div className="flex gap-2 pt-4">
              <Button
                onClick={handleUpdateProfile}
                disabled={isUpdating}
                className="flex items-center gap-2"
              >
                <Save className="h-4 w-4" />
                {isUpdating ? "Đang lưu..." : "Lưu thay đổi"}
              </Button>
              <Button variant="outline" onClick={() => setIsEditing(false)}>
                Hủy
              </Button>
            </div>
          ) : (
            <Button
              variant="outline"
              onClick={() => setIsEditing(!isEditing)}
              className="flex items-center gap-2 bg-main text-white"
            >
              <Edit className="h-4 w-4" />
              {"Chỉnh sửa"}
            </Button>
          )}
        </CardContent>
      </Card>

      {/* Account Statistics */}
      <Card>
        <CardHeader>
          <CardTitle className="text-main">Thống kê tài khoản</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
              {user.verified ? (
                <UserCheck className="h-8 w-8 text-green-600" />
              ) : (
                <UserRoundX className="h-8 w-8 text-red-600" />
              )}
              <div>
                <p className="font-medium">Trạng thái xác thực</p>
                <p className="text-sm text-muted-foreground">
                  {user.verified ? "Đã xác thực email" : "Chưa xác thực"}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
              <Shield className="h-8 w-8 text-blue-600" />
              <div>
                <p className="font-medium">Bảo mật</p>
                <p className="text-sm text-muted-foreground">Mật khẩu mạnh</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
              <Calendar className="h-8 w-8 text-purple-600" />
              <div>
                <p className="font-medium">Thành viên từ</p>
                <p className="text-sm text-muted-foreground">
                  {new Date(user.createdAt).getFullYear()}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderSecurity = () => (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight text-main">Bảo mật</h2>
        <p className="text-muted-foreground">
          Quản lý mật khẩu và cài đặt bảo mật
        </p>
      </div>

      {/* Change Password */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-main">
            <Lock className="h-5 w-5 " />
            Đổi mật khẩu
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="current-password">Mật khẩu hiện tại</Label>
            <Input
              id="current-password"
              type="password"
              value={formData.currentPassword}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setFormData({ ...formData, currentPassword: e.target.value })
              }
              placeholder="Nhập mật khẩu hiện tại"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="new-password">Mật khẩu mới</Label>
            <Input
              id="new-password"
              type="password"
              value={formData.newPassword}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setFormData({ ...formData, newPassword: e.target.value })
              }
              placeholder="Nhập mật khẩu mới (ít nhất 6 ký tự)"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirm-password">Xác nhận mật khẩu mới</Label>
            <Input
              id="confirm-password"
              type="password"
              value={formData.confirmPassword}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setFormData({ ...formData, confirmPassword: e.target.value })
              }
              placeholder="Nhập lại mật khẩu mới"
            />
          </div>
          <Button
            onClick={handleChangePassword}
            disabled={isUpdating}
            className="flex items-center gap-2"
          >
            <Key className="h-4 w-4" />
            {isUpdating ? "Đang cập nhật..." : "Đổi mật khẩu"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );

  const renderSettings = () => (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight text-main">Cài đặt</h2>
        <p className="text-muted-foreground">Tùy chỉnh trải nghiệm sử dụng</p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle className="text-red-600">Vùng nguy hiểm</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="p-4 border ed-200 rounded-lg bg-red-50">
            <p className="font-medium text-red-800 mb-2">Xóa tài khoản</p>
            <p className="text-sm text-red-600 mb-4">
              Hành động này không thể hoàn tác. Tất cả dữ liệu của bạn sẽ bị xóa
              vĩnh viễn.
            </p>
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="destructive" size="sm">
                  Xóa tài khoản
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Xác nhận xóa tài khoản</DialogTitle>
                </DialogHeader>
                <p className="text-sm text-muted-foreground">
                  Bạn có chắc chắn muốn xóa tài khoản? Hành động này không thể
                  hoàn tác.
                </p>
                <DialogFooter>
                  <Button variant="outline">Hủy</Button>
                  <Button variant="destructive">Xóa tài khoản</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderContent = () => {
    switch (activeTab) {
      case "profile":
        return renderProfile();
      case "security":
        return renderSecurity();
      case "settings":
        return renderSettings();
      default:
        return renderProfile();
    }
  };

  return (
    <div className="md:flex mt-20">
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-30 md:hidden"
          onClick={closeSidebar}
        />
      )}

      <aside
        className={`fixed md:static z-40 top-0 left-0 h-full w-64 bg-white  transform transition-transform duration-300 ease-in-out ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        } md:translate-x-0`}
      >
        <div className="flex items-center justify-between px-4 py-2 ">
          <h1 className=" text-lg font-semibold">Tài khoản</h1>
          <button
            className="md:hidden p-1 rounded hover:bg-gray-100"
            onClick={closeSidebar}
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="p-2 md:mt-0 mt-10">
          <SidebarGroup>
            <SidebarGroupLabel>Cài đặt tài khoản</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {sidebarItems.map((item) => (
                  <SidebarMenuItem key={item.id}>
                    <SidebarMenuButton
                      onClick={() => {
                        setActiveTab(item.id);
                        closeSidebar();
                      }}
                      isActive={activeTab === item.id}
                    >
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </div>
      </aside>

      <div className="flex-1 min-h-screen">
        <header className="flex items-center gap-2  px-4 md:px-6">
          <Button variant="ghost" className="md:hidden" onClick={toggleSidebar}>
            <User className="h-5 w-5" />
          </Button>
        </header>

        <main className="flex-1 space-y-4 p-4 sm:p-6 md:p-8 pt-6 overflow-auto">
          {renderContent()}
        </main>
      </div>
    </div>
  );
}
