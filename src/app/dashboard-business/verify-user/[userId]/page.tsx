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
import { Badge } from "../../../components/ui/badge";
import { Progress } from "../../../components/ui/progress";
import {
  Camera,
  Mic,
  CheckCircle,
  XCircle,
  Play,
  Square,
  RefreshCw,
  Shield,
} from "lucide-react";

export default function VerifyUserPage() {
  const { userId } = useParams();
  const videoRef = useRef<HTMLVideoElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioRecorderRef = useRef<MediaRecorder | null>(null);

  const [currentStep, setCurrentStep] = useState(1);
  const [cameraOn, setCameraOn] = useState(false);
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoBlob, setVideoBlob] = useState<string | null>(null);
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [recording, setRecording] = useState(false);
  const [audioRecording, setAudioRecording] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [loadingLiveness, setLoadingLiveness] = useState(false);
  const [loadingVoice, setLoadingVoice] = useState(false);
  const [livenessResult, setLivenessResult] = useState<{
    is_live: boolean;
    is_match: boolean;
    similarity: number;
  } | null>(null);
  const [voiceScore, setVoiceScore] = useState<number | null>(null);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: "user",
        },
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setCameraOn(true);
      }
    } catch {
      toast.error("Không thể truy cập camera");
    }
  };

  const stopCamera = () => {
    const stream = videoRef.current?.srcObject as MediaStream;
    stream?.getTracks().forEach((track) => track.stop());
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setCameraOn(false);
  };

  const resetVideo = () => {
    setVideoFile(null);
    setVideoBlob(null);
    startCamera();
  };

  const startRecording = () => {
    if (!cameraOn) {
      toast.error("Vui lòng bật camera trước");
      return;
    }

    const stream = videoRef.current?.srcObject as MediaStream;
    const mimeType = MediaRecorder.isTypeSupported("video/webm;codecs=vp9")
      ? "video/webm;codecs=vp9"
      : "video/webm";
    const recorder = new MediaRecorder(stream, { mimeType });
    const chunks: Blob[] = [];

    recorder.ondataavailable = (e) => {
      if (e.data.size > 0) chunks.push(e.data);
    };

    recorder.onstop = () => {
      const blob = new Blob(chunks, { type: "video/webm" });
      const file = new File([blob], "video.webm", { type: "video/webm" });
      setVideoFile(file);

      // Create URL for the video blob to display in the camera area
      const blobUrl = URL.createObjectURL(blob);
      setVideoBlob(blobUrl);

      toast.success("Quay video thành công!");
      stopCamera();
    };

    mediaRecorderRef.current = recorder;
    recorder.start();
    setRecording(true);

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

  const startAudioRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream, { mimeType: "audio/webm" });
      const chunks: Blob[] = [];

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunks.push(e.data);
      };

      recorder.onstop = () => {
        const blob = new Blob(chunks, { type: "audio/webm" });
        const file = new File([blob], "voice.webm", { type: "audio/webm" });
        setAudioFile(file);
        toast.success("Ghi âm thành công!");
        setCurrentStep(3);
      };

      audioRecorderRef.current = recorder;
      recorder.start();
      setAudioRecording(true);

      setTimeout(() => {
        recorder.stop();
        setAudioRecording(false);
      }, 5000);
    } catch {
      toast.error("Không thể truy cập microphone");
    }
  };

  const handleFullVerification = async () => {
    if (!videoFile || !audioFile) {
      toast.error("Vui lòng quay video và ghi âm trước khi xác thực.");
      return;
    }

    setLoadingLiveness(true);
    setLoadingVoice(true);

    try {
      // Gửi video để xác thực khuôn mặt
      const faceForm = new FormData();
      faceForm.append("userId", userId as string);
      faceForm.append("video", videoFile);

      const faceRes = await fetch(
        `${process.env.NEXT_PUBLIC_EKYC_API}/ekyc/liveness-check`,
        {
          method: "POST",
          body: faceForm,
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      const faceData = await faceRes.json();
      if (faceRes.ok) {
        setLivenessResult(faceData);
        if (faceData.is_live && faceData.is_match) {
          toast.success("Xác thực khuôn mặt thành công!");
        } else {
          if (!faceData.is_live) toast.error("Không phát hiện người thật!");
          if (!faceData.is_match) toast.error("Khuôn mặt không khớp!");
        }
      } else {
        toast.error(faceData.message || "Lỗi xác thực khuôn mặt");
      }

      // Gửi audio để xác thực giọng nói
      const voiceForm = new FormData();
      voiceForm.append("user_id", userId as string);
      voiceForm.append("file", audioFile);

      const voiceRes = await fetch(
        `${process.env.NEXT_PUBLIC_EKYC_API}/ekyc/voice-verify`,
        {
          method: "POST",
          body: voiceForm,
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      const voiceData = await voiceRes.json();
      if (voiceRes.ok) {
        setVoiceScore(voiceData.score);
        toast.success(
          voiceData.isMatch
            ? `Giọng nói khớp (${voiceData.score.toFixed(2)})`
            : `Giọng nói không khớp (${voiceData.score.toFixed(2)})`
        );
      } else {
        toast.error(voiceData.message || "Lỗi xác thực giọng nói");
      }

      // Ghi log xác thực nếu cả hai kết quả đều có
      if (faceData && voiceData) {
        await fetch(
          `${process.env.NEXT_PUBLIC_EKYC_API}/ekyc/verification-log`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
            body: JSON.stringify({
              userId,
              stepPassed:
                faceData.is_live && faceData.is_match && voiceData.isMatch,
              liveness: {
                isLive:
                  faceData.is_live === "true" || faceData.is_live === true,
                spoofProb: faceData.spoofProb,
              },
              faceMatch: {
                isMatch:
                  faceData.is_match === "true" || faceData.is_match === true,
                similarity: faceData.similarity,
              },
              voice: {
                isMatch: voiceData.isMatch,
                score: voiceData.score,
              },
            }),
          }
        );
      }
    } catch {
      toast.error("Lỗi kết nối máy chủ");
    } finally {
      setLoadingLiveness(false);
      setLoadingVoice(false);
    }
  };

  const getStepStatus = (step: number) => {
    if (step < currentStep) return "completed";
    if (step === currentStep) return "current";
    return "pending";
  };

  const progressValue = ((currentStep - 1) / 2) * 100;

  return (
    <div className="min-h-screen bg-white p-4 mt-20">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-3xl font-bold text-main mb-2">
            XÁC THỰC NGƯỜI DÙNG
          </h1>
          <p className="text-gray-600">Người dùng #{userId}</p>
          <div className="mt-6">
            <Progress
              value={progressValue}
              className="w-full max-w-md mx-auto"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 h-[450px]">
          {/* Step 1: Video Recording */}
          <Card
            className={`transition-all duration-300 ${currentStep === 1 ? "ring-2 ring-blue-500 shadow-lg" : ""} `}
          >
            <CardHeader className="p-4">
              <CardTitle className="flex items-center gap-2 text-base">
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center ${
                    getStepStatus(1) === "completed"
                      ? "bg-green-500 text-white"
                      : getStepStatus(1) === "current"
                        ? "bg-main text-white"
                        : "bg-gray-200 text-gray-500"
                  }`}
                >
                  {getStepStatus(1) === "completed" ? (
                    <CheckCircle className="w-4 h-4" />
                  ) : (
                    "1"
                  )}
                </div>
                Quay video khuôn mặt
                {videoFile && (
                  <Badge
                    variant="secondary"
                    className="ml-auto text-xs text-green-600"
                  >
                    Hoàn thành
                  </Badge>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0">
              <div className="space-y-3">
                <div className="relative aspect-[3/4] w-full max-w-[250px] mx-auto bg-gray-100 rounded-xl overflow-hidden">
                  {/* Show camera feed or recorded video */}
                  {videoBlob ? (
                    <video
                      src={videoBlob}
                      className="w-full h-full object-cover"
                      controls
                    />
                  ) : (
                    <video
                      ref={videoRef}
                      autoPlay
                      muted
                      className="w-full h-full object-cover"
                    />
                  )}

                  {!cameraOn && !videoBlob && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Camera className="w-12 h-12 text-gray-400" />
                    </div>
                  )}

                  {cameraOn && (
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                      <div className="w-32 h-44 border-4 border-white rounded-full opacity-70" />
                    </div>
                  )}

                  {recording && countdown > 0 && (
                    <div className="absolute top-2 right-2 bg-red-500 text-white text-xl font-bold rounded-full w-8 h-8 flex items-center justify-center animate-pulse">
                      {countdown}
                    </div>
                  )}
                </div>

                <div className="flex justify-center gap-2 flex-wrap">
                  {videoBlob ? (
                    <Button
                      onClick={resetVideo}
                      className="flex items-center gap-1 text-xs h-8 px-2"
                    >
                      <RefreshCw className="w-3 h-3" />
                      Quay lại
                    </Button>
                  ) : !cameraOn ? (
                    <Button
                      onClick={startCamera}
                      className="flex items-center gap-1 text-xs h-8 px-2"
                    >
                      <Camera className="w-3 h-3" />
                      Bật camera
                    </Button>
                  ) : (
                    <>
                      <Button
                        onClick={stopCamera}
                        variant="outline"
                        className="text-xs h-8 px-2"
                      >
                        Tắt camera
                      </Button>
                      <Button
                        onClick={startRecording}
                        disabled={recording}
                        className="flex items-center gap-1 bg-red-500 hover:bg-red-600 text-xs h-8 px-2"
                      >
                        {recording ? (
                          <Square className="w-3 h-3" />
                        ) : (
                          <Play className="w-3 h-3" />
                        )}
                        {recording ? "Đang quay..." : "Bắt đầu"}
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Step 2: Audio Recording */}
          <Card
            className={`transition-all duration-300 ${currentStep === 2 ? "ring-2 ring-blue-500 shadow-lg" : ""}`}
          >
            <CardHeader className="p-4">
              <CardTitle className="flex items-center gap-2 text-base">
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center ${
                    getStepStatus(2) === "completed"
                      ? "bg-green-500 text-white"
                      : getStepStatus(2) === "current"
                        ? "bg-main text-white"
                        : "bg-gray-200 text-gray-500"
                  }`}
                >
                  {getStepStatus(2) === "completed" ? (
                    <CheckCircle className="w-4 h-4" />
                  ) : (
                    "2"
                  )}
                </div>
                Ghi âm giọng nói
                {audioFile && (
                  <Badge
                    variant="secondary"
                    className="ml-auto text-xs text-green-600"
                  >
                    Hoàn thành
                  </Badge>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0">
              <div className="text-center space-y-4">
                <div className="w-24 h-24 mx-auto bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center">
                  <Mic
                    className={`w-12 h-12 text-white ${audioRecording ? "animate-pulse" : ""}`}
                  />
                </div>

                <div>
                  <p className="text-gray-600 mb-3 text-xs">
                    Nói một câu bất kỳ trong 5 giây
                  </p>
                  <Button
                    onClick={startAudioRecording}
                    disabled={audioRecording || !videoFile}
                    className="bg-green-500 hover:bg-green-600 text-white text-xs h-8 px-3"
                  >
                    {audioRecording ? "Đang ghi âm..." : "Bắt đầu ghi âm"}
                  </Button>
                </div>

                {audioFile && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-2">
                    <CheckCircle className="w-5 h-5 text-green-500 mx-auto mb-1" />
                    <p className="text-green-700 text-xs font-medium">
                      Đã ghi âm thành công!
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Step 3: Verification */}
          <Card
            className={`transition-all duration-300 ${currentStep === 3 ? "ring-2 ring-blue-500 shadow-lg" : ""}`}
          >
            <CardHeader className="p-4">
              <CardTitle className="flex items-center gap-2 text-base">
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center ${
                    getStepStatus(3) === "current"
                      ? "bg-main text-white"
                      : "bg-gray-200 text-gray-500"
                  }`}
                >
                  {getStepStatus(3) === "completed" ? (
                    <CheckCircle className="w-4 h-4" />
                  ) : (
                    "3"
                  )}
                </div>
                Xác thực
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0">
              <div className="space-y-4">
                <div className="flex justify-center mb-2">
                  <Shield className="w-12 h-12 text-main" />
                </div>

                <div className="space-y-3">
                  <Button
                    onClick={handleFullVerification}
                    disabled={
                      !videoFile ||
                      !audioFile ||
                      loadingLiveness ||
                      loadingVoice ||
                      currentStep < 3
                    }
                    className="w-full bg-main hover:bg-blue-700 text-white text-xs h-8"
                  >
                    {loadingLiveness || loadingVoice
                      ? "Đang xác thực..."
                      : "Xác thực danh tính"}
                  </Button>
                </div>

                {(livenessResult || voiceScore !== null) && (
                  <div className="space-y-3 text-xs">
                    {livenessResult && (
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-2">
                        <h4 className="text-main font-semibold text-sm">
                          Kết quả kiểm tra khuôn mặt
                        </h4>

                        <div className="flex items-center gap-2">
                          {livenessResult.is_live ? (
                            <CheckCircle className="w-5 h-5 text-green-500" />
                          ) : (
                            <XCircle className="w-5 h-5 text-red-500" />
                          )}
                          <span className="font-medium">
                            Phát hiện người thật:{" "}
                            {livenessResult.is_live ? "Có" : "Không"}
                          </span>
                        </div>

                        <div className="flex items-center gap-2">
                          {livenessResult.is_match ? (
                            <CheckCircle className="w-5 h-5 text-green-500" />
                          ) : (
                            <XCircle className="w-5 h-5 text-red-500" />
                          )}
                          <span className="font-medium">
                            Khuôn mặt khớp:{" "}
                            {livenessResult.is_match ? "Có" : "Không"}
                          </span>
                        </div>

                        <p className="text-sm text-gray-600">
                          Độ tương tự:{" "}
                          {typeof livenessResult?.similarity === "number"
                            ? `${livenessResult.similarity.toFixed(2)}%`
                            : "N/A"}
                        </p>
                      </div>
                    )}

                    {voiceScore !== null && (
                      <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 space-y-1">
                        <h4 className="text-purple-700 font-semibold text-sm">
                          Kết quả xác thực giọng nói
                        </h4>

                        <div className="flex items-center gap-2">
                          {voiceScore > 0.7 ? (
                            <CheckCircle className="w-5 h-5 text-green-500" />
                          ) : (
                            <XCircle className="w-5 h-5 text-red-500" />
                          )}
                          <span className="font-medium">
                            Điểm số: {(voiceScore * 100).toFixed(1)}%
                          </span>
                        </div>

                        <p className="text-sm text-gray-600">
                          {voiceScore > 0.7
                            ? "Giọng nói khớp"
                            : "Giọng nói không khớp"}
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
