import crypto from "crypto";

export function generateToken(): string {
  return crypto.randomUUID();
}

function normalizeBaseUrl(rawUrl: string): string {
  const trimmed = rawUrl.trim();
  if (!trimmed) return "http://localhost:3000";

  // Allow env values like "my-domain.com" by prefixing a protocol.
  const withProtocol =
    trimmed.startsWith("http://") || trimmed.startsWith("https://")
      ? trimmed
      : `https://${trimmed}`;

  return withProtocol.replace(/\/+$/, "");
}

export function getBaseUrl(request?: Request): string {
  if (process.env.NEXT_PUBLIC_BASE_URL) {
    return normalizeBaseUrl(process.env.NEXT_PUBLIC_BASE_URL);
  }

  if (request) {
    return normalizeBaseUrl(new URL(request.url).origin);
  }

  return "http://localhost:3000";
}
