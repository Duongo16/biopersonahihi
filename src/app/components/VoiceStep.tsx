import { useState, useRef } from "react";
import { Button } from "../components/ui/button";
import toast from "react-hot-toast";

interface VoiceStepProps {
  userId: string;
  onSuccess: () => void;
}

export default function VoiceStep({ userId, onSuccess }: VoiceStepProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const [loading, setLoading] = useState(false);
  const chunksRef = useRef<Blob[]>([]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: "audio/webm",
      });
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      mediaRecorder.onstop = async () => {
        const blob = new Blob(chunksRef.current, { type: "audio/webm" });
        const file = new File([blob], "voice.wav", { type: "audio/wav" });
        setAudioFile(file);
        setAudioUrl(URL.createObjectURL(blob));
        toast.success("✅ Đã ghi âm xong!");
      };

      mediaRecorderRef.current = mediaRecorder;
      mediaRecorder.start();
      setIsRecording(true);
      toast("🎙️ Đang ghi âm...");
    } catch {
      toast.error("Không thể truy cập microphone");
    }
  };

  const stopRecording = () => {
    mediaRecorderRef.current?.stop();
    setIsRecording(false);
  };

  const handleUpload = async () => {
    if (!audioFile || !userId) return toast.error("Thiếu dữ liệu");
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("user_id", userId); // ✅ đúng với backend FastAPI
      formData.append("file", audioFile);
      console.log("Gửi dữ liệu:", {
        user_id: userId,
        file: audioFile.name,
      });

      const res = await fetch("http://localhost:8000/enroll", {
        method: "POST",
        body: formData,
      });

      const result = await res.json();
      if (res.ok) {
        toast.success("🎉 Đã lưu voice vector thành công!");
        onSuccess();
      } else {
        toast.error(result.message || "Lỗi khi enroll giọng nói");
      }
    } catch {
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
