import { beforeEach, describe, expect, it, vi } from "vitest";

const mockStorageProvider = {
  createSignedUploadUrl: vi.fn(),
  uploadFile: vi.fn(),
  getUrl: vi.fn(),
  deleteFile: vi.fn(),
};

vi.mock("@/lib/storage", () => ({
  getStorageProvider: () => mockStorageProvider,
}));

describe("POST /api/uploads/signed-url", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("gera a signed upload URL do Supabase Storage com sucesso", async () => {
    mockStorageProvider.createSignedUploadUrl.mockResolvedValueOnce({
      url: "https://test.supabase.co/storage/v1/object/public/property-photos/123-imovel.png",
      path: "123-imovel.png",
      uploadUrl:
        "https://test.supabase.co/storage/v1/object/upload/sign/property-photos/123-imovel.png?token=mock-token",
    });

    const { POST } = await import("./route");

    const req = new Request("http://localhost/api/uploads/signed-url", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        filename: "imovel.png",
        contentType: "image/png",
      }),
    });

    const res = await POST(req);
    expect(res.status).toBe(200);

    const json = await res.json();
    expect(json.ok).toBe(true);
    expect(json.directUpload).toBe(true);
    expect(json.uploadUrl).toContain("upload/sign");
    expect(json.url).toContain("public/property-photos");
    expect(json.path).toBe("123-imovel.png");
    expect(mockStorageProvider.createSignedUploadUrl).toHaveBeenCalledWith(
      "imovel.png",
      "image/png",
    );
  });

  it("retorna 400 se faltar filename ou contentType", async () => {
    const { POST } = await import("./route");

    const req = new Request("http://localhost/api/uploads/signed-url", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ filename: "apenas-nome.jpg" }),
    });

    const res = await POST(req);
    expect(res.status).toBe(400);

    const json = await res.json();
    expect(json.error).toBe("Filename and content type are required");
  });

  it("retorna directUpload: false se o provider não tiver createSignedUploadUrl", async () => {
    const originalMethod = mockStorageProvider.createSignedUploadUrl;
    // @ts-expect-error test override
    mockStorageProvider.createSignedUploadUrl = undefined;

    const { POST } = await import("./route");

    const req = new Request("http://localhost/api/uploads/signed-url", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        filename: "imovel.png",
        contentType: "image/png",
      }),
    });

    const res = await POST(req);
    expect(res.status).toBe(200);

    const json = await res.json();
    expect(json.directUpload).toBe(false);

    mockStorageProvider.createSignedUploadUrl = originalMethod;
  });
});
