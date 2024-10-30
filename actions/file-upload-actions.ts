"use server";
import tus from "tus-js-client";
import { createClient } from "@/utils/supabase/server";

const projectId = "";

export async function uploadFile(
  bucketName: "profile_pictures" | "badges",
  fileName: string,
  file: File | Blob | Pick<ReadableStreamDefaultReader<any>, "read">
) {
  const supabase = createClient();

  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    throw new Error("No session available");
  }

  return new Promise<void>(async (resolve, reject) => {
    let upload = new tus.Upload(file, {
      endpoint: `https://${projectId}.supabase.co/storage/v1/upload/resumable`,
      retryDelays: [0, 3000, 5000, 10000, 20000],
      headers: {
        authorization: `Bearer ${session.access_token}`,
        "x-upsert": "true", // optionally set upsert to true to overwrite existing files
      },
      uploadDataDuringCreation: true,
      removeFingerprintOnSuccess: true, // Important if you want to allow re-uploading the same file https://github.com/tus/tus-js-client/blob/main/docs/api.md#removefingerprintonsuccess
      metadata: {
        bucketName: bucketName,
        objectName: fileName,
        contentType: "image/png",
        cacheControl: "3600",
      },
      chunkSize: 6 * 1024 * 1024, // NOTE: it must be set to 6MB (for now) do not change it
      onError: function (error) {
        console.log("Failed because: " + error);
        reject(new Error(error.message));
      },
      onProgress: function (bytesUploaded, bytesTotal) {
        const percentage = ((bytesUploaded / bytesTotal) * 100).toFixed(2);
        console.log(bytesUploaded, bytesTotal, percentage + "%");
      },
      onSuccess: function () {
        console.log("Download %s from %s", upload.file, upload.url);
        resolve();
      },
    });

    // Check if there are any previous uploads to continue.
    const previousUploads = await upload.findPreviousUploads();
    // Found previous uploads so we select the first one.
    if (previousUploads.length) {
      upload.resumeFromPreviousUpload(previousUploads[0]);
    }
    // Start the upload
    upload.start();
  });
}
