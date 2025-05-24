"use client";

import { useState, useRef, useCallback } from "react";
import Webcam from "react-webcam";
import toast from "react-hot-toast";

export default function FaceVerificationPage() {
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [uploadedImage, setUploadedImage] = useState<File | null>(null);
  const webcamRef = useRef<Webcam>(null);

  const videoConstraints = {
    width: 640,
    height: 480,
    facingMode: "user",
  };

  const captureImage = useCallback(() => {
    if (webcamRef.current) {
      const imageSrc = webcamRef.current.getScreenshot();
      setCapturedImage(imageSrc || null);
      setUploadedImage(null); // Clear the uploaded image
    }
  }, [webcamRef]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setUploadedImage(file);
    setCapturedImage(null); // Clear the captured image
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

    try {
      const formData = new FormData();
      formData.append(
        "faceImage",
        uploadedImage ||
          new File([imageFile], "face.png", { type: "image/png" })
      );

      const response = await fetch("/api/ekyc/face-verify", {
        method: "POST",
        body: formData,
        credentials: "include",
      });

      const data = await response.json();

      if (response.ok) {
        toast.success(
          `Khuôn mặt đã được xác minh (độ tương đồng: ${data.similarity}).`
        );
      } else {
        toast.error(data.message || "Xác minh khuôn mặt thất bại.");
      }
    } catch (error) {
      console.error("Error verifying face:", error);
      toast.error("Đã xảy ra lỗi khi xác minh khuôn mặt.");
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200 p-4">
      <div className="bg-white shadow-lg rounded-lg p-6 w-full max-w-md">
        <h2 className="text-2xl font-bold text-center mb-6">
          Face Verification
        </h2>

        {/* Capture from Webcam */}
        {!uploadedImage && (
          <div className="mb-4">
            {capturedImage ? (
              <img
                src={capturedImage}
                alt="Captured Face"
                className="w-full rounded-lg mb-4"
              />
            ) : (
              <Webcam
                ref={webcamRef}
                screenshotFormat="image/png"
                videoConstraints={videoConstraints}
                className="w-full rounded-lg"
              />
            )}
            {!capturedImage && (
              <button
                onClick={captureImage}
                className="w-full bg-green-600 text-white p-2 rounded-lg hover:bg-green-700 transition-colors mb-2"
              >
                Capture Face
              </button>
            )}
            {capturedImage && (
              <button
                onClick={() => setCapturedImage(null)}
                className="w-full bg-gray-500 text-white p-2 rounded-lg hover:bg-gray-600 transition-colors mb-2"
              >
                Retake
              </button>
            )}
          </div>
        )}

        {/* Upload Image */}
        <div className="mb-4">
          <input
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            className="w-full border p-2 rounded-lg"
          />
        </div>

        {/* Submit Button */}
        <button
          onClick={handleFaceSubmit}
          className="w-full bg-blue-600 text-white p-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          Verify Face
        </button>
      </div>
    </div>
  );
}
