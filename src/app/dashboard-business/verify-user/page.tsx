"use client";

import { useState } from "react";
import toast from "react-hot-toast";

interface UserCCCD {
  fullName: string;
  idNumber: string;
  idFrontUrl: string;
  faceUrl: string;
  voiceVector: number[];
}

export default function VerifyUserPage() {
  const [userId, setUserId] = useState("");
  const [userCCCD, setUserCCCD] = useState<UserCCCD | null>(null);
  const [ekycEnrollDone, setEkycEnrollDone] = useState(false);

  const handleFetch = async () => {
    try {
      const res = await fetch(`/api/business/user-cccd?userId=${userId}`);
      const data = await res.json();
      if (res.ok) {
        setUserCCCD(data.cccd);
        toast.success("Lấy thông tin người dùng thành công!");
        if (
          data.cccd.idFrontUrl &&
          data.cccd.idBackUrl &&
          data.cccd.faceUrl &&
          data.cccd.voiceVector &&
          data.cccd.voiceVector.length > 0
        ) {
          setEkycEnrollDone(true);
        }
      } else {
        toast.error(data.message);
      }
    } catch (err) {
      console.error(err);
      toast.error("Lỗi khi lấy thông tin người dùng.");
    }
  };

  return (
    <div className="p-6 mt-20">
      <h1 className="text-2xl font-bold mb-4">Giả lập xác thực người dùng</h1>

      <input
        type="text"
        placeholder="Nhập userId"
        value={userId}
        onChange={(e) => setUserId(e.target.value)}
        className="border p-2 rounded w-full max-w-md mb-4"
      />

      <button
        onClick={handleFetch}
        className="bg-main text-white px-4 py-2 rounded ml-2"
      >
        Bắt đầu xác thực
      </button>

      {userCCCD && (
        <div className="mt-6 border p-4 rounded shadow bg-white">
          <h2 className="font-bold text-lg">Thông tin đã đăng ký:</h2>
          <p>
            <strong>Họ tên:</strong> {userCCCD.fullName}
          </p>
          <p>
            <strong>Số CCCD:</strong> {userCCCD.idNumber}
          </p>
          <div className="mt-2 grid grid-cols-3 gap-2">
            <img
              src={userCCCD.idFrontUrl}
              alt="CCCD mặt trước"
              className="rounded shadow"
            />
            <img
              src={userCCCD.faceUrl}
              alt="Ảnh khuôn mặt đã đăng ký"
              className="rounded shadow"
            />
          </div>

          {ekycEnrollDone ? (
            <div className="mt-6">
              <a
                href={`/dashboard-business/verify-user/${userId}`}
                className="inline-block bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
              >
                Bắt đầu xác minh sinh trắc học
              </a>
            </div>
          ) : (
            <div className="mt-6">
              <a className="inline-block bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700">
                Người dùng chưa hoàn tất đăng ký eKYC, vui lòng đăng ký trước
              </a>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
