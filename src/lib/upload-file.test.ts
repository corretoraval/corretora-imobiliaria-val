import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { uploadFile } from "./upload-file";

describe("uploadFile helper", () => {
  const originalFetch = global.fetch;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    global.fetch = originalFetch;
  });

  it("executa o fluxo de upload DIRETO via signed URL com sucesso", async () => {
    const mockFile = new File(["dummy-bytes-image"], "fachada.jpg", {
      type: "image/jpeg",
    });

    const fetchMock = vi.fn().mockImplementation((url, init) => {
      // 1. Chamada de preparação para obter a signed URL
      if (url === "/api/uploads/signed-url") {
        return Promise.resolve({
          ok: true,
          status: 200,
          json: () =>
            Promise.resolve({
              ok: true,
              directUpload: true,
              uploadUrl:
                "https://test.supabase.co/storage/v1/object/upload/sign/property-photos/fachada.jpg?token=abc",
              url: "https://test.supabase.co/storage/v1/object/public/property-photos/fachada.jpg",
              path: "fachada.jpg",
            }),
        });
      }

      // 2. Upload direto PUT para o Supabase
      if (
        typeof url === "string" &&
        url.includes("test.supabase.co/storage/v1/object/upload/sign")
      ) {
        expect(init?.method).toBe("PUT");
        expect(init?.body).toBe(mockFile);
        return Promise.resolve({
          ok: true,
          status: 200,
          text: () => Promise.resolve("OK"),
        });
      }

      return Promise.reject(new Error(`Unexpected fetch call to ${url}`));
    });

    global.fetch = fetchMock;

    const progressUpdates: number[] = [];
    const result = await uploadFile(mockFile, {
      onProgress: (p) => {
        progressUpdates.push(p.percent);
      },
    });

    expect(result.url).toBe(
      "https://test.supabase.co/storage/v1/object/public/property-photos/fachada.jpg",
    );
    expect(result.path).toBe("fachada.jpg");
    expect(progressUpdates).toContain(100);
  });

  it("faz fallback para upload multipart quando a signed URL não estiver disponível", async () => {
    const mockFile = new File(["bytes"], "foto-local.jpg", {
      type: "image/jpeg",
    });

    const fetchMock = vi.fn().mockImplementation((url) => {
      if (url === "/api/uploads/signed-url") {
        return Promise.resolve({
          ok: true,
          status: 200,
          json: () =>
            Promise.resolve({
              ok: false,
              directUpload: false,
            }),
        });
      }

      if (url === "/api/uploads") {
        return Promise.resolve({
          ok: true,
          status: 200,
          json: () =>
            Promise.resolve({
              ok: true,
              url: "/uploads/foto-local.jpg",
              path: "foto-local.jpg",
            }),
        });
      }

      return Promise.reject(new Error(`Unexpected fetch call to ${url}`));
    });

    global.fetch = fetchMock;

    const result = await uploadFile(mockFile);
    expect(result.url).toBe("/uploads/foto-local.jpg");
    expect(result.path).toBe("foto-local.jpg");
  });

  it("lança erro claro quando o upload direto para o Supabase falha", async () => {
    const mockFile = new File(["bytes"], "erro.png", { type: "image/png" });

    global.fetch = vi.fn().mockImplementation((url) => {
      if (url === "/api/uploads/signed-url") {
        return Promise.resolve({
          ok: true,
          status: 200,
          json: () =>
            Promise.resolve({
              ok: true,
              uploadUrl: "https://test.supabase.co/upload",
              url: "https://test.supabase.co/foto.png",
            }),
        });
      }

      if (url === "https://test.supabase.co/upload") {
        return Promise.resolve({
          ok: false,
          status: 403,
          text: () => Promise.resolve("Signature expired"),
        });
      }

      return Promise.reject(new Error("Unexpected url"));
    });

    await expect(uploadFile(mockFile)).rejects.toThrow(
      'Erro ao enviar a foto "erro.png" para o storage',
    );
  });
});
