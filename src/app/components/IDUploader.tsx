"use client";

import { useState } from "react";

export default function IDUploader() {
  const [idFront, setIdFront] = useState<File | null>(null);
  const [idBack, setIdBack] = useState<File | null>(null);

  const handleFileChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    type: "front" | "back"
  ) => {
    const file = e.target.files ? e.target.files[0] : null;
    if (file && !["image/png", "image/jpeg", "image/jpg"].includes(file.type)) {
      alert("Chỉ chấp nhận file PNG hoặc JPG.");
      return;
    }
    if (type === "front") setIdFront(file);
    if (type === "back") setIdBack(file);
  };

  const handleSubmit = async () => {
    if (!idFront || !idBack) {
      alert("Vui lòng chọn cả ảnh mặt trước và mặt sau của CCCD.");
      return;
    }

    const formData = new FormData();
    formData.append("idFront", idFront);
    formData.append("idBack", idBack);

    try {
      const response = await fetch("/api/ekyc/cccd/validate", {
        method: "POST",
        credentials: "include",
        body: formData,
      });

      const data = await response.json();
      if (response.ok) {
        alert(
          `Xác thực thành công! ID: ${data.extractedID}, Tên: ${data.extractedName}, Ngày sinh: ${data.extractedDOB}`
        );
      } else {
        console.error("Validation failed:", data);
        alert(data.message || "Xác thực không thành công. Vui lòng thử lại.");
      }
    } catch (error) {
      console.error("Error validating CCCD:", error);
      alert("Failed to validate CCCD. Please try again.");
    }
  };

  return (
    <div className="text-center">
      <input
        type="file"
        accept="image/*"
        onChange={(e) => handleFileChange(e, "front")}
        className="mb-4"
      />
      <input
        type="file"
        accept="image/*"
        onChange={(e) => handleFileChange(e, "back")}
        className="mb-4"
      />
      <button
        onClick={handleSubmit}
        className="bg-blue-600 text-white px-4 py-2 rounded-lg"
      >
        Validate CCCD
      </button>
    </div>
  );
}
