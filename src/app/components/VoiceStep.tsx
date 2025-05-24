"use client";

import { useState } from "react";
import MicRecorder from "mic-recorder-to-mp3";
import { Button } from "../components/ui/button";
import toast from "react-hot-toast";

const recorder = new MicRecorder({ bitRate: 128 });

export default function VoiceStep({
  userId,
  onSuccess,
}: {
  userId: string;
  onSuccess: () => void;
}) {
  const [isRecording, setIsRecording] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  const startRecording = () => {
    recorder.start().then(() => {
      setIsRecording(true);
      toast("🎙️ Đang ghi âm...");
    });
  };

  const stopRecording = () => {
    recorder
      .stop()
      .getMp3()
      .then(([buffer, blob]) => {
        const file = new File(buffer, "voice.wav", {
          type: blob.type,
          lastModified: Date.now(),
        });
        setAudioFile(file);
        setAudioUrl(URL.createObjectURL(file));
        setIsRecording(false);
        toast.success("✅ Đã ghi âm xong!");
      });
  };

  const handleUpload = async () => {
    if (!audioFile) return toast.error("Chưa có file ghi âm");
    if (!userId) return toast.error("Thiếu userId");

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("userId", userId);
      formData.append("voice", audioFile);

      const res = await fetch("/api/ekyc/voice-collect", {
        method: "POST",
        body: formData,
      });

      const result = await res.json();

      if (res.ok) {
        toast.success("🎉 Đã lưu voice profile thành công!");
        onSuccess();
      } else {
        toast.error(result.message || "Lỗi khi enroll giọng nói");
      }
    } catch (err) {
      console.error(err);
      toast.error("Không thể gửi giọng nói lên server");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-center">
        Bước 3: Thu âm giọng nói
      </h2>

      <div className="flex justify-center gap-4">
        {!isRecording ? (
          <Button
            onClick={startRecording}
            className="bg-green-600 hover:bg-green-700 text-white"
          >
            🎙️ Bắt đầu ghi
          </Button>
        ) : (
          <Button
            onClick={stopRecording}
            className="bg-red-600 hover:bg-red-700 text-white"
          >
            ⏹️ Dừng ghi
          </Button>
        )}
      </div>

      {audioUrl && (
        <div className="space-y-4">
          <p className="text-center font-medium">🔊 Ghi âm đã xong:</p>
          <audio controls src={audioUrl} className="w-full" />
          <Button
            onClick={handleUpload}
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white"
          >
            {loading ? "Đang gửi..." : "Gửi lên hệ thống"}
          </Button>
        </div>
      )}
    </div>
  );
}
