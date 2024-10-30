import { NextRequest, NextResponse } from "next/server";

import { createClient } from "@/utils/supabase/server";

export async function POST(req: NextRequest) {
  const supabase = createClient();
  const formData = await req.formData();

  // Remember to enforce type here and after use some lib like zod.js to check it
  const files = formData.getAll("files") as File[];

  // Thats it, you have your files
  console.log(files);
  /*
      returns [
        {
          name: 'test.jpg',
          type: 'image/jpg',
          size: 1024,
          ...other file props
        }
      ]
    */

  const fileToStorage = files[0];

  // supose you have your Supabase client initialized previously
  await supabase.storage.from(this.bucketName).upload(
    `/some/path/${fileToStorage.name}`,
    fileToStorage,
    { contentType: fileToStorage.type } // Optional
  );

  return NextResponse.json({ message: "Files Created" });
}
