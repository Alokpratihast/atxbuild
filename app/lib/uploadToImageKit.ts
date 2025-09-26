// lib/uploadToImageKit.ts
export async function uploadToImageKit(file: File): Promise<string> {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("fileName", file.name);
  formData.append("publicKey", process.env.IMAGEKIT_PUBLIC_KEY!);
  formData.append("urlEndpoint", process.env.IMAGEKIT_URL_ENDPOINT!);
  formData.append("privateKey", process.env.IMAGEKIT_PRIVATE_KEY!);

  const auth = btoa(`${process.env.IMAGEKIT_PRIVATE_KEY}:`);

  const res = await fetch("https://upload.imagekit.io/api/v1/files/upload", {
    method: "POST",
    headers: {
      Authorization: `Basic ${auth}`,
    },
    body: formData,
  });

  const data = await res.json();
  return data.url;
}
