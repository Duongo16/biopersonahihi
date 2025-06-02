// Convert file to base64 data URI
export const fileToDataUri = async (file: File): Promise<string> => {
  const buffer = Buffer.from(await file.arrayBuffer());
  const base64 = buffer.toString("base64");
  return `data:${file.type};base64,${base64}`;
};
