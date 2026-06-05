/**
 * Server-only Supabase Storage helper for the AI training-image pipeline.
 *
 * Uses the service-role key, so this module must never be imported into a
 * client component. Images are stored in a single private bucket, separated
 * into one folder per service stage (see training-steps.ts).
 *
 * Required env (see .env.example):
 *   SUPABASE_URL
 *   SUPABASE_SERVICE_ROLE_KEY
 * Optional:
 *   SUPABASE_TRAINING_BUCKET   (default: "nail-training-data")
 */

import { createClient, type SupabaseClient } from "@supabase/supabase-js";

export const TRAINING_BUCKET =
  process.env.SUPABASE_TRAINING_BUCKET || "nail-training-data";

/** Max size per uploaded image. */
export const MAX_IMAGE_BYTES = 25 * 1024 * 1024; // 25 MB

let cachedClient: SupabaseClient | null = null;
let bucketEnsured = false;

export function storageConfigured(): boolean {
  return Boolean(
    process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY,
  );
}

function getClient(): SupabaseClient {
  if (!storageConfigured()) {
    throw new Error(
      "Supabase storage is not configured. Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.",
    );
  }
  if (!cachedClient) {
    cachedClient = createClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { persistSession: false, autoRefreshToken: false } },
    );
  }
  return cachedClient;
}

/** Create the bucket on first use so the platform is self-provisioning. */
async function ensureBucket(client: SupabaseClient): Promise<void> {
  if (bucketEnsured) return;
  const { data } = await client.storage.getBucket(TRAINING_BUCKET);
  if (!data) {
    const { error } = await client.storage.createBucket(TRAINING_BUCKET, {
      public: false,
      fileSizeLimit: MAX_IMAGE_BYTES,
      allowedMimeTypes: ["image/*"],
    });
    // Ignore "already exists" races between concurrent requests.
    if (error && !/exist/i.test(error.message)) throw error;
  }
  bucketEnsured = true;
}

function sanitizeBaseName(name: string): string {
  const dot = name.lastIndexOf(".");
  const base = dot > 0 ? name.slice(0, dot) : name;
  return (
    base
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 40) || "image"
  );
}

function extensionFor(name: string, contentType: string): string {
  const dot = name.lastIndexOf(".");
  if (dot > 0 && dot < name.length - 1) {
    return name.slice(dot + 1).toLowerCase().replace(/[^a-z0-9]/g, "");
  }
  const fromType = contentType.split("/")[1];
  return (fromType || "jpg").toLowerCase().replace(/[^a-z0-9]/g, "");
}

export type UploadResult = { path: string; name: string };

/**
 * Upload one image into a step's folder. The path is
 *   `${folder}/${timestamp}-${uuid}-${slug}.${ext}`
 * which keeps filenames unique and human-scannable.
 */
export async function uploadTrainingImage(args: {
  folder: string;
  originalName: string;
  contentType: string;
  bytes: ArrayBuffer | Buffer | Uint8Array;
}): Promise<UploadResult> {
  const client = getClient();
  await ensureBucket(client);

  const stamp = new Date().toISOString().slice(0, 10);
  const unique = crypto.randomUUID().slice(0, 8);
  const slug = sanitizeBaseName(args.originalName);
  const ext = extensionFor(args.originalName, args.contentType);
  const name = `${stamp}-${unique}-${slug}.${ext}`;
  const path = `${args.folder}/${name}`;

  const body =
    args.bytes instanceof Uint8Array ? args.bytes : new Uint8Array(args.bytes);

  const { error } = await client.storage
    .from(TRAINING_BUCKET)
    .upload(path, body, { contentType: args.contentType, upsert: false });

  if (error) throw error;
  return { path, name };
}

export type StoredImage = {
  name: string;
  path: string;
  url: string | null;
  size: number | null;
  createdAt: string | null;
};

/**
 * Sign a known list of storage paths (e.g. image paths from the database),
 * returning a path -> short-lived signed URL map. Used to show a single
 * submitter's photos, which storage listing alone can't group by uploader.
 */
export async function signTrainingPaths(
  paths: string[],
): Promise<Map<string, string>> {
  const map = new Map<string, string>();
  if (paths.length === 0) return map;
  const client = getClient();
  const { data: signed } = await client.storage
    .from(TRAINING_BUCKET)
    .createSignedUrls(paths, 60 * 60); // 1 hour
  for (const s of signed ?? []) {
    if (s.path && s.signedUrl) map.set(s.path, s.signedUrl);
  }
  return map;
}

/** List images already uploaded for a step, with short-lived signed URLs. */
export async function listTrainingImages(
  folder: string,
  limit = 60,
): Promise<StoredImage[]> {
  const client = getClient();
  await ensureBucket(client);

  const { data, error } = await client.storage
    .from(TRAINING_BUCKET)
    .list(folder, {
      limit,
      sortBy: { column: "created_at", order: "desc" },
    });
  if (error) throw error;

  // Objects have an id; nested "folder" placeholders do not.
  const files = (data ?? []).filter((o) => o.id);
  if (files.length === 0) return [];

  const paths = files.map((f) => `${folder}/${f.name}`);
  const { data: signed } = await client.storage
    .from(TRAINING_BUCKET)
    .createSignedUrls(paths, 60 * 60); // 1 hour

  const urlByPath = new Map<string, string>();
  for (const s of signed ?? []) {
    if (s.path && s.signedUrl) urlByPath.set(s.path, s.signedUrl);
  }

  return files.map((f) => {
    const path = `${folder}/${f.name}`;
    return {
      name: f.name,
      path,
      url: urlByPath.get(path) ?? null,
      size: (f.metadata?.size as number | undefined) ?? null,
      createdAt: f.created_at ?? null,
    };
  });
}
