import { NextResponse } from "next/server";
import { getTrainingStep } from "@/lib/training-steps";
import { listTrainingImages, storageConfigured } from "@/lib/supabase-storage";

// Service-role Supabase needs the Node.js runtime.
export const runtime = "nodejs";

// Private admin listing. This lives under /api/tech/, so the middleware
// requires a valid tech session before the request reaches here — unlike the
// public /api/training-images endpoint, this one CAN list stored images.

/** GET /api/tech/training-images?step=<id>: list a step's submitted images. */
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
    const images = await listTrainingImages(step.folder, 200);
    return NextResponse.json({ configured: true, step: step.id, images });
  } catch (err) {
    console.error("tech training-images list failed", err);
    return NextResponse.json({ error: "Could not list images." }, { status: 500 });
  }
}
