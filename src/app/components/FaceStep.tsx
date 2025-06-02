"use client";

import { useState, useRef } from "react";
import Webcam from "react-webcam";
import toast from "react-hot-toast";
import Image from "next/image";

export default function FaceStep({
  hasFace,
  onSuccess,
}: {
  hasFace: boolean;
  onSuccess: () => void;
}) {
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [uploadedImage, setUploadedImage] = useState<File | null>(null);
  const webcamRef = useRef<Webcam>(null);
  const [loading, setLoading] = useState(false);

  const captureImage = () => {
    if (webcamRef.current) {
      const imageSrc = webcamRef.current.getScreenshot();
      setCapturedImage(imageSrc || null);
      setUploadedImage(null);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setUploadedImage(file);
    setCapturedImage(null);
  };

  const handleFaceSubmit = async () => {
    const imageFile =
      uploadedImage ||
      (capturedImage
        ? await fetch(capturedImage).then((res) => res.blob())
        : null);

    if (!imageFile) {
      toast.error("Vui lòng chọn hoặc chụp ảnh khuôn mặt.");
      return;
    }
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append(
        "faceImage",
        uploadedImage ||
          new File([imageFile], "face.png", { type: "image/png" })
      );

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_EKYC_API}/ekyc/face-verify`,
        {
          method: "POST",
          body: formData,
          credentials: "include",
        }
      );

      const data = await response.json();

      if (response.ok) {
        toast.success(
          `Khuôn mặt đã được xác minh (độ tương đồng: ${data.similarity}).`
        );
        onSuccess();
      } else {
        toast.error(data.detail || "Xác minh khuôn mặt thất bại.");
      }
    } catch (error) {
      console.error("Error verifying face:", error);
      toast.error("Đã xảy ra lỗi khi xác minh khuôn mặt.");
    }
  };
  if (hasFace) {
    return (
      <div className="text-center bg-green-100 border border-green-500 text-green-700 p-4 rounded-lg">
        <h2 className="text-xl font-semibold mb-2">Khuôn mặt đã đăng ký</h2>
        <p>
          Bạn đã đăng ký khuôn mặt thành công. Không thể thêm khuôn mặt mới.
        </p>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-2xl font-bold text-center mb-6">
        Bước 2: Chụp ảnh khuôn mặt
      </h2>
      {!uploadedImage && (
        <div className="mb-4">
          {capturedImage ? (
            <Image
              src={capturedImage || ""}
              alt="Captured Face"
              width={640}
              height={480}
              className="w-full rounded-lg mb-4"
              unoptimized
            />
          ) : (
            <Webcam
              ref={webcamRef}
              screenshotFormat="image/png"
              videoConstraints={{ width: 640, height: 480, facingMode: "user" }}
              className="w-full rounded-lg"
            />
          )}
          {!capturedImage && (
            <button
              onClick={captureImage}
              className="w-full bg-green-600 text-white p-2 rounded-lg hover:bg-green-700 mb-2"
            >
              Chụp ảnh
            </button>
          )}
          {capturedImage && (
            <button
              onClick={() => setCapturedImage(null)}
              className="w-full bg-gray-500 text-white p-2 rounded-lg hover:bg-gray-600 mb-2"
            >
              Chụp lại
            </button>
          )}
        </div>
      )}

      <div className="mb-4">
        <input
          type="file"
          accept="image/*"
          onChange={handleImageUpload}
          className="w-full border p-2 rounded-lg"
        />
      </div>

      <button
        onClick={handleFaceSubmit}
        disabled={loading}
        className="w-full bg-main text-white p-2 rounded-lg hover:bg-blue-700"
      >
        {loading ? "Đang xác minh..." : "Xác minh khuôn mặt"}
      </button>
    </div>
  );
}
