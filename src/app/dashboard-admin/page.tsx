"use client";

import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "../components/ui/dialog";

import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import toast from "react-hot-toast";

type User = {
  isBanned: boolean;
  updatedAt: string | number | Date;
  _id: string;
  email: string;
  username: string;
  verified: boolean;
  createdAt: string;
};

type Business = {
  isBanned: boolean;
  updatedAt: string | number | Date;
  createdAt: string | number | Date;
  _id: string;
  username: string;
  email: string;
  apiKey: string;
};

export default function AdminDashboardPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [editingKey, setEditingKey] = useState<string | null>(null);
  const [newApiKey, setNewApiKey] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [newUser, setNewUser] = useState({
    username: "",
    email: "",
    password: "",
    role: "user", // default
    businessId: "",
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const userRes = await fetch("/api/admin/users");
        const userData = await userRes.json();
        if (Array.isArray(userData.users)) {
          setUsers(userData.users);
        } else {
          toast.error("Dữ liệu người dùng không hợp lệ");
        }

        const bizRes = await fetch("/api/admin/businesses");
        const bizData = await bizRes.json();
        if (Array.isArray(bizData.businesses)) {
          setBusinesses(bizData.businesses);
        } else {
          toast.error("Dữ liệu doanh nghiệp không hợp lệ");
        }
      } catch {
        toast.error("Lỗi khi tải dữ liệu");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const updateApiKey = async (businessId: string) => {
    try {
      const res = await fetch(`/api/admin/businesses/${businessId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ apiKey: newApiKey }),
      });
      if (res.ok) {
        toast.success("✅ Đã cập nhật API key");
        setEditingKey(null);
        const updated = await res.json();
        setBusinesses((prev) =>
          prev.map((b) => (b._id === businessId ? updated.business : b))
        );
      } else {
        toast.error("❌ Cập nhật thất bại");
      }
    } catch {
      toast.error("❌ Có lỗi xảy ra khi cập nhật");
    }
  };

  if (loading) {
    return (
      <div className="p-6 text-center text-lg">🔄 Đang tải dữ liệu...</div>
    );
  }

  return (
    <div className="p-6 space-y-10 max-w-6xl mx-auto mt-15">
      <h1 className="text-3xl font-extrabold mb-4 text-center text-main">
        🛠️ Admin Dashboard 🛠️
      </h1>
      <div className="flex justify-end mb-4">
        <Dialog>
          <DialogTrigger asChild>
            <Button className="bg-main text-white mb-4">
              + Thêm người dùng
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Thêm người dùng mới</DialogTitle>
            </DialogHeader>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
              <Input
                placeholder="Tên người dùng"
                value={newUser.username}
                onChange={(e) =>
                  setNewUser({ ...newUser, username: e.target.value })
                }
              />
              <Input
                placeholder="Email"
                value={newUser.email}
                onChange={(e) =>
                  setNewUser({ ...newUser, email: e.target.value })
                }
              />
              <Input
                placeholder="Mật khẩu"
                type="password"
                value={newUser.password}
                onChange={(e) =>
                  setNewUser({ ...newUser, password: e.target.value })
                }
              />
              <select
                className="border rounded-md p-2"
                value={newUser.role}
                onChange={(e) =>
                  setNewUser({ ...newUser, role: e.target.value })
                }
              >
                <option value="user">User</option>
                <option value="business">Business</option>
                <option value="admin">Admin</option>
              </select>
              {newUser.role === "user" && (
                <select
                  className="border rounded-md p-2"
                  value={newUser.businessId}
                  onChange={(e) =>
                    setNewUser({ ...newUser, businessId: e.target.value })
                  }
                >
                  <option value="">-- Chọn doanh nghiệp --</option>
                  {businesses.map((biz) => (
                    <option key={biz._id} value={biz._id}>
                      {biz.username}
                    </option>
                  ))}
                </select>
              )}
            </div>
            <DialogFooter>
              <Button
                onClick={async () => {
                  try {
                    const res = await fetch(
                      `/api/admin/${newUser.role === "user" ? "users" : "businesses"}`,
                      {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify(newUser),
                      }
                    );
                    if (res.ok) {
                      const created = await res.json();

                      if (newUser.role === "user") {
                        setUsers((prev) => [...prev, created.user]);
                      } else {
                        setBusinesses((prev) => [...prev, created.user]);
                      }
                      toast.success("✅ Đã tạo người dùng");
                      setNewUser({
                        username: "",
                        email: "",
                        password: "",
                        role: "user",
                        businessId: "",
                      });
                    } else {
                      toast.error("❌ Lỗi khi tạo người dùng");
                    }
                  } catch {
                    toast.error("❌ Có lỗi xảy ra khi gửi yêu cầu");
                  }
                }}
                className="bg-main text-white w-full"
              >
                Tạo người dùng
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* USERS TABLE */}
      <Card className="shadow-lg rounded-2xl">
        <CardHeader>
          <CardTitle className="text-xl">👤 Danh sách người dùng</CardTitle>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <table className="w-full text-sm border rounded-md">
            <thead className="bg-gray-100 text-gray-700">
              <tr className="text-left border-b">
                <th className="py-2 px-3">ID</th>
                <th className="py-2 px-3">Tên</th>
                <th className="py-2 px-3">Email</th>
                <th className="py-2 px-3">eKYC</th>
                <th className="py-2 px-3">Ngày tạo</th>
                <th className="py-2 px-3">Ngày cập nhật</th>
                <th className="py-2 px-3">Trạng thái</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr
                  key={user._id}
                  className="border-b odd:bg-gray-50 hover:bg-gray-100 transition"
                >
                  <td className="py-2 px-3">{user._id}</td>
                  <td className="py-2 px-3">{user.username}</td>
                  <td className="py-2 px-3">{user.email}</td>
                  <td className="py-2 px-3">
                    {user.verified ? "✅ Enrolled" : "❌ Not yet"}
                  </td>
                  <td className="py-2 px-3">
                    {new Date(user.createdAt).toLocaleString()}
                  </td>
                  <td className="py-2 px-3">
                    {new Date(user.updatedAt).toLocaleString()}
                  </td>
                  <td className="py-2 px-3">
                    {user.isBanned ? "❌Bị ban" : "✅Hoạt động"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>

      {/* BUSINESSES TABLE */}
      <Card className="shadow-lg rounded-2xl">
        <CardHeader>
          <CardTitle className="text-xl">🏢 Danh sách doanh nghiệp</CardTitle>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <table className="w-full text-sm border rounded-md">
            <thead className="bg-gray-100 text-gray-700">
              <tr className="text-left border-b">
                <th className="py-2 px-3">ID</th>
                <th className="py-2 px-3">Tên</th>
                <th className="py-2 px-3">Email</th>
                <th className="py-2 px-3">Ngày tạo</th>
                <th className="py-2 px-3">Ngày cập nhật</th>
                <th className="py-2 px-3">Trạng thái</th>
                <th className="py-2 px-3">API Key</th>
                <th className="py-2 px-3">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {businesses.map((biz) => (
                <tr
                  key={biz._id}
                  className="border-b odd:bg-gray-50 hover:bg-gray-100 transition align-top"
                >
                  <td className="py-2 px-3">{biz._id}</td>
                  <td className="py-2 px-3">{biz.username}</td>
                  <td className="py-2 px-3">{biz.email}</td>
                  <td className="py-2 px-3">
                    {new Date(biz.createdAt).toLocaleString()}
                  </td>
                  <td className="py-2 px-3">
                    {new Date(biz.updatedAt).toLocaleString()}
                  </td>
                  <td className="py-2 px-3">
                    {biz.isBanned ? "❌Bị ban" : "✅Hoạt động"}
                  </td>
                  <td className="py-2 px-3 w-64">
                    {editingKey === biz._id ? (
                      <Input
                        value={newApiKey}
                        onChange={(e) => setNewApiKey(e.target.value)}
                        className="w-full"
                      />
                    ) : (
                      <span className="truncate block">{biz.apiKey}</span>
                    )}
                  </td>
                  <td className="py-2 px-3">
                    {editingKey === biz._id ? (
                      <Button
                        onClick={() => updateApiKey(biz._id)}
                        className="bg-green-600 hover:bg-green-700 text-white"
                        title="Lưu API Key"
                      >
                        💾 Lưu
                      </Button>
                    ) : (
                      <Button
                        onClick={() => {
                          setEditingKey(biz._id);
                          setNewApiKey(biz.apiKey);
                        }}
                        className="bg-main text-white"
                        title="Chỉnh sửa API Key"
                      >
                        Update API Key
                      </Button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}
