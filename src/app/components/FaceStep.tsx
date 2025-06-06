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
      toast.error("Please select or capture a face image.");
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
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      const data = await response.json();

      if (response.ok) {
        toast.success(
          `Face has been verified (similarity: ${data.similarity}).`
        );
        onSuccess();
      } else {
        toast.error(data.detail || "Face verification failed.");
      }
    } catch (error) {
      console.error("Error verifying face:", error);
      toast.error("An error occurred during face verification.");
    }
  };
  if (hasFace) {
    return (
      <div className="text-center bg-green-100 border border-green-500 text-green-700 p-4 rounded-lg">
        <h2 className="text-xl font-semibold mb-2">Face already registered</h2>
        <p>
          You have successfully registered your face. You cannot add a new face.
        </p>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-2xl font-bold text-center mb-6">
        Step 2: Capture face image
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
              Capture image
            </button>
          )}
          {capturedImage && (
            <button
              onClick={() => setCapturedImage(null)}
              className="w-full bg-gray-500 text-white p-2 rounded-lg hover:bg-gray-600 mb-2"
            >
              Retake
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
        {loading ? "Verifying..." : "Verify face"}
      </button>
    </div>
  );
}
