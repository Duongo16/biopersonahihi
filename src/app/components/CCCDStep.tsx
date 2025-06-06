"use client";

import IDUploader from "./IDUploader";

export default function CCCDStep({
  hasCCCD,
  onSuccess,
}: {
  hasCCCD: boolean;
  onSuccess: () => void;
}) {
  if (hasCCCD) {
    return (
      <div className="text-center bg-green-100 border border-green-500 text-green-700 p-4 rounded-lg">
        <h2 className="text-xl font-semibold mb-2">CCCD Registered</h2>
        <p>You have already registered CCCD. Cannot add a new CCCD.</p>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-2xl font-bold text-center mb-6">
        Step 1: Register CCCD
      </h2>
      <IDUploader onSuccess={onSuccess} />
    </div>
  );
}
