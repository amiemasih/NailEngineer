/** HS256 JWT verify using Web Crypto (Edge-safe). Matches jose SignJWT output. */

function base64UrlDecode(s: string): Uint8Array {
  const pad = s.length % 4 === 0 ? "" : "=".repeat(4 - (s.length % 4));
  const b64 = s.replace(/-/g, "+").replace(/_/g, "/") + pad;
  const bin = atob(b64);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return bytes;
}

function base64UrlToUtf8(s: string): string {
  return new TextDecoder().decode(base64UrlDecode(s));
}

export async function verifyJwtHs256(token: string, secret: Uint8Array) {
  const parts = token.split(".");
  if (parts.length !== 3) throw new Error("invalid token");

  const data = new TextEncoder().encode(`${parts[0]}.${parts[1]}`);
  const sig = base64UrlDecode(parts[2]);

  const key = await crypto.subtle.importKey(
    "raw",
    secret as BufferSource,
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["verify"],
  );

  const ok = await crypto.subtle.verify("HMAC", key, sig as BufferSource, data);
  if (!ok) throw new Error("invalid signature");

  const payload = JSON.parse(base64UrlToUtf8(parts[1])) as {
    exp?: number;
    sub?: string;
    email?: string;
  };

  if (payload.exp != null && payload.exp * 1000 < Date.now()) {
    throw new Error("expired");
  }

  return payload;
}
