"use client";
import { useEffect, useState } from "react";
import IDUploader from "../../components/IDUploader";

export default function CCCDUploadPage({
  onSuccess,
}: {
  onSuccess: () => void;
}) {
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

  if (loading) {
    return <div>Loading...</div>;
  }

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
      <h1 className="text-3xl font-bold text-center mb-6">Upload CCCD</h1>
      <IDUploader onSuccess={onSuccess} />
    </div>
  );
}
