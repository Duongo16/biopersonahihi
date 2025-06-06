"use client";

import { useState } from "react";
import { toast } from "react-hot-toast";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Button } from "./ui/button";
import Image from "next/image";

export default function IDUploader({ onSuccess }: { onSuccess: () => void }) {
  const [idFront, setIdFront] = useState<File | null>(null);
  const [idBack, setIdBack] = useState<File | null>(null);
  const [idFrontPreview, setIdFrontPreview] = useState<string | null>(null);
  const [idBackPreview, setIdBackPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleFileChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    type: "front" | "back"
  ) => {
    const file = e.target.files ? e.target.files[0] : null;
    if (file && !["image/png", "image/jpeg", "image/jpg"].includes(file.type)) {
      toast.error("Only PNG or JPG files are accepted.");
      return;
    }
    if (type === "front") {
      setIdFront(file);
      setIdFrontPreview(file ? URL.createObjectURL(file) : null);
    }
    if (type === "back") {
      setIdBack(file);
      setIdBackPreview(file ? URL.createObjectURL(file) : null);
    }
  };

  const handleSubmit = async () => {
    if (!idFront || !idBack) {
      toast.error("Please select both front and back images of your ID card.");
      return;
    }

    const formData = new FormData();
    formData.append("idFront", idFront);
    formData.append("idBack", idBack);

    setLoading(true);
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_EKYC_API}/ekyc/cccd-register`,
        {
          method: "POST",
          credentials: "include",
          body: formData,
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      const data = await response.json();
      if (response.ok) {
        toast.success(
          `Verification successful! ID: ${data.extractedID}, Name: ${data.extractedName}, Date of Birth: ${data.extractedDOB}`
        );
        onSuccess();
      } else {
        console.error("Validation failed:", data);
        toast.error(data.message || "Verification failed. Please try again.");
      }
    } catch (error) {
      console.error("Error validating ID card:", error);
      toast.error("Failed to validate ID card. Please try again.");
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="idFront">Front side of ID card</Label>
          <Input
            id="idFront"
            type="file"
            accept="image/*"
            onChange={(e) => handleFileChange(e, "front")}
          />
          {idFrontPreview && (
            <Image
              src={idFrontPreview}
              width={300}
              height={200}
              alt="Front side of ID card"
              className="mt-2 rounded border w-full object-contain max-h-64"
            />
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="idBack">Back side of ID card</Label>
          <Input
            id="idBack"
            type="file"
            accept="image/*"
            onChange={(e) => handleFileChange(e, "back")}
          />
          {idBackPreview && (
            <Image
              src={idBackPreview}
              width={300}
              height={200}
              alt="Back side of ID card"
              className="mt-2 rounded border w-full object-contain max-h-64"
            />
          )}
        </div>
      </div>

      <Button
        onClick={handleSubmit}
        disabled={loading}
        className="w-full bg-main hover:bg-blue-700 text-white"
      >
        {loading ? "Verifying..." : "Verify ID card"}
      </Button>
    </div>
  );
}
