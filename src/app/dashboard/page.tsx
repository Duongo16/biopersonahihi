"use client";

import { useEffect, useState } from "react";

interface CCCDInfo {
  idNumber: string;
  fullName: string;
  dateOfBirth: string;
  idFrontUrl: string;
  idBackUrl: string;
  verified: boolean;
}

export default function Dashboard() {
  const [cccdInfo, setCccdInfo] = useState<CCCDInfo | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCCCDInfo = async () => {
      try {
        const response = await fetch("/api/ekyc/cccd/info", {
          method: "GET",
          credentials: "include",
        });
        if (response.ok) {
          const data = await response.json();
          setCccdInfo(data);
        }
      } catch (error) {
        console.error("Error fetching CCCD info:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCCCDInfo();
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="p-20">
      <h1 className="text-3xl font-bold mb-6">Dashboard</h1>
      {cccdInfo ? (
        <div className="bg-white shadow-lg rounded-lg p-6">
          <h2 className="text-2xl font-semibold mb-4">Thông tin CCCD</h2>
          <p>
            <strong>ID Number:</strong> {cccdInfo.idNumber}
          </p>
          <p>
            <strong>Full Name:</strong> {cccdInfo.fullName}
          </p>
          <p>
            <strong>Date of Birth:</strong> {cccdInfo.dateOfBirth}
          </p>
          <p>
            <strong>Verified:</strong> {cccdInfo.verified ? "Yes" : "No"}
          </p>
          <div className="mt-4">
            <img
              src={cccdInfo.idFrontUrl}
              alt="ID Front"
              className="mb-4 w-64"
            />
            <img src={cccdInfo.idBackUrl} alt="ID Back" className="w-64" />
          </div>
        </div>
      ) : (
        <div className="bg-red-100 border border-red-500 text-red-700 p-4 rounded-lg">
          <h2 className="text-xl font-semibold mb-2">CCCD chưa đăng ký</h2>
          <p>Vui lòng đăng ký CCCD để sử dụng đầy đủ tính năng của hệ thống.</p>
          <a
            href="/ekyc/cccd"
            className="mt-4 inline-block bg-blue-600 text-white px-4 py-2 rounded-lg"
          >
            Đăng ký CCCD ngay
          </a>
        </div>
      )}
    </div>
  );
}
