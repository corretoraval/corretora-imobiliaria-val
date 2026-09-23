import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

describe("SupabaseStorageProvider", () => {
  const originalEnv = { ...process.env };
  const originalFetch = global.fetch;

  beforeEach(() => {
    vi.clearAllMocks();
    process.env.SUPABASE_URL = "https://example.supabase.co";
    process.env.SUPABASE_SERVICE_ROLE_KEY = "test-service-key";
    process.env.SUPABASE_STORAGE_BUCKET = "property-photos";
  });

  afterEach(() => {
    process.env = { ...originalEnv };
    global.fetch = originalFetch;
  });

  it("identifica corretamente se o Supabase Storage está configurado", async () => {
    const { isSupabaseStorageConfigured } = await import("./supabase");
    expect(isSupabaseStorageConfigured()).toBe(true);

    delete process.env.SUPABASE_URL;
    expect(isSupabaseStorageConfigured()).toBe(false);
  });

  it("gera a signed upload URL chamando o endpoint de sign do Supabase", async () => {
    const mockSignedResponse = {
      url: "/object/upload/sign/property-photos/123-apartamento.jpg?token=jwt-token",
    };

    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: () => Promise.resolve(mockSignedResponse),
    });

    const { SupabaseStorageProvider } = await import("./supabase");
    const provider = SupabaseStorageProvider();

    expect(provider.createSignedUploadUrl).toBeDefined();
    if (!provider.createSignedUploadUrl) return;

    const result = await provider.createSignedUploadUrl(
      "apartamento.jpg",
      "image/jpeg",
    );

    expect(result.uploadUrl).toBe(
      "https://example.supabase.co/storage/v1/object/upload/sign/property-photos/123-apartamento.jpg?token=jwt-token",
    );
    expect(result.url).toContain(
      "https://example.supabase.co/storage/v1/object/public/property-photos/",
    );
    expect(result.path).toContain("apartamento.jpg");
    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining("/object/upload/sign/property-photos/"),
      expect.objectContaining({
        method: "POST",
        headers: expect.objectContaining({
          Authorization: "Bearer test-service-key",
          apikey: "test-service-key",
          "Content-Type": "application/json",
        }),
      }),
    );
  });

  it("formata a uploadUrl quando Supabase retorna signedURL absoluta", async () => {
    const mockSignedResponse = {
      signedURL:
        "https://custom-domain.com/storage/v1/object/upload/sign/property-photos/123-cobertura.jpg?token=abc",
    };

    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: () => Promise.resolve(mockSignedResponse),
    });

    const { SupabaseStorageProvider } = await import("./supabase");
    const provider = SupabaseStorageProvider();

    if (!provider.createSignedUploadUrl) return;

    const result = await provider.createSignedUploadUrl(
      "cobertura.jpg",
      "image/jpeg",
    );

    expect(result.uploadUrl).toBe(
      "https://custom-domain.com/storage/v1/object/upload/sign/property-photos/123-cobertura.jpg?token=abc",
    );
  });

  it("lança erro amigável se a requisição de assinatura falhar na API do Supabase", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 401,
      text: () => Promise.resolve("Invalid API key"),
    });

    const { SupabaseStorageProvider } = await import("./supabase");
    const provider = SupabaseStorageProvider();

    if (!provider.createSignedUploadUrl) return;

    await expect(
      provider.createSignedUploadUrl("foto.jpg", "image/jpeg"),
    ).rejects.toThrow("Supabase signed upload failed (401)");
  });
});
