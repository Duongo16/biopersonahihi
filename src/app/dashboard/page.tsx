"use client";

import { useEffect, useState } from "react";
import { getCCCDInfo, CCCDInfo } from "../lib/user";
import Image from "next/image";

export default function Dashboard() {
  const [cccdInfo, setCccdInfo] = useState<CCCDInfo | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      const data = await getCCCDInfo();
      setCccdInfo(data);
      setLoading(false);
    };
    fetchData();
  }, []);

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center text-main text-lg font-semibold animate-pulse">
          Loading user information...
        </div>
      </div>
    );

  return (
    <div className="p-4 sm:p-6 md:p-10 max-w-6xl mx-auto mt-20">
      <h1 className="text-3xl font-bold mb-6 text-center text-main">
        eKYC Information
      </h1>

      {cccdInfo ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl shadow-md p-6 space-y-2">
            <h2 className="text-xl font-semibold text-primary mb-2">
              CCCD Information
            </h2>
            <p>
              <strong>ID Number:</strong> {cccdInfo.idNumber}
            </p>
            <p>
              <strong>Full Name:</strong> {cccdInfo.fullName}
            </p>
            <p>
              <strong>Date of Birth:</strong> {cccdInfo.dateOfBirth}
            </p>
            <p>
              <strong>Verification:</strong>{" "}
              <span
                className={
                  cccdInfo.verified ? "text-green-600" : "text-red-600"
                }
              >
                {cccdInfo.verified ? "Verified" : "Not verified"}
              </span>
            </p>
            <div className="flex gap-4 mt-4 flex-wrap">
              <Image
                src={cccdInfo.idFrontUrl}
                alt="CCCD Front"
                width={400}
                height={250}
                className="w-44 rounded-md "
              />
              <Image
                src={cccdInfo.idBackUrl}
                alt="CCCD Back"
                width={400}
                height={250}
                className="w-44 rounded-md "
              />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6 space-y-6">
            <div>
              <h2 className="text-xl font-semibold text-primary mb-2">Face</h2>
              {"faceUrl" in cccdInfo && cccdInfo.faceUrl ? (
                <Image
                  src={cccdInfo.faceUrl}
                  alt="Face"
                  width={400}
                  height={250}
                  className="w-60 rounded-md  mx-auto"
                />
              ) : (
                <div className="bg-yellow-100 border border-yellow-500 text-yellow-800 p-3 rounded-md text-sm">
                  <p className="mb-1 font-medium">
                    You have not registered your face yet.
                  </p>
                  <a
                    href="/ekyc/face"
                    className="underline text-blue-700 font-medium"
                  >
                    Register now
                  </a>
                </div>
              )}
            </div>

            <div>
              <h2 className="text-xl font-semibold text-primary mb-2">Voice</h2>
              {"voiceVector" in cccdInfo &&
              cccdInfo.voiceVector &&
              cccdInfo.voiceVector.length > 0 ? (
                <div className="bg-green-100 border border-green-500 text-green-800 p-3 rounded-md text-sm">
                  <p className="font-medium">
                    You have successfully registered your voice ✅
                  </p>
                </div>
              ) : (
                <div className="bg-yellow-100 border border-yellow-500 text-yellow-800 p-3 rounded-md text-sm">
                  <p className="mb-1 font-medium">
                    You have not registered your voice yet.
                  </p>
                  <a
                    href="/ekyc/voice"
                    className="underline text-blue-700 font-medium"
                  >
                    Register now
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-red-100 border border-red-500 text-red-700 p-4 rounded-lg text-center max-w-md mx-auto">
          <h2 className="text-xl font-semibold mb-2">
            You have not registered CCCD
          </h2>
          <p className="mb-4">
            Please register your CCCD to use all features of the system.
          </p>
          <a
            href="/ekyc/cccd"
            className="inline-block bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-blue-700"
          >
            Register CCCD now
          </a>
        </div>
      )}
    </div>
  );
}
