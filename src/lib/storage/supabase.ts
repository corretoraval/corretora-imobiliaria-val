import type { StorageProvider, UploadResult } from "./types";

export function isSupabaseStorageConfigured() {
  return Boolean(
    process.env.SUPABASE_URL?.trim() &&
      process.env.SUPABASE_SERVICE_ROLE_KEY?.trim(),
  );
}

function objectPath(
  value: string,
  bucket = process.env.SUPABASE_STORAGE_BUCKET || "property-photos",
) {
  if (!value.startsWith("http")) {
    return value.replace(/^\/+/, "");
  }

  const marker = `/storage/v1/object/`;
  const markerIndex = value.indexOf(marker);
  if (markerIndex < 0) return value;

  const path = value.slice(markerIndex + marker.length);
  const publicPrefix = `public/${bucket}/`;
  return path.startsWith(publicPrefix)
    ? decodeURIComponent(path.slice(publicPrefix.length))
    : path;
}

export function SupabaseStorageProvider(): StorageProvider {
  const SUPABASE_URL = process.env.SUPABASE_URL?.replace(/\/+$/, "");
  const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const SUPABASE_STORAGE_BUCKET =
    process.env.SUPABASE_STORAGE_BUCKET || "property-photos";

  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error(
      "Supabase Storage requires SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.",
    );
  }

  const baseUrl = `${SUPABASE_URL}/storage/v1`;
  const headers = {
    Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
    apikey: SUPABASE_SERVICE_ROLE_KEY,
  };

  return {
    async createSignedUploadUrl(filename, contentType) {
      const path = `${Date.now()}-${filename}`.replace(
        /[^a-zA-Z0-9.\-_]/g,
        "_",
      );
      const response = await fetch(
        `${baseUrl}/object/upload/sign/${SUPABASE_STORAGE_BUCKET}/${path}`,
        {
          method: "POST",
          headers: {
            ...headers,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ contentType }),
        },
      );

      if (!response.ok) {
        const detail = await response.text();
        throw new Error(
          `Supabase signed upload failed (${response.status}): ${detail}`,
        );
      }

      const result = (await response.json()) as {
        signedURL?: string;
        url?: string;
        token?: string;
      };
      const signedUrl = result.signedURL || result.url;
      if (!signedUrl) {
        throw new Error("Supabase did not return a signed upload URL.");
      }

      let uploadUrl = signedUrl;
      if (!uploadUrl.startsWith("http")) {
        if (uploadUrl.startsWith("/storage/v1")) {
          uploadUrl = `${SUPABASE_URL}${uploadUrl}`;
        } else if (uploadUrl.startsWith("/")) {
          uploadUrl = `${baseUrl}${uploadUrl}`;
        } else {
          uploadUrl = `${baseUrl}/${uploadUrl}`;
        }
      }

      return {
        path,
        url: `${SUPABASE_URL}/storage/v1/object/public/${SUPABASE_STORAGE_BUCKET}/${path}`,
        uploadUrl,
      };
    },

    async uploadFile(buffer, destPath) {
      const path = objectPath(destPath);
      const response = await fetch(
        `${baseUrl}/object/${SUPABASE_STORAGE_BUCKET}/${path}`,
        {
          method: "POST",
          headers: {
            ...headers,
            "Content-Type": "application/octet-stream",
            "x-upsert": "false",
          },
          body: new Uint8Array(buffer),
        },
      );

      if (!response.ok) {
        const detail = await response.text();
        throw new Error(
          `Supabase Storage upload failed (${response.status}): ${detail}`,
        );
      }

      return {
        path,
        url: `${SUPABASE_URL}/storage/v1/object/public/${SUPABASE_STORAGE_BUCKET}/${path}`,
      } satisfies UploadResult;
    },

    getUrl(path) {
      if (path.startsWith("http")) return path;
      return `${SUPABASE_URL}/storage/v1/object/public/${SUPABASE_STORAGE_BUCKET}/${objectPath(path)}`;
    },

    async deleteFile(value) {
      const path = objectPath(value);
      const response = await fetch(
        `${baseUrl}/object/${SUPABASE_STORAGE_BUCKET}`,
        {
          method: "POST",
          headers: {
            ...headers,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ prefixes: [path] }),
        },
      );

      if (!response.ok && response.status !== 404) {
        const detail = await response.text();
        throw new Error(
          `Supabase Storage delete failed (${response.status}): ${detail}`,
        );
      }
    },
  };
}
