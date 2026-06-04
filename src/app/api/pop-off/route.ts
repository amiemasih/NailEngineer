import { NextResponse } from "next/server";
import {
  storageConfigured,
  uploadTrainingImage,
  MAX_IMAGE_BYTES,
} from "@/lib/supabase-storage";
import { notifyPopOff } from "@/lib/notify";
import { prisma } from "@/lib/prisma";

// Service-role Supabase + FormData parsing need the Node.js runtime.
export const runtime = "nodejs";

const FINGER_IDS = ["thumb", "index", "middle", "ring", "pinky"];
const POP_OFF_FOLDER = "pop-off-reports";

/** Parse a JSON array of known finger ids; tolerate bad input. */
function readFingers(form: FormData, key: string): string[] {
  const raw = form.get(key);
  if (typeof raw !== "string" || !raw) return [];
  try {
    const arr = JSON.parse(raw);
    if (!Array.isArray(arr)) return [];
    return arr.filter((f): f is string => FINGER_IDS.includes(f));
  } catch {
    return [];
  }
}

/** Parse a yyyy-mm-dd date input into a Date, or null. */
function readDate(form: FormData, key: string): Date | null {
  const raw = form.get(key);
  if (typeof raw !== "string" || !raw) return null;
  const d = new Date(raw);
  return Number.isNaN(d.getTime()) ? null : d;
}

/** POST /api/pop-off: structured pop-off report with optional photos. */
export async function POST(req: Request) {
  let form: FormData;
  try {
    form = await req.formData();
  } catch {
    return NextResponse.json(
      { error: "Expected multipart form data." },
      { status: 400 },
    );
  }

  const rawName = form.get("submitterName");
  const submitterName = typeof rawName === "string" ? rawName.trim() : "";
  if (!submitterName) {
    return NextResponse.json(
      { error: "Enter your nail school or tech/salon name before submitting." },
      { status: 400 },
    );
  }
  const submitterType =
    form.get("submitterType") === "school" ? "school" : "individual";

  const leftFingers = readFingers(form, "leftFingers");
  const rightFingers = readFingers(form, "rightFingers");
  const nailsDoneDate = readDate(form, "nailsDoneDate");
  const poppedOffDate = readDate(form, "poppedOffDate");
  const rawNotes = form.get("notes");
  const notes =
    typeof rawNotes === "string" && rawNotes.trim()
      ? rawNotes.trim().slice(0, 2000)
      : null;

  if (leftFingers.length === 0 && rightFingers.length === 0) {
    return NextResponse.json(
      { error: "Tap at least one nail that popped off." },
      { status: 400 },
    );
  }

  // Optional photos, only if storage is configured.
  const uploaded: { name: string; path: string }[] = [];
  const failed: { name: string; reason: string }[] = [];
  if (storageConfigured()) {
    const files = form
      .getAll("files")
      .filter((f): f is File => f instanceof File && f.size > 0);
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
          folder: POP_OFF_FOLDER,
          originalName: file.name || "popoff",
          contentType: file.type,
          bytes,
        });
        uploaded.push(result);
      } catch (err) {
        console.error("pop-off photo upload failed", file.name, err);
        failed.push({ name: file.name, reason: "Upload failed." });
      }
    }
  }

  try {
    await prisma.popOffReport.create({
      data: {
        submitterName: submitterName.slice(0, 160),
        submitterType,
        leftFingers: JSON.stringify(leftFingers),
        rightFingers: JSON.stringify(rightFingers),
        nailsDoneDate,
        poppedOffDate,
        notes,
        images: {
          create: uploaded.map((u) => ({ path: u.path, name: u.name })),
        },
      },
    });
  } catch (err) {
    console.error("pop-off report record failed", err);
    return NextResponse.json(
      { error: "Could not save your report. Please try again." },
      { status: 500 },
    );
  }

  // Best-effort notification, never blocks the report.
  await notifyPopOff({
    submitterName,
    submitterType,
    leftFingers,
    rightFingers,
    nailsDoneDate: nailsDoneDate ? nailsDoneDate.toLocaleDateString() : null,
    poppedOffDate: poppedOffDate ? poppedOffDate.toLocaleDateString() : null,
    notes,
    photoCount: uploaded.length,
  });

  return NextResponse.json({ ok: true, uploaded, failed });
}
