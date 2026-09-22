import fs from "node:fs";
import path from "node:path";
import type { StorageProvider, UploadResult } from "./types";

export function LocalStorageProvider(): StorageProvider {
  const uploadsRoot = path.join(process.cwd(), "public", "uploads");

  async function ensureDir(filePath: string) {
    const dir = path.dirname(filePath);
    await fs.promises.mkdir(dir, { recursive: true });
  }

  return {
    async uploadFile(buffer: Buffer, destPath: string) {
      const safeDest = destPath.replace(/^[\\/]+/, "");
      const fullPath = path.join(uploadsRoot, safeDest);
      await ensureDir(fullPath);
      await fs.promises.writeFile(fullPath, buffer);
      const url = `/uploads/${safeDest.replace(/\\\\/g, "/")}`;
      const result: UploadResult = { url, path: safeDest };
      return result;
    },
    getUrl(p) {
      if (p.startsWith("/")) return p;
      return `/uploads/${p.replace(/\\\\/g, "/")}`;
    },
    async deleteFile(p) {
      if (p.startsWith("http")) return;
      const relativePath = p.replace(/^\/uploads[\\/]/, "");
      const full = path.join(uploadsRoot, relativePath);
      try {
        await fs.promises.unlink(full);
      } catch {
        // ignore if file does not exist
      }
    },
  };
}
