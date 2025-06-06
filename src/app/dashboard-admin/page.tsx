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
import { Badge } from "../components/ui/badge";
import { Label } from "../components/ui/label";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../components/ui/dropdown-menu";
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "../components/ui/sidebar";
import {
  Users,
  Building2,
  BarChart3,
  Search,
  Plus,
  Edit,
  Ban,
  MoreHorizontal,
  UserCheck,
  Key,
  Filter,
  X,
} from "lucide-react";
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

const sidebarItems = [
  {
    title: "Dashboard",
    icon: BarChart3,
    id: "dashboard",
  },
  {
    title: "Users",
    icon: Users,
    id: "users",
  },
  {
    title: "Businesses",
    icon: Building2,
    id: "businesses",
  },
];

export default function AdminDashboard() {
  const [users, setUsers] = useState<User[]>([]);
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [activeTab, setActiveTab] = useState("dashboard");
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);
  const closeSidebar = () => setIsSidebarOpen(false);

  // Dialog states
  const [editingKey, setEditingKey] = useState<string | null>(null);
  const [newApiKey, setNewApiKey] = useState<string>("");
  const [newUser, setNewUser] = useState({
    username: "",
    email: "",
    password: "",
    role: "user",
    businessId: "",
  });
  const [banTarget, setBanTarget] = useState<User | Business | null>(null);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [editValues, setEditValues] = useState({
    username: "",
    email: "",
    password: "",
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const userRes = await fetch("/api/admin/users");
        const userData = await userRes.json();
        if (Array.isArray(userData.users)) {
          console.log(userData.users);
          setUsers(userData.users);
        } else {
          toast.error("Invalid user data");
        }

        const bizRes = await fetch("/api/admin/businesses");
        const bizData = await bizRes.json();
        if (Array.isArray(bizData.businesses)) {
          setBusinesses(bizData.businesses);
        } else {
          toast.error("Invalid business data");
        }
      } catch {
        toast.error("Error loading data");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const updateApiKey = async (businessId: string) => {
    try {
      const res = await fetch(`/api/admin/businesses/${businessId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ apiKey: newApiKey }),
      });
      if (res.ok) {
        toast.success("✅ API key updated");
        setEditingKey(null);
        const updated = await res.json();
        setBusinesses((prev) =>
          prev.map((b) => (b._id === businessId ? updated.business : b))
        );
      } else {
        toast.error("❌ Update failed");
      }
    } catch {
      toast.error("❌ Error updating");
    }
  };

  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter =
      filterStatus === "all" ||
      (filterStatus === "active" && !user.isBanned) ||
      (filterStatus === "banned" && user.isBanned) ||
      (filterStatus === "verified" && user.verified);
    return matchesSearch && matchesFilter;
  });

  const filteredBusinesses = businesses.filter((business) => {
    const matchesSearch =
      business.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      business.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter =
      filterStatus === "all" ||
      (filterStatus === "active" && !business.isBanned) ||
      (filterStatus === "banned" && business.isBanned);
    return matchesSearch && matchesFilter;
  });

  const stats = {
    totalUsers: users.length,
    activeUsers: users.filter((u) => !u.isBanned).length,
    verifiedUsers: users.filter((u) => u.verified).length,
    totalBusinesses: businesses.length,
    activeBusinesses: businesses.filter((b) => !b.isBanned).length,
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">🔄 Loading data...</div>
      </div>
    );
  }

  const renderDashboard = () => (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight text-main">
          Dashboard
        </h2>
        <p className="text-muted-foreground text-main">System overview</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="text-main">
            <div className="text-2xl font-bold">{stats.totalUsers}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active users</CardTitle>
            <UserCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="text-main">
            <div className="text-2xl font-bold">{stats.activeUsers}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">eKYC verified</CardTitle>
            <UserCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="text-main">
            <div className="text-2xl font-bold">{stats.verifiedUsers}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total businesses
            </CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="text-main">
            <div className="text-2xl font-bold">{stats.totalBusinesses}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Active businesses
            </CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="text-main">
            <div className="text-2xl font-bold">{stats.activeBusinesses}</div>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  const renderUsers = () => (
    <div className="space-y-6">
      <div className="md:flex items-center justify-between">
        <div>
          <h2 className="text-main text-3xl font-bold tracking-tight">
            User management
          </h2>
          <p className="text-main text-muted-foreground">
            List and manage user accounts
          </p>
        </div>

        <Dialog>
          <DialogTrigger asChild>
            <Button type="button">
              <Plus className="mr-2 h-4 w-4" />
              Add user
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Add new user</DialogTitle>
            </DialogHeader>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  value={newUser.username}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setNewUser({ ...newUser, username: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={newUser.email}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setNewUser({ ...newUser, email: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={newUser.password}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setNewUser({ ...newUser, password: e.target.value })
                  }
                />
              </div>
              {newUser.role === "user" && (
                <div className="space-y-2">
                  <Label htmlFor="businessId">Select Business</Label>
                  <select
                    id="businessId"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    value={newUser.businessId || ""}
                    onChange={(e) =>
                      setNewUser({ ...newUser, businessId: e.target.value })
                    }
                  >
                    <option value="">-- Select business --</option>
                    {businesses.map((b) => (
                      <option key={b._id} value={b._id}>
                        {b.username}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="role">Role</Label>
                <select
                  id="role"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  value={newUser.role}
                  onChange={(e) =>
                    setNewUser({ ...newUser, role: e.target.value })
                  }
                >
                  <option value="user">User</option>
                  <option value="business">Business</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
            </div>
            <DialogFooter>
              <Button
                onClick={async () => {
                  if (
                    !newUser.username ||
                    !newUser.email ||
                    !newUser.password ||
                    !newUser.role
                  ) {
                    toast.error("❌ Please fill in all required fields");
                    return;
                  }

                  if (newUser.role === "user" && !newUser.businessId) {
                    toast.error("❌ Please select a Business for user");
                    return;
                  }
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
                        const usersRes = await fetch("/api/admin/users");
                        if (usersRes.ok) {
                          const data = await usersRes.json();
                          setUsers(data.users);
                        }
                      } else {
                        setBusinesses((prev) => [...prev, created.user]);
                      }
                      toast.success("✅ User created");
                      setNewUser({
                        username: "",
                        email: "",
                        password: "",
                        role: "user",
                        businessId: "",
                      });
                    } else {
                      toast.error("❌ Error creating user");
                    }
                  } catch {
                    toast.error("❌ Error sending request");
                  }
                }}
                className="w-full"
              >
                Create user
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex flex-col md:flex-row md:items-center md:space-x-4 space-y-4 md:space-y-0">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search users..."
            value={searchTerm}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setSearchTerm(e.target.value)
            }
            className="pl-8"
          />
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="bg-main text-white">
              <Filter className="mr-2 h-4 w-4" />
              Filter:{" "}
              {filterStatus === "all"
                ? "All"
                : filterStatus === "active"
                  ? "Active"
                  : filterStatus === "banned"
                    ? "Banned"
                    : "Verified"}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="bg-white">
            <DropdownMenuItem
              className="hover:bg-gray-200"
              onClick={() => setFilterStatus("all")}
            >
              All
            </DropdownMenuItem>
            <DropdownMenuItem
              className="hover:bg-gray-200"
              onClick={() => setFilterStatus("active")}
            >
              Active
            </DropdownMenuItem>
            <DropdownMenuItem
              className="hover:bg-gray-200"
              onClick={() => setFilterStatus("banned")}
            >
              Banned
            </DropdownMenuItem>
            <DropdownMenuItem
              className="hover:bg-gray-200"
              onClick={() => setFilterStatus("verified")}
            >
              Verified
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full block/overflow-x-auto">
              <thead className=" bg-muted/50">
                <tr>
                  <th className="h-12 px-4 text-left align-middle font-medium">
                    User
                  </th>
                  <th className="h-12 px-4 text-left align-middle font-medium">
                    Email
                  </th>
                  <th className="h-12 px-4 text-left align-middle font-medium">
                    eKYC
                  </th>
                  <th className="h-12 px-4 text-left align-middle font-medium">
                    Status
                  </th>
                  <th className="h-12 px-4 text-left align-middle font-medium">
                    Created at
                  </th>
                  <th className="h-12 px-4 text-left align-middle font-medium">
                    Updated at
                  </th>
                  <th className="h-12 px-4 text-left align-middle font-medium">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((user) => (
                  <tr key={user._id} className=" hover:bg-muted/50">
                    <td className="p-4">
                      <div className="font-medium">{user.username}</div>
                      <div className="text-sm text-muted-foreground">
                        {user._id}
                      </div>
                    </td>
                    <td className="p-4">{user.email}</td>
                    <td className="p-4">
                      <Badge
                        variant={user.verified ? "default" : "secondary"}
                        style={{
                          backgroundColor: !user.verified
                            ? "#fee2e2"
                            : "#dcfce7",
                          color: !user.verified ? "#b91c1c" : "#166534",
                          width: "100%",
                          border: "none",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        {user.verified ? "Verified" : "Not verified"}
                      </Badge>
                    </td>
                    <td className="p-4">
                      <Badge
                        variant={user.isBanned ? "destructive" : "default"}
                        style={{
                          backgroundColor: user.isBanned
                            ? "#fee2e2"
                            : "#dcfce7",
                          color: user.isBanned ? "#b91c1c" : "#166534",
                          width: "100%",
                          border: "none",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        {user.isBanned ? "Banned" : "Active"}
                      </Badge>
                    </td>
                    <td className="p-4 text-sm">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </td>
                    <td className="p-4 text-sm">
                      {new Date(user.updatedAt).toLocaleDateString()}
                    </td>
                    <td className="p-4">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="bg-white">
                          <DropdownMenuItem
                            className="hover:bg-gray-200"
                            onClick={() => {
                              setEditingUser(user);
                              setEditValues({
                                username: user.username,
                                email: user.email,
                                password: "",
                              });
                            }}
                          >
                            <Edit className="mr-2 h-4 w-4" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="hover:bg-gray-200"
                            onClick={() => setBanTarget(user)}
                          >
                            <Ban className="mr-2 h-4 w-4" />
                            {user.isBanned ? "Unban" : "Ban"}
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Edit User Dialog */}
      <Dialog open={!!editingUser} onOpenChange={() => setEditingUser(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Update user</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-username">Username</Label>
              <Input
                id="edit-username"
                value={editValues.username}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setEditValues({ ...editValues, username: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-email">Email</Label>
              <Input
                id="edit-email"
                value={editValues.email}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setEditValues({ ...editValues, email: e.target.value })
                }
              />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="edit-password">
                New password (leave blank if unchanged)
              </Label>
              <Input
                id="edit-password"
                type="password"
                value={editValues.password}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setEditValues({ ...editValues, password: e.target.value })
                }
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingUser(null)}>
              Cancel
            </Button>
            <Button
              onClick={async () => {
                if (!editingUser) return;
                try {
                  const res = await fetch(
                    `/api/admin/users/${editingUser._id}`,
                    {
                      method: "PUT",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify(editValues),
                    }
                  );
                  if (res.ok) {
                    const updated = await res.json();
                    setUsers((prev) =>
                      prev.map((u) =>
                        u._id === editingUser._id ? updated.user : u
                      )
                    );
                    toast.success("✅ User updated");
                    setEditingUser(null);
                  } else {
                    toast.error("❌ Update failed");
                  }
                } catch {
                  toast.error("❌ System error");
                }
              }}
            >
              Save changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Ban User Dialog */}
      <Dialog open={!!banTarget} onOpenChange={() => setBanTarget(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {banTarget?.isBanned ? "Unban account" : "Ban account"}
            </DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p className="text-sm text-muted-foreground">
              Are you sure you want to {banTarget?.isBanned ? "unban" : "ban"}{" "}
              account <strong>{banTarget?.username}</strong>?
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setBanTarget(null)}>
              Cancel
            </Button>
            <Button
              variant={banTarget?.isBanned ? "default" : "destructive"}
              onClick={async () => {
                if (!banTarget) return;
                try {
                  const res = await fetch(
                    `/api/admin/users/${banTarget._id}/ban`,
                    {
                      method: "PATCH",
                    }
                  );
                  if (res.ok) {
                    const updated = await res.json();
                    const usersRes = await fetch("/api/admin/users");
                    if (usersRes.ok) {
                      const data = await usersRes.json();
                      setUsers(data.users);
                    }
                    toast.success(
                      updated.user.isBanned
                        ? "✅ Account has been banned"
                        : "✅ Account has been unbanned"
                    );
                  } else {
                    toast.error("Cannot update ban status");
                  }
                } catch {
                  toast.error("❌ System error");
                } finally {
                  setBanTarget(null);
                }
              }}
            >
              {banTarget?.isBanned ? "Unban" : "Ban"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );

  const renderBusinesses = () => (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight text-main">
          Business management
        </h2>
        <p className="text-muted-foreground text-main">
          List and manage business accounts
        </p>
      </div>

      <div className="flex flex-col md:flex-row md:items-center md:space-x-4 space-y-4 md:space-y-0">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search businesses..."
            value={searchTerm}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setSearchTerm(e.target.value)
            }
            className="pl-8"
          />
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="bg-main text-white">
              <Filter className="mr-2 h-4 w-4" />
              Filter:{" "}
              {filterStatus === "all"
                ? "All"
                : filterStatus === "active"
                  ? "Active"
                  : "Banned"}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="bg-white">
            <DropdownMenuItem
              className="hover:bg-gray-200"
              onClick={() => setFilterStatus("all")}
            >
              All
            </DropdownMenuItem>
            <DropdownMenuItem
              className="hover:bg-gray-200"
              onClick={() => setFilterStatus("active")}
            >
              Active
            </DropdownMenuItem>
            <DropdownMenuItem
              className="hover:bg-gray-200"
              onClick={() => setFilterStatus("banned")}
            >
              Banned
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full block/overflow-x-auto">
              <thead className=" bg-muted/50">
                <tr>
                  <th className="h-12 px-4 text-left align-middle font-medium">
                    Business
                  </th>
                  <th className="h-12 px-4 text-left align-middle font-medium">
                    Email
                  </th>
                  <th className="h-12 px-4 text-left align-middle font-medium">
                    Status
                  </th>
                  <th className="h-12 px-4 text-left align-middle font-medium">
                    API Key
                  </th>
                  <th className="h-12 px-4 text-left align-middle font-medium">
                    Created at
                  </th>
                  <th className="h-12 px-4 text-left align-middle font-medium">
                    Updated at
                  </th>
                  <th className="h-12 px-4 text-left align-middle font-medium">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredBusinesses.map((business) => (
                  <tr key={business._id} className=" hover:bg-muted/50">
                    <td className="p-4">
                      <div className="font-medium">{business.username}</div>
                      <div className="text-sm text-muted-foreground">
                        {business._id}
                      </div>
                    </td>
                    <td className="p-4">{business.email}</td>
                    <td className="p-4">
                      <Badge
                        variant={business.isBanned ? "destructive" : "default"}
                        style={{
                          backgroundColor: business.isBanned
                            ? "#fee2e2"
                            : "#dcfce7",
                          color: business.isBanned ? "#b91c1c" : "#166534",
                          width: "100%",
                          border: "none",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        {business.isBanned ? "Banned" : "Active"}
                      </Badge>
                    </td>
                    <td className="p-4">
                      {editingKey === business._id ? (
                        <div className="flex items-center space-x-2">
                          <Input
                            value={newApiKey}
                            onChange={(
                              e: React.ChangeEvent<HTMLInputElement>
                            ) => setNewApiKey(e.target.value)}
                            className="max-w-xs"
                          />
                          <Button
                            size="sm"
                            onClick={() => updateApiKey(business._id)}
                          >
                            Save
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setEditingKey(null)}
                          >
                            Cancel
                          </Button>
                        </div>
                      ) : (
                        <div className="flex items-center space-x-2">
                          <code className="text-xs bg-muted px-2 py-1 rounded max-w-xs truncate">
                            {business.apiKey}
                          </code>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setEditingKey(business._id);
                              setNewApiKey(business.apiKey);
                            }}
                          >
                            <Key className="h-4 w-4" />
                          </Button>
                        </div>
                      )}
                    </td>
                    <td className="p-4 text-sm">
                      {new Date(business.createdAt).toLocaleDateString()}
                    </td>
                    <td className="p-4 text-sm">
                      {new Date(business.updatedAt).toLocaleDateString()}
                    </td>
                    <td className="p-4">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="bg-white">
                          <DropdownMenuItem
                            className="hover:bg-gray-200"
                            onClick={() => setBanTarget(business)}
                          >
                            <Ban className="mr-2 h-4 w-4" />
                            {business.isBanned ? "Unban" : "Ban"}
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
      {/* Ban Business Dialog */}
      <Dialog open={!!banTarget} onOpenChange={() => setBanTarget(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {banTarget?.isBanned ? "Unban account" : "Ban account"}
            </DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p className="text-sm text-muted-foreground">
              Are you sure you want to {banTarget?.isBanned ? "unban" : "ban"}{" "}
              account <strong>{banTarget?.username}</strong>?
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setBanTarget(null)}>
              Cancel
            </Button>
            <Button
              variant={banTarget?.isBanned ? "default" : "destructive"}
              onClick={async () => {
                if (!banTarget) return;
                try {
                  const res = await fetch(
                    `/api/admin/users/${banTarget._id}/ban`,
                    {
                      method: "PATCH",
                    }
                  );
                  if (res.ok) {
                    const updated = await res.json();
                    setBusinesses((prev) =>
                      prev.map((u) =>
                        u._id === banTarget._id ? updated.user : u
                      )
                    );
                    toast.success(
                      updated.user.isBanned
                        ? "✅ Account has been banned"
                        : "✅ Account has been unbanned"
                    );
                  } else {
                    toast.error("Cannot update ban status");
                  }
                } catch {
                  toast.error("❌ System error");
                } finally {
                  setBanTarget(null);
                }
              }}
            >
              {banTarget?.isBanned ? "Unban" : "Ban"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );

  const renderContent = () => {
    switch (activeTab) {
      case "dashboard":
        return renderDashboard();
      case "users":
        return renderUsers();
      case "businesses":
        return renderBusinesses();
      default:
        return renderDashboard();
    }
  };

  return (
    <div className="md:flex mt-20">
      {/* Overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-30 md:hidden"
          onClick={closeSidebar}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed md:static z-40 top-0 left-0 h-full w-64 bg-white transform transition-transform duration-300 ease-in-out ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        } md:translate-x-0`}
      >
        <div className="flex items-center justify-between px-4 py-2 ">
          <h1 className="text-lg font-semibold">Admin Dashboard</h1>
          <button
            className="md:hidden p-1 rounded hover:bg-gray-100"
            onClick={closeSidebar}
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="p-2">
          <SidebarGroup>
            <SidebarGroupLabel>Management</SidebarGroupLabel>
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

      {/* Main content */}
      <div className="flex-1 min-h-screen">
        <header className="flex items-center gap-2  px-4 md:px-6">
          <Button variant="ghost" className="md:hidden" onClick={toggleSidebar}>
            <BarChart3 className="h-5 w-5" />
          </Button>
        </header>

        <main className="flex-1 space-y-4 p-4 sm:p-6 md:p-8 pt-6 overflow-auto">
          {renderContent()}
        </main>
      </div>
    </div>
  );
}
