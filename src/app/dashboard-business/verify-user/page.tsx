"use client";

import type React from "react";

import { useState } from "react";
import Image from "next/image";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import { Badge } from "../../components/ui/badge";
import { Separator } from "../../components/ui/separator";
import { Alert, AlertDescription } from "../../components/ui/alert";
import {
  Search,
  User,
  CreditCard,
  Camera,
  CheckCircle,
  XCircle,
  ArrowRight,
} from "lucide-react";
import toast from "react-hot-toast";

interface UserCCCD {
  fullName: string;
  idNumber: string;
  idFrontUrl: string;
  faceUrl: string;
  voiceVector: number[];
}

export default function VerifyUserPage() {
  const [userId, setUserId] = useState("");
  const [userCCCD, setUserCCCD] = useState<UserCCCD | null>(null);
  const [ekycEnrollDone, setEkycEnrollDone] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleFetch = async () => {
    if (!userId.trim()) {
      toast.error("Please enter User ID");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`/api/business/user-cccd?userId=${userId}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      const data = await res.json();
      if (res.ok) {
        setUserCCCD(data.cccd);
        toast.success("User information fetched successfully!");
        if (
          data.cccd.idFrontUrl &&
          data.cccd.idBackUrl &&
          data.cccd.faceUrl &&
          data.cccd.voiceVector &&
          data.cccd.voiceVector.length > 0
        ) {
          setEkycEnrollDone(true);
        }
      } else {
        toast.error(data.message);
      }
    } catch (err) {
      console.error(err);
      toast.error("Error fetching user information.");
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleFetch();
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 mt-15">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold text-main">User Verification</h1>
          <p className="text-gray-600">
            Enter User ID to start the verification process
          </p>
        </div>

        {/* Search Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-main">
              <Search className="h-5 w-5" />
              Search User
            </CardTitle>
            <CardDescription>
              Enter User ID to look up eKYC registration information
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-3">
              <Input
                type="text"
                placeholder="Enter User ID..."
                value={userId}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setUserId(e.target.value)
                }
                onKeyPress={handleKeyPress}
                className="flex-1"
                disabled={loading}
              />
              <Button
                onClick={handleFetch}
                disabled={loading || !userId.trim()}
                className="px-6"
              >
                {loading ? "Searching..." : "Search"}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* User Information Card */}
        {userCCCD && (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between text-main">
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Registered Information
                </CardTitle>
                <Badge variant={ekycEnrollDone ? "default" : "destructive"}>
                  {ekycEnrollDone ? (
                    <>
                      <CheckCircle className="h-3 w-3 mr-1" /> eKYC Completed
                    </>
                  ) : (
                    <>
                      <XCircle className="h-3 w-3 mr-1" /> eKYC Not Completed
                    </>
                  )}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Personal Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm font-medium text-gray-600">
                    <User className="h-4 w-4" />
                    Full Name
                  </div>
                  <p className="text-lg font-semibold">{userCCCD.fullName}</p>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm font-medium text-gray-600">
                    <CreditCard className="h-4 w-4" />
                    ID Number
                  </div>
                  <p className="text-lg font-semibold font-mono">
                    {userCCCD.idNumber}
                  </p>
                </div>
              </div>

              <Separator />

              {/* Images */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-sm font-medium text-gray-600">
                  <Camera className="h-4 w-4" />
                  Registered Images
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-gray-700">
                      ID Card Front
                    </p>
                    <div className="relative overflow-hidden rounded-lg border bg-gray-100">
                      <Image
                        src={userCCCD.idFrontUrl || "/placeholder.svg"}
                        alt="ID Card Front"
                        width={300}
                        height={300}
                        className="w-full h-60 object-cover hover:scale-105 transition-transform duration-200"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-gray-700">
                      Face Image
                    </p>
                    <div className="relative overflow-hidden rounded-lg border bg-gray-100">
                      <Image
                        src={userCCCD.faceUrl || "/placeholder.svg"}
                        alt="Registered Face Image"
                        width={300}
                        height={300}
                        className="w-full h-60 object-cover hover:scale-105 transition-transform duration-200"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Action Section */}
              <div className="space-y-4">
                {ekycEnrollDone ? (
                  <Alert className="border-green-200 bg-green-50">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <AlertDescription className="text-green-800">
                      User has completed eKYC registration. You can proceed with
                      biometric verification.
                    </AlertDescription>
                  </Alert>
                ) : (
                  <Alert className="border-red-200 bg-red-50">
                    <XCircle className="h-4 w-4 text-red-600" />
                    <AlertDescription className="text-red-800">
                      User has not completed eKYC registration. Please ask the
                      user to complete registration first.
                    </AlertDescription>
                  </Alert>
                )}

                <div className="flex justify-end">
                  {ekycEnrollDone ? (
                    <Button
                      size="lg"
                      className="gap-2"
                      onClick={() =>
                        (window.location.href = `/dashboard-business/verify-user/${userId}`)
                      }
                    >
                      Start Biometric Verification
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  ) : (
                    <Button disabled size="lg" variant="secondary">
                      Cannot Verify
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
