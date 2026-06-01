import { NextResponse } from "next/server";
import JSZip from "jszip";
import { getTrainingStep } from "@/lib/training-steps";
import {
  downloadTrainingImage,
  listTrainingImagePaths,
  storageConfigured,
} from "@/lib/supabase-storage";

// Service-role Supabase + zipping need the Node.js runtime.
export const runtime = "nodejs";

// Private: under /api/tech/, so the middleware requires a valid tech session.
// Streams every image in a step's folder back as a single .zip download.

/** GET /api/tech/training-images/download?step=<id>: zip of a step's images. */
export async function GET(req: Request) {
  if (!storageConfigured()) {
    return NextResponse.json({ error: "Storage is not configured." }, { status: 503 });
  }

  const stepId = new URL(req.url).searchParams.get("step");
  const step = stepId ? getTrainingStep(stepId) : null;
  if (!step) {
    return NextResponse.json({ error: "Unknown step." }, { status: 400 });
  }

  try {
    const files = await listTrainingImagePaths(step.folder);
    if (files.length === 0) {
      return NextResponse.json({ error: "No images in this step." }, { status: 404 });
    }

    const zip = new JSZip();
    const folder = zip.folder(step.folder) ?? zip;

    // Fetch each object's bytes and add it to the archive. Skip any that fail
    // so one bad object doesn't sink the whole download.
    const results = await Promise.all(
      files.map(async (f) => {
        const bytes = await downloadTrainingImage(f.path);
        return bytes ? { name: f.name, bytes } : null;
      }),
    );
    let added = 0;
    for (const r of results) {
      if (r) {
        folder.file(r.name, r.bytes);
        added++;
      }
    }
    if (added === 0) {
      return NextResponse.json({ error: "Could not read any images." }, { status: 502 });
    }

    const blob = await zip.generateAsync({
      type: "uint8array",
      compression: "DEFLATE",
      compressionOptions: { level: 1 }, // images are already compressed
    });

    return new NextResponse(blob as unknown as BodyInit, {
      status: 200,
      headers: {
        "Content-Type": "application/zip",
        "Content-Disposition": `attachment; filename="${step.folder}.zip"`,
        "Content-Length": String(blob.byteLength),
      },
    });
  } catch (err) {
    console.error("training-images download failed", err);
    return NextResponse.json({ error: "Could not build the download." }, { status: 500 });
  }
}
