import { NextResponse } from "next/server";
import { getTrainingStep } from "@/lib/training-steps";
import {
  listTrainingImages,
  storageConfigured,
  uploadTrainingImage,
  MAX_IMAGE_BYTES,
} from "@/lib/supabase-storage";

// Service-role Supabase + FormData parsing need the Node.js runtime.
export const runtime = "nodejs";

// Public, unauthenticated endpoint: the audience uploads reference photos here
// without signing in. Uploads are validated to images only and capped at
// MAX_IMAGE_BYTES; listing only returns short-lived server-signed URLs.

/** GET /api/training-images?step=<id>: list a step's uploaded images. */
export async function GET(req: Request) {
  if (!storageConfigured()) {
    return NextResponse.json(
      { error: "Storage is not configured yet.", configured: false, images: [] },
      { status: 200 },
    );
  }

  const stepId = new URL(req.url).searchParams.get("step");
  const step = stepId ? getTrainingStep(stepId) : null;
  if (!step) {
    return NextResponse.json({ error: "Unknown step." }, { status: 400 });
  }

  try {
    const images = await listTrainingImages(step.folder);
    return NextResponse.json({ configured: true, step: step.id, images });
  } catch (err) {
    console.error("training-images list failed", err);
    return NextResponse.json(
      { error: "Could not list images." },
      { status: 500 },
    );
  }
}

/** POST /api/training-images: multipart upload of one or more images. */
export async function POST(req: Request) {
  if (!storageConfigured()) {
    return NextResponse.json(
      {
        error:
          "Storage is not configured. Add SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY, then restart.",
      },
      { status: 503 },
    );
  }

  let form: FormData;
  try {
    form = await req.formData();
  } catch {
    return NextResponse.json(
      { error: "Expected multipart form data." },
      { status: 400 },
    );
  }

  const stepId = form.get("step");
  const step = typeof stepId === "string" ? getTrainingStep(stepId) : null;
  if (!step) {
    return NextResponse.json({ error: "Select a valid step." }, { status: 400 });
  }

  const files = form
    .getAll("files")
    .filter((f): f is File => f instanceof File && f.size > 0);
  if (files.length === 0) {
    return NextResponse.json({ error: "No images provided." }, { status: 400 });
  }

  const uploaded: { name: string; path: string }[] = [];
  const failed: { name: string; reason: string }[] = [];

  for (const file of files) {
    if (!file.type.startsWith("image/")) {
      failed.push({ name: file.name, reason: "Not an image file." });
      continue;
    }
    if (file.size > MAX_IMAGE_BYTES) {
      failed.push({ name: file.name, reason: "Larger than 25 MB." });
      continue;
    }
    try {
      const bytes = await file.arrayBuffer();
      const result = await uploadTrainingImage({
        folder: step.folder,
        originalName: file.name || "image",
        contentType: file.type,
        bytes,
      });
      uploaded.push(result);
    } catch (err) {
      console.error("training-image upload failed", file.name, err);
      failed.push({ name: file.name, reason: "Upload failed." });
    }
  }

  const status = uploaded.length === 0 ? 502 : 200;
  return NextResponse.json(
    { step: step.id, uploaded, failed },
    { status },
  );
}
