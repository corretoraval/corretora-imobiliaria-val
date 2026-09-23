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

describe("POST /api/uploads", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("gera URL de upload assinada do Supabase Storage quando recebe JSON", async () => {
    mockStorageProvider.createSignedUploadUrl.mockResolvedValueOnce({
      url: "https://test.supabase.co/storage/v1/object/public/property-photos/123-foto.jpg",
      path: "123-foto.jpg",
      uploadUrl:
        "https://test.supabase.co/storage/v1/object/upload/sign/property-photos/123-foto.jpg?token=secret",
    });

    const { POST } = await import("./route");

    const req = new Request("http://localhost/api/uploads", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        filename: "foto.jpg",
        contentType: "image/jpeg",
      }),
    });

    const res = await POST(req);
    expect(res.status).toBe(200);

    const json = await res.json();
    expect(json.ok).toBe(true);
    expect(json.directUpload).toBe(true);
    expect(json.uploadUrl).toContain("upload/sign");
    expect(json.url).toContain("public/property-photos");
    expect(mockStorageProvider.createSignedUploadUrl).toHaveBeenCalledWith(
      "foto.jpg",
      "image/jpeg",
    );
  });

  it("retorna 400 se o JSON não contiver filename ou contentType válidos", async () => {
    const { POST } = await import("./route");

    const req = new Request("http://localhost/api/uploads", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ filename: "" }),
    });

    const res = await POST(req);
    expect(res.status).toBe(400);

    const json = await res.json();
    expect(json.error).toBe("Filename and content type are required");
  });

  it("retorna directUpload: false se o provider não suportar URLs assinadas", async () => {
    vi.mocked(mockStorageProvider.createSignedUploadUrl).mockReturnValueOnce(
      undefined as unknown as Promise<{
        url: string;
        path: string;
        uploadUrl: string;
      }>,
    );

    // Temporarily remove createSignedUploadUrl property
    const originalMethod = mockStorageProvider.createSignedUploadUrl;
    // @ts-expect-error test override
    mockStorageProvider.createSignedUploadUrl = undefined;

    const { POST } = await import("./route");

    const req = new Request("http://localhost/api/uploads", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        filename: "foto.jpg",
        contentType: "image/jpeg",
      }),
    });

    const res = await POST(req);
    expect(res.status).toBe(200);

    const json = await res.json();
    expect(json.directUpload).toBe(false);

    // Restore
    mockStorageProvider.createSignedUploadUrl = originalMethod;
  });

  it("processa upload multipart tradicional quando não for JSON", async () => {
    mockStorageProvider.uploadFile.mockResolvedValueOnce({
      url: "/uploads/123-foto.jpg",
      path: "123-foto.jpg",
    });

    const { POST } = await import("./route");

    const file = new File(["dummy content"], "foto.jpg", {
      type: "image/jpeg",
    });
    const req = {
      headers: new Headers({ "content-type": "multipart/form-data" }),
      formData: async () => ({
        get: (key: string) => (key === "file" ? file : null),
      }),
    } as unknown as Request;

    const res = await POST(req);
    expect(res.status).toBe(200);

    const json = await res.json();
    expect(json.ok).toBe(true);
    expect(json.url).toBe("/uploads/123-foto.jpg");
    expect(mockStorageProvider.uploadFile).toHaveBeenCalledTimes(1);
  });

  it("retorna 400 se o multipart não contiver arquivo", async () => {
    const { POST } = await import("./route");

    const req = {
      headers: new Headers({ "content-type": "multipart/form-data" }),
      formData: async () => ({
        get: () => null,
      }),
    } as unknown as Request;

    const res = await POST(req);
    expect(res.status).toBe(400);

    const json = await res.json();
    expect(json.error).toBe("Missing file");
  });
});
