"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function DashboardPage() {
  const [user, setUser] = useState({ username: "", email: "" });
  const router = useRouter();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await fetch("/api/auth/me", {
          method: "GET",
          credentials: "include",
        });
        const data = await response.json();

        if (response.ok) {
          setUser(data.user);
        } else {
          router.push("/login");
        }
      } catch (error) {
        console.error("❌ Error fetching user info:", error);
        router.push("/login");
      }
    };

    fetchUser();
  }, [router]);

  return (
    <div className="max-w-md mx-auto bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-4">Dashboard</h2>
      <p>
        Welcome, <strong>{user.username}</strong> ({user.email})
      </p>
      <button
        onClick={() => router.push("/")}
        className="mt-4 bg-blue-600 text-white p-2 rounded-lg font-bold hover:bg-blue-700"
      >
        Go to Home
      </button>
    </div>
  );
}
