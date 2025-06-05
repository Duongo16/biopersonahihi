export interface CCCDInfo {
  idNumber: string;
  fullName: string;
  dateOfBirth: string;
  idFrontUrl: string;
  idBackUrl: string;
  verified: boolean;
  faceUrl?: string;
  voiceVector?: string;
}

export async function getCCCDInfo(): Promise<CCCDInfo | null> {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_EKYC_API}ekyc/cccd-info`,
      {
        method: "GET",
        credentials: "include",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      }
    );

    if (!res.ok) return null;

    const data = await res.json();
    return data;
  } catch (error) {
    console.error("❌ Lỗi khi lấy CCCD:", error);
    return null;
  }
}
