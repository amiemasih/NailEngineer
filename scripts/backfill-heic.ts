/**
 * One-time backfill: convert HEIC/HEIF images already in Supabase storage to
 * JPEG so the admin gallery never has to decode them in the browser again.
 *
 * For every .heic/.heif object in the training bucket it:
 *   1. downloads the file,
 *   2. converts it to JPEG (heic-convert, pure JS, runs in Node),
 *   3. uploads the .jpg alongside it,
 *   4. repoints the matching DB rows (TrainingImageFile / PopOffImageFile) at
 *      the new path so source filtering + downloads keep working,
 *   5. deletes the original .heic object.
 *
 * Dry run (read-only, lists what WOULD change):
 *   node --experimental-strip-types scripts/backfill-heic.ts
 * Apply for real:
 *   node --experimental-strip-types scripts/backfill-heic.ts --apply
 */

import { createClient } from "@supabase/supabase-js";
import { PrismaClient } from "@prisma/client";
import convert from "heic-convert";

const BUCKET = process.env.SUPABASE_TRAINING_BUCKET || "nail-training-data";
const APPLY = process.argv.includes("--apply");

if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
  console.error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}

const storage = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { persistSession: false, autoRefreshToken: false } },
).storage.from(BUCKET);

const prisma = new PrismaClient();

const isHeic = (name: string) => /\.(heic|heif)$/i.test(name);
const toJpgPath = (path: string) => path.replace(/\.(heic|heif)$/i, ".jpg");

async function listAllHeicPaths(): Promise<string[]> {
  const { data: roots, error } = await storage.list("", { limit: 1000 });
  if (error) throw error;

  const folders = (roots ?? []).filter(
    (f) => !f.id && f.name !== ".emptyFolderPlaceholder",
  );
  const paths: string[] = [];
  for (const folder of folders) {
    const { data: files } = await storage.list(folder.name, { limit: 1000 });
    for (const f of files ?? []) {
      if (f.id && isHeic(f.name)) paths.push(`${folder.name}/${f.name}`);
    }
  }
  return paths;
}

async function main() {
  console.log(`Bucket: ${BUCKET}`);
  console.log(APPLY ? "Mode: APPLY (will modify storage + DB)\n" : "Mode: DRY RUN (no changes)\n");

  const heicPaths = await listAllHeicPaths();
  console.log(`Found ${heicPaths.length} HEIC/HEIF file(s) in storage.`);
  if (heicPaths.length === 0) return;

  if (!APPLY) {
    heicPaths.forEach((p) => console.log(`  would convert: ${p} -> ${toJpgPath(p)}`));
    console.log("\nDry run only. Re-run with --apply to perform the conversion.");
    return;
  }

  let ok = 0;
  let failed = 0;
  for (const path of heicPaths) {
    const jpgPath = toJpgPath(path);
    try {
      const { data: blob, error: dlErr } = await storage.download(path);
      if (dlErr || !blob) throw dlErr ?? new Error("no data");

      const input = Buffer.from(await blob.arrayBuffer());
      const output = await convert({ buffer: input, format: "JPEG", quality: 0.85 });

      const { error: upErr } = await storage.upload(jpgPath, Buffer.from(output), {
        contentType: "image/jpeg",
        upsert: true,
      });
      if (upErr) throw upErr;

      const newName = jpgPath.split("/").pop()!;
      await prisma.trainingImageFile.updateMany({
        where: { path },
        data: { path: jpgPath, name: newName },
      });
      await prisma.popOffImageFile.updateMany({
        where: { path },
        data: { path: jpgPath, name: newName },
      });

      const { error: rmErr } = await storage.remove([path]);
      if (rmErr) throw rmErr;

      ok += 1;
      console.log(`✓ ${path} -> ${jpgPath}`);
    } catch (err) {
      failed += 1;
      console.error(`✗ ${path}:`, err instanceof Error ? err.message : err);
    }
  }

  console.log(`\nDone. Converted ${ok}, failed ${failed}.`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
