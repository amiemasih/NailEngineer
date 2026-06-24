/**
 * Cleanup script to delete specific files from Supabase storage.
 * Run with: node scripts/cleanup-storage.js
 */

import { createClient } from "@supabase/supabase-js";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const envPath = path.join(__dirname, "..", ".env");

// Load .env file
const env = {};
if (fs.existsSync(envPath)) {
  const content = fs.readFileSync(envPath, "utf-8");
  content.split("\n").forEach((line) => {
    const match = line.match(/^([^=]+)=(.*)$/);
    if (match) {
      const key = match[1].trim();
      let value = match[2].trim();
      // Remove quotes if present
      if ((value.startsWith('"') && value.endsWith('"')) ||
          (value.startsWith("'") && value.endsWith("'"))) {
        value = value.slice(1, -1);
      }
      env[key] = value;
    }
  });
}

const SUPABASE_URL = env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = env.SUPABASE_SERVICE_ROLE_KEY;
const TRAINING_BUCKET = env.SUPABASE_TRAINING_BUCKET || "nail-training-data";

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env");
  process.exit(1);
}

const client = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false, autoRefreshToken: false },
});

async function main() {
  console.log(`Using bucket: ${TRAINING_BUCKET}`);

  // List all files in step-2-polish-removal to delete them all
  console.log("\n1. Listing files in step-2-polish-removal folder...");
  const { data: polishFiles, error: listErr } = await client.storage
    .from(TRAINING_BUCKET)
    .list("step-2-polish-removal", { limit: 1000 });

  if (listErr) {
    console.error("Failed to list polish removal files:", listErr);
    process.exit(1);
  }

  const files = (polishFiles || []).filter((f) => f.id) || [];
  console.log(`Found ${files.length} files in polish removal step`);

  files.forEach((f) => {
    console.log(`  - ${f.name}`);
  });

  if (files.length > 0) {
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

  // Search for 1806 in all other folders
  console.log("\n3. Searching for 1806 duplicate in all other folders...");
  const { data: allFolders, error: allErr } = await client.storage
    .from(TRAINING_BUCKET)
    .list("", { limit: 1000 });

  if (allErr) {
    console.error("Failed to list folders:", allErr);
  } else {
    const folders = (allFolders || []).filter((f) => !f.id && f.name !== ".emptyFolderPlaceholder");
    for (const folder of folders) {
      const { data: folderFiles } = await client.storage
        .from(TRAINING_BUCKET)
        .list(folder.name, { limit: 1000 });

      const dup = (folderFiles || []).find((f) => f.id && f.name.includes("1806"));
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
