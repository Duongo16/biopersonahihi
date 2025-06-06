/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import { useEffect, useState } from "react";
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from "../components/ui/sidebar";
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../components/ui/dropdown-menu";
import {
  BarChart3,
  Users,
  Key,
  Settings,
  X,
  Search,
  Filter,
  Copy,
  RefreshCw,
  Eye,
  EyeOff,
  Calendar,
  UserPlus,
  FileText,
  Clock,
  Mic,
  User,
  Camera,
  XCircle,
  CheckCircle,
} from "lucide-react";
import toast from "react-hot-toast";

type User = {
  _id: string;
  username: string;
  email: string;
  role: string;
  createdAt: string;
  updatedAt: string;
  isBanned: boolean;
};

interface VerificationLog {
  _id: string;
  userId: string | null;
  stepPassed: boolean;
  timestamp: string;
  liveness?: {
    isLive: boolean;
    spoofProb: number;
  };
  faceMatch?: {
    isMatch: boolean;
    similarity: number;
  };
  voice?: {
    isMatch: boolean;
    score: number;
  };
}

export default function BusinessDashboard() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);
  const closeSidebar = () => setIsSidebarOpen(false);
  const [activeTab, setActiveTab] = useState("dashboard");
  const [users, setUsers] = useState<User[]>([]);
  const [apiKey, setApiKey] = useState("");
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<boolean | undefined>(
    undefined
  );
  const [showApiKey, setShowApiKey] = useState(false);
  const [isUpdatingApiKey, setIsUpdatingApiKey] = useState(false);
  const [verificationLogs, setVerificationLogs] = useState<VerificationLog[]>(
    []
  );
  const [logsLoading, setLogsLoading] = useState(false);
  const [filterStatusLog, setFilterStatusLog] = useState("all");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const userResponse = await fetch("/api/business/users", {
          credentials: "include",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });
        const userData = await userResponse.json();

        if (userResponse.ok) {
          setUsers(userData.users);
        } else {
          toast.error(userData.message);
        }

        const apiResponse = await fetch("/api/business/get-api-key", {
          credentials: "include",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });
        const apiData = await apiResponse.json();

        if (apiResponse.ok) {
          setApiKey(apiData.apiKey || "");
        }

        const logsResponse = await fetch("/api/business/verification-log", {
          credentials: "include",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });
        const logsData = await logsResponse.json();

        if (logsResponse.ok) {
          setVerificationLogs(logsData.logs || []);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        toast.error("An error occurred while loading data");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleApiKeyUpdate = async () => {
    setIsUpdatingApiKey(true);
    try {
      const response = await fetch("/api/business/update-api-key", {
        method: "PATCH",
        credentials: "include",
      });
      const data = await response.json();

      if (response.ok) {
        setApiKey(data.apiKey);
        toast.success("API key updated successfully");
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.error("Error updating API key:", error);
      toast.error("An error occurred while updating API key");
    } finally {
      setIsUpdatingApiKey(false);
    }
  };

  const copyApiKey = () => {
    if (apiKey) {
      navigator.clipboard.writeText(apiKey);
      toast.success("API key copied");
    }
  };

  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      filterStatus === undefined ? true : user.isBanned === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const stats = {
    totalUsers: users.length,
    usersByRole: users.reduce(
      (acc, user) => {
        acc[user.role] = (acc[user.role] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>
    ),
    recentUsers: users.filter(
      (user) =>
        new Date(user.createdAt) >
        new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
    ).length,
  };

  const renderDashboard = () => (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight text-main">
          Business Dashboard
        </h2>
        <p className="text-muted-foreground">
          Overview of the business management system
        </p>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-main">
              {stats.totalUsers}
            </div>
            <p className="text-xs text-muted-foreground">
              Total users in the system
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              New Users (7 days)
            </CardTitle>
            <UserPlus className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-main">
              {stats.recentUsers}
            </div>
            <p className="text-xs text-muted-foreground">
              Users registered in the last 7 days
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              API Key Status
            </CardTitle>
            <Key className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold mt-2">
              <Badge
                variant={apiKey ? "default" : "destructive"}
                style={{
                  backgroundColor: !apiKey ? "#fee2e2" : "#dcfce7",
                  color: !apiKey ? "#b91c1c" : "#166534",
                  width: "100%",
                  border: "none",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  padding: 6,
                }}
              >
                {apiKey ? "Active" : "Not available"}
              </Badge>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Most Recent Creation Date
            </CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-main">
              {users.length > 0
                ? new Date(
                    Math.max(
                      ...users.map((u) => new Date(u.createdAt).getTime())
                    )
                  ).toLocaleDateString()
                : "N/A"}
            </div>
            <p className="text-xs text-muted-foreground">
              Most recently created user
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  const renderUsers = () => (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold tracking-tight text-main">
        User Management
      </h2>
      <div className="flex flex-col md:flex-row md:items-center md:space-x-4 space-y-4 md:space-y-0">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search users..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-8"
          />
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild className="bg-main text-white">
            <Button variant="outline">
              <Filter className="mr-2 h-4 w-4" />
              Status:{" "}
              {filterStatus !== undefined
                ? !filterStatus
                  ? "Active"
                  : "Banned"
                : "All"}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="bg-white">
            <DropdownMenuItem
              className="hover:bg-gray-200"
              onClick={() => setFilterStatus(undefined)}
            >
              All
            </DropdownMenuItem>
            <DropdownMenuItem
              className="hover:bg-gray-200"
              onClick={() => setFilterStatus(false)}
            >
              Active
            </DropdownMenuItem>
            <DropdownMenuItem
              className="hover:bg-gray-200"
              onClick={() => setFilterStatus(true)}
            >
              Banned
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[600px]">
              <thead className=" bg-muted/50">
                <tr>
                  <th className="h-12 px-4 text-left font-medium">Username</th>
                  <th className="h-12 px-4 text-left font-medium">Email</th>
                  <th className="h-12 px-4 text-left font-medium">
                    Created At
                  </th>
                  <th className="h-12 px-4 text-left font-medium">
                    Updated At
                  </th>
                  <th className="h-12 px-4 text-left font-medium">ID</th>
                  <th className="h-12 px-4 text-left font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.length > 0 ? (
                  filteredUsers.map((user) => (
                    <tr key={user._id} className=" hover:bg-muted/50">
                      <td className="p-4 font-medium">{user.username}</td>
                      <td className="p-4">{user.email}</td>
                      <td className="p-4 text-sm">
                        {new Date(user.createdAt).toLocaleDateString()}
                      </td>
                      <td className="p-4 text-sm">
                        {new Date(user.updatedAt).toLocaleDateString()}
                      </td>
                      <td className="p-4">
                        <code className="text-xs bg-muted px-2 py-1 rounded">
                          {user._id}
                        </code>
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
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan={5}
                      className="p-8 text-center text-muted-foreground"
                    >
                      {searchTerm ? "No users found" : "No users yet"}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderApiKey = () => (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold tracking-tight">API Key Management</h2>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Key className="h-5 w-5" /> Current API Key
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-2">
            <div className="flex-1">
              <Label htmlFor="api-key">API Key</Label>
              <div className="flex items-center space-x-2 mt-1">
                <Input
                  id="api-key"
                  type={showApiKey ? "text" : "password"}
                  value={apiKey || "No API Key"}
                  readOnly
                  className="font-mono text-sm"
                />
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setShowApiKey(!showApiKey)}
                  disabled={!apiKey}
                >
                  {showApiKey ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={copyApiKey}
                  disabled={!apiKey}
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
          <div className="flex items-center justify-between  bg-muted rounded-lg">
            <div>
              <p className="text-sm text-muted-foreground">
                {apiKey ? "API Key is active and ready to use" : "No API Key"}
              </p>
            </div>
            <Badge
              variant={!apiKey ? "default" : "destructive"}
              style={{
                backgroundColor: !apiKey ? "#fee2e2" : "#dcfce7",
                color: !apiKey ? "#b91c1c" : "#166534",
                border: "none",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              {apiKey ? "Active" : "Not available"}
            </Badge>
          </div>
          <div className="flex gap-2">
            <Button
              onClick={handleApiKeyUpdate}
              disabled={isUpdatingApiKey}
              className="flex items-center gap-2"
            >
              <RefreshCw
                className={`h-4 w-4 ${isUpdatingApiKey ? "animate-spin" : ""}`}
              />
              {apiKey ? "Generate New API Key" : "Generate API Key"}
            </Button>
          </div>
          {apiKey && (
            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-sm text-yellow-800">
                <strong>Note:</strong> When generating a new API Key, the old
                API Key will no longer be valid. Please make sure to update your
                application with the new API Key.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );

  const sidebarItems = [
    { title: "Dashboard", icon: BarChart3, id: "dashboard" },
    { title: "User Management", icon: Users, id: "users" },
    {
      title: "Verification Logs",
      icon: FileText,
      id: "verification-logs",
    },
    { title: "API Key", icon: Key, id: "api-key" },
  ];

  const renderVerificationLogs = () => {
    const filteredLogs = verificationLogs.filter((log) => {
      const matchesSearch =
        (log.userId &&
          log.userId.toLowerCase().includes(searchTerm.toLowerCase())) ||
        log._id.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesFilter =
        filterStatusLog === "all" ||
        (filterStatusLog === "success" && log.stepPassed) ||
        (filterStatusLog === "failed" && !log.stepPassed);

      return matchesSearch && matchesFilter;
    });

    const logStats = {
      total: verificationLogs.length,
      success: verificationLogs.filter((log) => log.stepPassed).length,
      failed: verificationLogs.filter((log) => !log.stepPassed).length,
      today: verificationLogs.filter(
        (log) =>
          new Date(log.timestamp).toDateString() === new Date().toDateString()
      ).length,
    };

    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">
            Verification Logs
          </h2>
          <p className="text-muted-foreground">
            Track users&apos; eKYC verification attempts
          </p>
        </div>

        {/* Statistics Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Verifications
              </CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{logStats.total}</div>
              <p className="text-xs text-muted-foreground">
                Total verification attempts
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Success</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {logStats.success}
              </div>
              <p className="text-xs text-muted-foreground">
                {logStats.total > 0
                  ? Math.round((logStats.success / logStats.total) * 100)
                  : 0}
                % success rate
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Failed</CardTitle>
              <XCircle className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">
                {logStats.failed}
              </div>
              <p className="text-xs text-muted-foreground">
                {logStats.total > 0
                  ? Math.round((logStats.failed / logStats.total) * 100)
                  : 0}
                % failure rate
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Today</CardTitle>
              <Clock className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">
                {logStats.today}
              </div>
              <p className="text-xs text-muted-foreground">
                Verifications today
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <div className="flex items-center space-x-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by User ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8"
            />
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline">
                <Filter className="mr-2 h-4 w-4" />
                Status:{" "}
                {filterStatusLog === "all"
                  ? "All"
                  : filterStatusLog === "success"
                    ? "Success"
                    : "Failed"}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="bg-white">
              <DropdownMenuItem
                className="hover:bg-gray-200"
                onClick={() => setFilterStatusLog("all")}
              >
                All
              </DropdownMenuItem>
              <DropdownMenuItem
                className="hover:bg-gray-200"
                onClick={() => setFilterStatusLog("success")}
              >
                Success
              </DropdownMenuItem>
              <DropdownMenuItem
                className="hover:bg-gray-200"
                onClick={() => setFilterStatusLog("failed")}
              >
                Failed
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Verification Logs Table */}
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="border-b bg-muted/50">
                  <tr>
                    <th className="h-12 px-4 text-left align-middle font-medium">
                      User ID
                    </th>
                    <th className="h-12 px-4 text-left align-middle font-medium">
                      Status
                    </th>
                    <th className="h-12 px-4 text-left align-middle font-medium">
                      Liveness
                    </th>
                    <th className="h-12 px-4 text-left align-middle font-medium">
                      Face Match
                    </th>
                    <th className="h-12 px-4 text-left align-middle font-medium">
                      Voice Match
                    </th>
                    <th className="h-12 px-4 text-left align-middle font-medium">
                      Time
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredLogs.length > 0 ? (
                    filteredLogs.map((log) => (
                      <tr key={log._id} className="border-b hover:bg-muted/50">
                        <td className="p-4">
                          <div className="flex items-center gap-2">
                            <User className="h-4 w-4 text-muted-foreground" />
                            <div>
                              <div className="font-medium">
                                {log.userId || "Anonymous"}
                              </div>
                              <div className="text-xs text-muted-foreground">
                                {log._id}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="p-4">
                          <Badge
                            variant={log.stepPassed ? "default" : "destructive"}
                            style={{
                              backgroundColor: !log.stepPassed
                                ? "#fee2e2"
                                : "#dcfce7",
                              color: !log.stepPassed ? "#b91c1c" : "#166534",
                              width: "100%",
                              border: "none",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              padding: 6,
                            }}
                          >
                            {log.stepPassed ? "Success" : "Failed"}
                          </Badge>
                        </td>
                        <td className="p-4">
                          {log.liveness ? (
                            <div className="flex items-center gap-2">
                              <Camera className="h-4 w-4 text-muted-foreground" />
                              <div>
                                <Badge
                                  variant={
                                    log.liveness.isLive
                                      ? "default"
                                      : "destructive"
                                  }
                                  className="text-xs"
                                  style={{
                                    backgroundColor: !log.liveness.isLive
                                      ? "#fee2e2"
                                      : "#dcfce7",
                                    color: !log.liveness.isLive
                                      ? "#b91c1c"
                                      : "#166534",
                                    width: "100%",
                                    border: "none",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    padding: 6,
                                  }}
                                >
                                  {log.liveness.isLive ? "Live" : "Spoof"}
                                </Badge>
                                <div className="text-xs text-muted-foreground">
                                  Score:{" "}
                                  {log.liveness.spoofProb !== undefined
                                    ? log.liveness.spoofProb.toFixed(3)
                                    : "N/A"}
                                </div>
                              </div>
                            </div>
                          ) : (
                            <span className="text-muted-foreground">-</span>
                          )}
                        </td>
                        <td className="p-4">
                          {log.faceMatch ? (
                            <div className="flex items-center gap-2">
                              <User className="h-4 w-4 text-muted-foreground" />
                              <div>
                                <Badge
                                  variant={
                                    log.faceMatch.isMatch
                                      ? "default"
                                      : "destructive"
                                  }
                                  className="text-xs"
                                  style={{
                                    backgroundColor: !log.faceMatch.isMatch
                                      ? "#fee2e2"
                                      : "#dcfce7",
                                    color: !log.faceMatch.isMatch
                                      ? "#b91c1c"
                                      : "#166534",
                                    width: "100%",
                                    border: "none",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    padding: 6,
                                  }}
                                >
                                  {log.faceMatch.isMatch ? "Match" : "No Match"}
                                </Badge>
                                <div className="text-xs text-muted-foreground">
                                  Similarity:{" "}
                                  {log.faceMatch.similarity !== undefined
                                    ? log.faceMatch.similarity.toFixed(2)
                                    : "N/A"}
                                </div>
                              </div>
                            </div>
                          ) : (
                            <span className="text-muted-foreground">-</span>
                          )}
                        </td>
                        <td className="p-4">
                          {log.voice ? (
                            <div className="flex items-center gap-2">
                              <Mic className="h-4 w-4 text-muted-foreground" />
                              <div>
                                <Badge
                                  variant={
                                    log.voice.isMatch
                                      ? "default"
                                      : "destructive"
                                  }
                                  className="text-xs"
                                  style={{
                                    backgroundColor: !log.voice.isMatch
                                      ? "#fee2e2"
                                      : "#dcfce7",
                                    color: !log.voice.isMatch
                                      ? "#b91c1c"
                                      : "#166534",
                                    width: "100%",
                                    border: "none",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    padding: 6,
                                  }}
                                >
                                  {log.voice.isMatch ? "Match" : "No Match"}
                                </Badge>
                                <div className="text-xs text-muted-foreground">
                                  Score:{" "}
                                  {log.voice.score !== undefined
                                    ? log.voice.score.toFixed(3)
                                    : "N/A"}
                                </div>
                              </div>
                            </div>
                          ) : (
                            <span className="text-muted-foreground">-</span>
                          )}
                        </td>
                        <td className="p-4">
                          <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4 text-muted-foreground" />
                            <div>
                              <div className="text-sm">
                                {new Date(log.timestamp).toLocaleDateString()}
                              </div>
                              <div className="text-xs text-muted-foreground">
                                {new Date(log.timestamp).toLocaleTimeString()}
                              </div>
                            </div>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan={6}
                        className="p-8 text-center text-muted-foreground"
                      >
                        {searchTerm || filterStatusLog !== "all"
                          ? "No logs found"
                          : "No verification logs yet"}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };

  const renderContent = () => {
    switch (activeTab) {
      case "dashboard":
        return renderDashboard();
      case "users":
        return renderUsers();
      case "api-key":
        return renderApiKey();
      case "verification-logs":
        return renderVerificationLogs();
      default:
        return renderDashboard();
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
          <h1 className="text-lg font-semibold">Business Dashboard</h1>
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
