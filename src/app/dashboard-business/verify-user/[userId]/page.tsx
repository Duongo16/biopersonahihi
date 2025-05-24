"use client";

import { useParams } from "next/navigation";
import { useRef, useState } from "react";
import toast from "react-hot-toast";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "../../../components/ui/card";
import { Button } from "../../../components/ui/button";

export default function VerifyUserPage() {
  const { userId } = useParams();
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const playbackRef = useRef<HTMLVideoElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);

  const [cameraOn, setCameraOn] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [recording, setRecording] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [loadingFace, setLoadingFace] = useState(false);
  const [loadingLiveness, setLoadingLiveness] = useState(false);

  type FaceResult = {
    matched: boolean;
    matching_similarity: number;
  };
  const [faceResult, setFaceResult] = useState<FaceResult | null>(null);
  type LivenessResult = {
    is_live: boolean;
    score: number;
  };
  const [livenessResult, setLivenessResult] = useState<LivenessResult | null>(
    null
  );

  const startCamera = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ video: true });
    if (videoRef.current) {
      videoRef.current.srcObject = stream;
      setCameraOn(true);
    }
  };

  const stopCamera = () => {
    const stream = videoRef.current?.srcObject as MediaStream;
    stream?.getTracks().forEach((track) => track.stop());
    videoRef.current!.srcObject = null;
    setCameraOn(false);
  };

  const toggleCamera = async () => {
    if (cameraOn) {
      stopCamera();
    } else {
      await startCamera();
    }
  };

  const captureImage = () => {
    if (!cameraOn) {
      toast.error("❗ Bạn cần bật camera trước khi chụp ảnh!");
      return;
    }

    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    canvas.toBlob((blob) => {
      if (blob) {
        const file = new File([blob], "face.png", { type: "image/png" });
        setImageFile(file);
        toast.success("📸 Đã chụp ảnh khuôn mặt!");
      }
    }, "image/png");
  };

  const startRecording = () => {
    if (!cameraOn) {
      toast.error("❗ Bạn cần bật camera trước khi quay video!");
      return;
    }

    const stream = videoRef.current?.srcObject as MediaStream;
    const recorder = new MediaRecorder(stream);
    const chunks: Blob[] = [];

    recorder.ondataavailable = (e) => {
      if (e.data.size > 0) chunks.push(e.data);
    };

    recorder.onstop = () => {
      const blob = new Blob(chunks, { type: "video/mp4" });
      const file = new File([blob], "video.mp4", { type: "video/mp4" });
      setVideoFile(file);
      if (playbackRef.current) {
        playbackRef.current.src = URL.createObjectURL(blob);
      }
      toast.success("🎥 Đã quay video thành công!");
      stopCamera();
    };

    mediaRecorderRef.current = recorder;
    recorder.start();
    setRecording(true);
    toast("⏺️ Đang quay video...");

    let countdownTime = 5;
    setCountdown(countdownTime);
    const countdownInterval = setInterval(() => {
      countdownTime -= 1;
      setCountdown(countdownTime);
      if (countdownTime <= 0) {
        clearInterval(countdownInterval);
      }
    }, 1000);

    setTimeout(() => {
      recorder.stop();
      setRecording(false);
      setCountdown(0);
    }, 5000);
  };

  const verifyFace = async () => {
    if (!imageFile) return toast.error("❌ Chưa có ảnh!");
    setLoadingFace(true);

    const formData = new FormData();
    formData.append("userId", userId as string);
    formData.append("face", imageFile);

    const res = await fetch("/api/business/verify-face", {
      method: "POST",
      body: formData,
    });

    const data = await res.json();
    setLoadingFace(false);

    if (res.ok) {
      setFaceResult(data);
      toast.success("✅ Đã xác minh khuôn mặt!");
    } else {
      toast.error(data.message || "Lỗi xác minh khuôn mặt");
    }
  };

  const verifyLiveness = async () => {
    if (!videoFile) return toast.error("❌ Chưa có video!");
    setLoadingLiveness(true);

    const formData = new FormData();
    formData.append("userId", userId as string);
    formData.append("video", videoFile);

    const res = await fetch("/api/business/liveness-check", {
      method: "POST",
      body: formData,
    });

    const data = await res.json();
    setLoadingLiveness(false);

    if (res.ok) {
      setLivenessResult(data);
      toast.success("✅ Đã kiểm tra liveness!");
    } else {
      toast.error(data.message || "Lỗi kiểm tra liveness");
    }
  };

  const allPassed = faceResult?.matched && livenessResult?.is_live;

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Xác thực người dùng #{userId}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="relative w-full max-w-sm aspect-[3/4] mx-auto">
                <video
                  ref={videoRef}
                  autoPlay
                  muted
                  className="w-full h-full rounded-xl border border-gray-300 shadow-lg object-cover"
                />
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="w-52 h-72 border-4 border-white rounded-full opacity-70" />
                </div>
                {recording && countdown > 0 && (
                  <div className="absolute top-4 right-4 text-white text-3xl font-bold bg-black/50 rounded-full w-12 h-12 flex items-center justify-center">
                    {countdown}
                  </div>
                )}
              </div>
              <div className="flex justify-center gap-4 flex-wrap">
                <Button onClick={toggleCamera} variant="default">
                  {cameraOn ? "📴 Tắt Camera" : "📷 Bật Camera"}
                </Button>
                <Button onClick={captureImage} variant="secondary">
                  📸 Chụp ảnh
                </Button>
                <Button
                  onClick={startRecording}
                  variant="destructive"
                  disabled={recording}
                >
                  {recording ? "⏺️ Đang quay..." : "🎥 Quay video"}
                </Button>
              </div>
            </div>

            <div className="flex flex-col space-y-6">
              {imageFile && (
                <div className="space-y-2">
                  <p className="font-medium text-sm text-gray-600">
                    ✅ Ảnh đã chụp:
                  </p>
                  <img
                    src={URL.createObjectURL(imageFile)}
                    alt="Ảnh khuôn mặt"
                    className="rounded border w-full max-h-72 object-contain"
                  />
                  <Button
                    onClick={verifyFace}
                    className="w-full bg-green-600 hover:bg-green-700 text-white"
                    disabled={loadingFace}
                  >
                    {loadingFace
                      ? "⏳ Đang xác minh..."
                      : "Gửi xác minh khuôn mặt"}
                  </Button>
                  {faceResult && (
                    <div className="text-sm mt-2 bg-green-50 border p-3 rounded">
                      Kết quả:{" "}
                      {faceResult.matched ? "✔️ Trùng khớp" : "❌ Không khớp"}
                      <br />
                      Score: {faceResult.matching_similarity}
                    </div>
                  )}
                </div>
              )}

              {videoFile && (
                <div className="space-y-2">
                  <p className="font-medium text-sm text-gray-600">
                    ✅ Video đã quay:
                  </p>
                  <video
                    ref={playbackRef}
                    controls
                    className="rounded border w-full max-h-72 object-contain"
                  />
                  <Button
                    onClick={verifyLiveness}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                    disabled={loadingLiveness}
                  >
                    {loadingLiveness
                      ? "⏳ Đang kiểm tra..."
                      : "Gửi kiểm tra liveness"}
                  </Button>
                  {livenessResult && (
                    <div className="text-sm mt-2 bg-blue-50 border p-3 rounded">
                      Kết quả:{" "}
                      {livenessResult.is_live ? "✔️ Hợp lệ" : "❌ Không hợp lệ"}
                      <br />
                      Score: {livenessResult.score}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {allPassed && (
            <div className="mt-6 text-center text-xl font-bold text-green-600">
              🎉 Xác thực thành công!
            </div>
          )}
        </CardContent>
      </Card>
      <canvas ref={canvasRef} hidden />
    </div>
  );
}
