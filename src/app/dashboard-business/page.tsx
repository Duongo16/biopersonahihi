"use client";

import { useState, useEffect } from "react";
import toast from "react-hot-toast";

type User = {
  _id: string;
  username: string;
  email: string;
  role: string;
  createdAt: string;
};

export default function BusinessDashboardPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [apiKey, setApiKey] = useState("");

  useEffect(() => {
    const fetchBusinessUsers = async () => {
      try {
        const response = await fetch("/api/business/users");
        const data = await response.json();

        if (response.ok) {
          setUsers(data.users);
        } else {
          toast.error(data.message);
        }
      } catch (error) {
        console.error("Error fetching business users:", error);
        toast.error("Đã xảy ra lỗi khi tải danh sách user.");
      }
    };

    const fetchApiKey = async () => {
      try {
        const response = await fetch("/api/business/get-api-key");
        const data = await response.json();

        if (response.ok) {
          setApiKey(data.apiKey || "");
        }
      } catch (error) {
        console.error("Error fetching API key:", error);
      }
    };

    fetchBusinessUsers();
    fetchApiKey();
  }, []);

  const handleApiKeyUpdate = async () => {
    try {
      const response = await fetch("/api/business/update-api-key", {
        method: "PATCH",
      });

      const data = await response.json();

      if (response.ok) {
        setApiKey(data.apiKey);
        toast.success("API key đã được cập nhật thành công.");
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.error("Error updating API key:", error);
      toast.error("Đã xảy ra lỗi khi cập nhật API key.");
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center bg-gradient-to-br from-gray-100 to-gray-200 p-8">
      <h1 className="text-4xl font-bold mb-8">Business Dashboard</h1>

      <div className="bg-white shadow-lg rounded-lg p-6 w-full max-w-4xl mb-8">
        <h2 className="text-2xl font-semibold mb-4">API Key</h2>
        <div className="flex items-center justify-between">
          <p className="break-all text-gray-700 font-mono">
            {apiKey || "No API Key Available"}
          </p>
          <button
            onClick={handleApiKeyUpdate}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Update API Key
          </button>
        </div>
      </div>

      <div className="bg-white shadow-lg rounded-lg p-6 w-full max-w-4xl">
        <h2 className="text-2xl font-semibold mb-4">User List</h2>
        {users.length > 0 ? (
          <table className="w-full border-collapse">
            <thead>
              <tr>
                <th className="border-b-2 p-4 text-left">Username</th>
                <th className="border-b-2 p-4 text-left">Email</th>
                <th className="border-b-2 p-4 text-left">Role</th>
                <th className="border-b-2 p-4 text-left">Created At</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr
                  key={user._id}
                  className="hover:bg-gray-100 transition-colors"
                >
                  <td className="border-b p-4">{user.username}</td>
                  <td className="border-b p-4">{user.email}</td>
                  <td className="border-b p-4">{user.role}</td>
                  <td className="border-b p-4">
                    {new Date(user.createdAt).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p className="text-gray-600">No users found.</p>
        )}
      </div>
    </div>
  );
}
