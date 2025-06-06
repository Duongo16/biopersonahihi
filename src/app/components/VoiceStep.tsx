import { useState, useRef } from "react";
import { Button } from "../components/ui/button";
import toast from "react-hot-toast";

interface VoiceStepProps {
  userId: string;
  hasVoice: boolean;
  onSuccess: () => void;
}

export default function VoiceStep({
  userId,
  hasVoice,
  onSuccess,
}: VoiceStepProps) {
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
        toast.success("✅ Recording completed!");
      };

      mediaRecorderRef.current = mediaRecorder;
      mediaRecorder.start();
      setIsRecording(true);
      toast("🎙️ Recording...");
    } catch {
      toast.error("Cannot access microphone");
    }
  };

  const stopRecording = () => {
    mediaRecorderRef.current?.stop();
    setIsRecording(false);
  };

  const handleUpload = async () => {
    if (!audioFile || !userId) return toast.error("Missing data");
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("user_id", userId); // ✅ matches FastAPI backend
      formData.append("file", audioFile);
      console.log("Sending data:", {
        user_id: userId,
        file: audioFile.name,
      });

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_EKYC_API}/ekyc/voice-enroll`,
        {
          method: "POST",
          body: formData,
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      const result = await res.json();
      if (res.ok) {
        toast.success("🎉 Voice vector saved successfully!");
        onSuccess();
      } else {
        toast.error(result.message || "Error enrolling voice");
      }
    } catch {
      toast.error("Cannot upload voice to server");
    } finally {
      setLoading(false);
    }
  };

  if (hasVoice) {
    return (
      <div className="text-center bg-green-100 border border-green-500 text-green-700 p-4 rounded-lg">
        <h2 className="text-xl font-semibold mb-2">Voice already registered</h2>
        <p>
          You have successfully registered your voice. Cannot add a new voice.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-center">
        Step 3: Record your voice
      </h2>

      <div className="flex justify-center gap-4">
        {!isRecording ? (
          <Button
            onClick={startRecording}
            className="bg-green-600 hover:bg-green-700 text-white"
          >
            🎙️ Start recording
          </Button>
        ) : (
          <Button
            onClick={stopRecording}
            className="bg-red-600 hover:bg-red-700 text-white"
          >
            ⏹️ Stop recording
          </Button>
        )}
      </div>

      {audioUrl && (
        <div className="space-y-4">
          <p className="text-center font-medium">🔊 Recording completed:</p>
          <audio controls src={audioUrl} className="w-full" />
          <Button
            onClick={handleUpload}
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white"
          >
            {loading ? "Uploading..." : "Upload to system"}
          </Button>
        </div>
      )}
    </div>
  );
}
