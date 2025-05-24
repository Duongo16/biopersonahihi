"use client";

import { useEffect, useState } from "react";
import IDUploader from "./IDUploader";

export default function CCCDStep({ onSuccess }: { onSuccess: () => void }) {
  const [cccdExists, setCccdExists] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkCCCD = async () => {
      try {
        const response = await fetch("/api/ekyc/cccd/info", {
          method: "GET",
          credentials: "include",
        });

        if (response.ok) {
          setCccdExists(true);
        }
      } catch (error) {
        console.error("❌ Error checking CCCD:", error);
      } finally {
        setLoading(false);
      }
    };

    checkCCCD();
  }, []);

  if (loading) return <div>Loading...</div>;

  if (cccdExists) {
    return (
      <div className="text-center bg-green-100 border border-green-500 text-green-700 p-4 rounded-lg">
        <h2 className="text-xl font-semibold mb-2">CCCD đã đăng ký</h2>
        <p>Bạn đã đăng ký CCCD. Không thể thêm CCCD mới.</p>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-2xl font-bold text-center mb-6">
        Bước 1: Đăng ký CCCD
      </h2>
      <IDUploader onSuccess={onSuccess} />
    </div>
  );
}
