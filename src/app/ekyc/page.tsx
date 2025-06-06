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
  const [hasFace, setHasFace] = useState(false);
  const [hasVoice, setHasVoice] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const [userId, setUserId] = useState<string>("");

  const steps = ["Register ID Card", "Capture Face", "Record Voice"];

  useEffect(() => {
    const fetchUserId = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_AUTH_API}/auth/me`, {
          method: "GET",
          credentials: "include",
        });
        const data = await res.json();

        if (res.ok && data.user?.id) {
          setUserId(data.user.id);
        } else {
          console.log(res);
          toast.error("Unable to authenticate user");
        }
      } catch (err) {
        console.error("Authentication error:", err);
        toast.error("Unable to fetch user information");
      }
    };

    const checkExistingCCCD = async () => {
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_EKYC_API}/ekyc/cccd-info`,
          {
            method: "GET",
            credentials: "include",
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );

        if (response.ok) {
          setHasCCCD(true);
          setCompletedSteps([1]);
          const data = await response.json();
          console.log(data);
          if (data.faceUrl && data.voiceVector && data.voiceVector.length > 0) {
            setHasFace(true);
            setHasVoice(true);
            setCompletedSteps([1, 2, 3]);
          } else if (data.faceUrl) {
            setHasFace(true);
            setStep(3);
            setCompletedSteps([1, 2]);
          } else setStep(2);
        }
      } catch (error) {
        console.error("❌ Error checking ID Card:", error);
      } finally {
        setIsLoading(false);
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
      toast.error("Please complete the ID Card registration step first.");
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center text-main text-lg font-semibold animate-pulse">
          Loading user information...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white">
      <div className="w-full max-w-md space-y-8 mb-25">
        {/* Progress Indicator */}
        <h1 className="text-3xl font-bold text-center text-main mb-10">
          eKYC REGISTRATION
        </h1>
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
                          ? "bg-main text-white"
                          : "bg-gray-300 text-gray-700"
                    }`}
                >
                  {stepNumber}
                </div>
                <span
                  className={
                    isActive ? "font-medium text-main" : "text-gray-500"
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
              hasCCCD={hasCCCD}
              onSuccess={() => {
                setHasCCCD(true);
                markStepComplete(1);
              }}
            />
          )}
          {step === 2 && (
            <FaceStep
              hasFace={hasFace}
              onSuccess={() => {
                markStepComplete(2);
              }}
            />
          )}
          {step === 3 && userId && (
            <VoiceStep
              hasVoice={hasVoice}
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
