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
  { title: "Personal Information", icon: User, id: "profile" },
  { title: "Security", icon: Shield, id: "security" },
  { title: "Settings", icon: Settings, id: "settings" },
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
        const res = await fetch(`${process.env.NEXT_PUBLIC_AUTH_API}/auth/me`, {
          method: "GET",
          credentials: "include",
        });
        const data = await res.json();
        console.log(data);
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
          toast.error("Unable to get user information");
        }
      } catch {
        toast.error("Server connection error");
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
        toast.success("✅ Information updated successfully!");
        if (user) {
          setUser({
            ...user,
            username: formData.username,
          });
        }
        setIsEditing(false);
      } else {
        toast.error(data.detail || "❌ Update error");
      }
    } catch {
      toast.error("Unable to connect to server");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleChangePassword = async () => {
    if (formData.newPassword !== formData.confirmPassword) {
      toast.error("Confirmation password does not match");
      return;
    }
    if (formData.newPassword.length < 6) {
      toast.error("New password must be at least 6 characters");
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
        toast.success("✅ Password changed successfully!");
        setFormData({
          ...formData,
          currentPassword: "",
          newPassword: "",
          confirmPassword: "",
        });
      } else {
        toast.error(data.message || "❌ Password change error");
      }
    } catch {
      toast.error("Unable to connect to server");
    } finally {
      setIsUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center text-main text-lg font-semibold animate-pulse">
          Loading user information...
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg text-red-500">
          ❌ Unable to load user information
        </div>
      </div>
    );
  }

  const renderProfile = () => (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight text-main">
          Personal information
        </h2>
        <p className="text-muted-foreground">Manage your account information</p>
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
                <Badge
                  variant={user.verified ? "default" : "secondary"}
                  className={
                    user.verified
                      ? "bg-green-600 text-white"
                      : "bg-yellow-400 text-black"
                  }
                >
                  {user.verified ? "Registered" : "Not registered"}
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
          <CardTitle className="text-main">Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
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
              <Label>Created At</Label>
              <div className="flex items-center gap-2 p-2 bg-muted rounded-md">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">
                  {new Date(user.createdAt).toLocaleDateString()}
                </span>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Updated At</Label>
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
                {isUpdating ? "Saving..." : "Save changes"}
              </Button>
              <Button variant="outline" onClick={() => setIsEditing(false)}>
                Cancel
              </Button>
            </div>
          ) : (
            <Button
              variant="outline"
              onClick={() => setIsEditing(!isEditing)}
              className="flex items-center gap-2 bg-main text-white"
            >
              <Edit className="h-4 w-4" />
              {"Edit"}
            </Button>
          )}
        </CardContent>
      </Card>

      {/* Account Statistics */}
      <Card>
        <CardHeader>
          <CardTitle className="text-main">Account statistics</CardTitle>
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
                <p className="font-medium">eKYC Status</p>
                <p className="text-sm text-muted-foreground">
                  {user.verified ? "eKYC registered" : "eKYC not registered"}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
              <Shield className="h-8 w-8 text-blue-600" />
              <div>
                <p className="font-medium">Security</p>
                <p className="text-sm text-muted-foreground">Strong password</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
              <Calendar className="h-8 w-8 text-purple-600" />
              <div>
                <p className="font-medium">Member from</p>
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
        <h2 className="text-3xl font-bold tracking-tight text-main">
          Security
        </h2>
        <p className="text-muted-foreground">
          Manage passwords and security settings
        </p>
      </div>

      {/* Change Password */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-main">
            <Lock className="h-5 w-5 " />
            Change password
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="current-password">Current Password</Label>
            <Input
              id="current-password"
              type="password"
              value={formData.currentPassword}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setFormData({ ...formData, currentPassword: e.target.value })
              }
              placeholder="Enter current password"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="new-password">New Password</Label>
            <Input
              id="new-password"
              type="password"
              value={formData.newPassword}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setFormData({ ...formData, newPassword: e.target.value })
              }
              placeholder="Enter new password (at least 6 characters)"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirm-password">Confirm new password</Label>
            <Input
              id="confirm-password"
              type="password"
              value={formData.confirmPassword}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setFormData({ ...formData, confirmPassword: e.target.value })
              }
              placeholder="Re-enter new password"
            />
          </div>
          <Button
            onClick={handleChangePassword}
            disabled={isUpdating}
            className="flex items-center gap-2"
          >
            <Key className="h-4 w-4" />
            {isUpdating ? "Updating..." : "Change password"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );

  const renderSettings = () => (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight text-main">
          Settings
        </h2>
        <p className="text-muted-foreground">Customize your user experience</p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle className="text-red-600">Danger zone</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="p-4 border ed-200 rounded-lg bg-red-50">
            <p className="font-medium text-red-800 mb-2">Delete account</p>
            <p className="text-sm text-red-600 mb-4">
              This action cannot be undone. All your data will be permanently
              deleted.
            </p>
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="destructive" size="sm">
                  Delete account
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Confirm account deletion</DialogTitle>
                </DialogHeader>
                <p className="text-sm text-muted-foreground">
                  Are you sure you want to delete your account? This action
                  cannot be undone.
                </p>
                <DialogFooter>
                  <Button variant="outline">Cancel</Button>
                  <Button variant="destructive">Delete account</Button>
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
          <h1 className=" text-lg font-semibold">Account</h1>
          <button
            className="md:hidden p-1 rounded hover:bg-gray-100"
            onClick={closeSidebar}
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="p-2 md:mt-0 mt-10">
          <SidebarGroup>
            <SidebarGroupLabel>Account settings</SidebarGroupLabel>
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
