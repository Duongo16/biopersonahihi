"use client";

import { useEffect, useState } from "react";
import CCCDStep from "../components/CCCDStep";
import FaceStep from "../components/FaceStep";
import toast from "react-hot-toast";
import VoiceStep from "../components/VoiceStep";

export default function EkycFlowPage() {
  const [step, setStep] = useState(1);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const [hasCCCD, setHasCCCD] = useState(false);
  const [userId, setUserId] = useState<string>("");

  const steps = ["Đăng ký CCCD", "Chụp khuôn mặt", "Thu giọng nói"];

  useEffect(() => {
    const fetchUserId = async () => {
      try {
        const res = await fetch("/api/auth/me", {
          method: "GET",
          credentials: "include",
        });
        const data = await res.json();
        if (res.ok && data.user?.id) {
          setUserId(data.user.id);
        } else {
          toast.error("Không thể xác thực người dùng");
        }
      } catch (err) {
        console.error("Lỗi xác thực:", err);
        toast.error("Không thể lấy thông tin người dùng");
      }
    };

    const checkExistingCCCD = async () => {
      try {
        const response = await fetch("/api/ekyc/cccd/info", {
          method: "GET",
          credentials: "include",
        });

        if (response.ok) {
          setHasCCCD(true);
          setStep(2);
          setCompletedSteps([1]);
        }
      } catch (error) {
        console.error("❌ Lỗi kiểm tra CCCD:", error);
      }
    };

    fetchUserId().then(checkExistingCCCD);
  }, []);

  const markStepComplete = (stepNumber: number) => {
    if (!completedSteps.includes(stepNumber)) {
      setCompletedSteps((prev) => [...prev, stepNumber]);
    }
    setStep(stepNumber + 1);
  };

  const goToStep = (target: number) => {
    if (target === 1 || (target > 1 && hasCCCD)) {
      setStep(target);
    } else {
      toast.error("Vui lòng hoàn thành bước đăng ký CCCD trước.");
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 p-4">
      <div className="w-full max-w-md space-y-4">
        {/* Progress Indicator */}
        <div className="w-full flex justify-between items-center">
          {steps.map((label, index) => {
            const stepNumber = index + 1;
            const isActive = step === stepNumber;
            const isCompleted = completedSteps.includes(stepNumber);
            return (
              <button
                key={label}
                onClick={() => goToStep(stepNumber)}
                className="flex flex-col items-center text-sm w-full focus:outline-none"
              >
                <div
                  className={`rounded-full w-8 h-8 flex items-center justify-center font-semibold mb-1
                    ${
                      isCompleted
                        ? "bg-green-600 text-white"
                        : isActive
                        ? "bg-blue-600 text-white"
                        : "bg-gray-300 text-gray-700"
                    }`}
                >
                  {stepNumber}
                </div>
                <span
                  className={
                    isActive ? "font-medium text-blue-700" : "text-gray-500"
                  }
                >
                  {label}
                </span>
              </button>
            );
          })}
        </div>

        {/* Step Content */}
        <div className="bg-white shadow-lg rounded-lg p-6">
          {step === 1 && (
            <CCCDStep
              onSuccess={() => {
                setHasCCCD(true);
                markStepComplete(1);
              }}
            />
          )}
          {step === 2 && <FaceStep onSuccess={() => markStepComplete(2)} />}
          {step === 3 && userId && (
            <VoiceStep
              userId={userId}
              onSuccess={() => {
                markStepComplete(3);
              }}
            />
          )}
        </div>
      </div>
    </div>
  );
}
