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
  const playbackRef = useRef<HTMLVideoElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);

  const [cameraOn, setCameraOn] = useState(false);
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [recording, setRecording] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [loadingLiveness, setLoadingLiveness] = useState(false);
  const [livenessResult, setLivenessResult] = useState<{
    is_live: boolean;
    is_match: boolean;
    similarity: number;
  } | null>(null);

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

  const startRecording = () => {
    if (!cameraOn) {
      toast.error("❗ Bạn cần bật camera trước khi quay video!");
      return;
    }

    const stream = videoRef.current?.srcObject as MediaStream;
    const recorder = new MediaRecorder(stream, { mimeType: "video/webm" });
    const chunks: Blob[] = [];

    recorder.ondataavailable = (e) => {
      if (e.data.size > 0) chunks.push(e.data);
    };

    recorder.onstop = () => {
      const blob = new Blob(chunks, { type: "video/webm" });
      const file = new File([blob], "video.webm", { type: "video/webm" });
      setVideoFile(file);
      if (playbackRef.current) {
        playbackRef.current.src = URL.createObjectURL(blob);
        playbackRef.current.load();
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
        recorder.stop();
        setRecording(false);
        setCountdown(0);
      }
    }, 1000);
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
      const { is_live, is_match, similarity } = data;
      setLivenessResult({ is_live, is_match, similarity });

      if (is_live && is_match) {
        toast.success("🎉 Xác thực thành công (Live + Match)!");
      } else {
        if (!is_live) toast.error("❌ Không phải người thật!");
        if (!is_match) toast.error("❌ Khuôn mặt không trùng khớp!");
      }
    } else {
      toast.error(data.message || "Lỗi kiểm tra liveness");
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Xác thực người dùng #{userId}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="relative aspect-[3/4] w-full max-w-sm mx-auto">
                <video
                  ref={videoRef}
                  autoPlay
                  muted
                  className="w-full h-full rounded-xl border shadow object-cover"
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
                <Button onClick={toggleCamera}>
                  {cameraOn ? "📴 Tắt Camera" : "📷 Bật Camera"}
                </Button>
                <Button
                  onClick={startRecording}
                  disabled={recording}
                  variant="destructive"
                >
                  {recording ? "⏺️ Đang quay..." : "🎥 Quay video"}
                </Button>
              </div>
            </div>

            <div className="flex flex-col space-y-6">
              {videoFile && (
                <>
                  <p className="text-sm text-gray-600 font-medium">
                    ✅ Video đã quay:
                  </p>
                  <video
                    ref={playbackRef}
                    controls
                    className="rounded border w-full max-h-72 object-contain"
                  />
                  <Button
                    onClick={verifyLiveness}
                    className="bg-blue-600 hover:bg-blue-700 text-white w-full"
                    disabled={loadingLiveness}
                  >
                    {loadingLiveness
                      ? "⏳ Đang kiểm tra..."
                      : "Gửi kiểm tra liveness & đối chiếu"}
                  </Button>
                  {livenessResult && (
                    <div className="text-sm mt-2 bg-blue-50 border p-3 rounded">
                      Live:{" "}
                      {livenessResult.is_live ? "✔️ Hợp lệ" : "❌ Không hợp lệ"}
                      <br />
                      Face Match:{" "}
                      {livenessResult.is_match
                        ? "✔️ Trùng khớp"
                        : "❌ Không khớp"}
                      <br />
                      Similarity: {livenessResult.similarity}
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
