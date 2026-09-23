import { afterAll, describe, expect, it } from "vitest";
import { LocalStorageProvider } from "./local";
import fs from "node:fs";
import path from "node:path";

describe("Upload de arquivos com diferentes tamanhos (poucos KB até 10MB)", () => {
  const provider = LocalStorageProvider();
  const uploadedUrls: string[] = [];

  afterAll(async () => {
    for (const url of uploadedUrls) {
      await provider.deleteFile(url);
    }
  });

  const sizes = [
    { label: "Poucos KB (16 KB)", bytes: 16 * 1024 },
    { label: "2 MB", bytes: 2 * 1024 * 1024 },
    { label: "5 MB", bytes: 5 * 1024 * 1024 },
    { label: "10 MB", bytes: 10 * 1024 * 1024 },
  ];

  for (const { label, bytes } of sizes) {
    it(`armazena com integridade arquivo de ${label}`, async () => {
      const filename = `test-size-${Date.now()}-${bytes}.dat`;
      const buffer = Buffer.alloc(bytes, 0x5a);

      const result = await provider.uploadFile(buffer, filename);
      uploadedUrls.push(result.url);

      expect(result.url).toBeDefined();
      expect(result.path).toBeDefined();

      const filePath = path.join(
        process.cwd(),
        "public",
        "uploads",
        result.path,
      );
      const stat = await fs.promises.stat(filePath);
      expect(stat.size).toBe(bytes);
    });
  }
});
