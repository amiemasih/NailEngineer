/**
 * Cleanup script to delete specific files and folders from Supabase storage.
 * Run with: npx ts-node --project tsconfig.json scripts/cleanup-storage.ts
 */

import { createClient } from "@supabase/supabase-js";

const TRAINING_BUCKET = process.env.SUPABASE_TRAINING_BUCKET || "nail-training-data";

if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
  console.error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}

const client = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { persistSession: false, autoRefreshToken: false } }
);

async function main() {
  console.log(`Using bucket: ${TRAINING_BUCKET}`);

  // List all files in step-2-polish-removal to find the 1806 duplicate
  console.log("\n1. Listing files in step-2-polish-removal folder...");
  const { data: polishFiles, error: listErr } = await client.storage
    .from(TRAINING_BUCKET)
    .list("step-2-polish-removal", { limit: 1000 });

  if (listErr) {
    console.error("Failed to list polish removal files:", listErr);
    process.exit(1);
  }

  const files = polishFiles?.filter((f) => f.id) || [];
  console.log(`Found ${files.length} files in polish removal step`);

  files.forEach((f) => {
    console.log(`  - ${f.name}`);
  });

  // Look for the 1806 duplicate specifically
  const duplicate1806 = files.find((f) => f.name.includes("1806"));
  if (duplicate1806) {
    console.log(`\nFound 1806 duplicate: ${duplicate1806.name}`);
  }

  if (files.length === 0) {
    console.log("No files to delete in polish removal step");
  } else {
    console.log(`\n2. Deleting all ${files.length} files from step-2-polish-removal...`);
    const paths = files.map((f) => `step-2-polish-removal/${f.name}`);

    const { error: deleteErr } = await client.storage
      .from(TRAINING_BUCKET)
      .remove(paths);

    if (deleteErr) {
      console.error("Failed to delete files:", deleteErr);
      process.exit(1);
    }
    console.log(`✓ Deleted ${paths.length} files from polish removal step`);
  }

  // Also search for 1806 in all other folders and delete if found
  console.log("\n3. Searching for 1806 duplicate in all folders...");
  const { data: allFolders, error: allErr } = await client.storage
    .from(TRAINING_BUCKET)
    .list("", { limit: 1000 });

  if (allErr) {
    console.error("Failed to list folders:", allErr);
  } else {
    const folders = allFolders?.filter((f) => !f.id && f.name !== ".emptyFolderPlaceholder") || [];
    for (const folder of folders) {
      const { data: folderFiles } = await client.storage
        .from(TRAINING_BUCKET)
        .list(folder.name, { limit: 1000 });

      const dup = folderFiles?.find((f) => f.id && f.name.includes("1806"));
      if (dup) {
        console.log(`Found 1806 in ${folder.name}/${dup.name}`);
        const { error: delErr } = await client.storage
          .from(TRAINING_BUCKET)
          .remove([`${folder.name}/${dup.name}`]);

        if (delErr) {
          console.error(`Failed to delete ${folder.name}/${dup.name}:`, delErr);
        } else {
          console.log(`✓ Deleted 1806 duplicate from ${folder.name}`);
        }
      }
    }
  }

  console.log("\n✓ Cleanup complete!");
}

main().catch(console.error);
