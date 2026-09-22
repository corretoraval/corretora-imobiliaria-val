import { beforeAll, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/lib/prisma", () => {
  return {
    prisma: {
      configuracaoSite: { findUnique: vi.fn() },
      paginaSite: { findMany: vi.fn() },
      depoimento: { findMany: vi.fn() },
      marcoHistorico: { findMany: vi.fn() },
      membroEquipe: { findMany: vi.fn() },
    },
  };
});

let siteContent: typeof import("./site-content");

type SiteContentPrismaMock = {
  prisma: {
    configuracaoSite: { findUnique: ReturnType<typeof vi.fn> };
    paginaSite: { findMany: ReturnType<typeof vi.fn> };
    depoimento: { findMany: ReturnType<typeof vi.fn> };
    marcoHistorico: { findMany: ReturnType<typeof vi.fn> };
    membroEquipe: { findMany: ReturnType<typeof vi.fn> };
  };
};

let prismaMock: SiteContentPrismaMock;

beforeAll(async () => {
  prismaMock = (await import(
    "@/lib/prisma"
  )) as unknown as SiteContentPrismaMock;
  siteContent = await import("./site-content");
});

beforeEach(() => {
  vi.clearAllMocks();
});

describe("site-content helpers and fallback behavior", () => {
  describe("getSiteSettings", () => {
    it("returns default fallback settings when database returns null", async () => {
      prismaMock.prisma.configuracaoSite.findUnique.mockResolvedValue(null);
      const settings = await siteContent.getSiteSettings();
      expect(settings).toBeDefined();
      expect(settings.themePreset).toBe("ametista-ouro");
      expect(settings.primaryColor).toBe("#35104f");
      expect(settings.brandName).toBe("Corretora Val");
    });

    it("returns default fallback settings when database throws", async () => {
      prismaMock.prisma.configuracaoSite.findUnique.mockRejectedValue(
        new Error("DB offline"),
      );
      const settings = await siteContent.getSiteSettings();
      expect(settings).toBeDefined();
      expect(settings.themePreset).toBe("ametista-ouro");
      expect(settings.titleFont).toBe("cormorant");
    });

    it("returns custom settings when database query succeeds", async () => {
      prismaMock.prisma.configuracaoSite.findUnique.mockResolvedValue({
        id: "principal",
        brandName: "Val Imóveis",
        themePreset: "esmeralda",
        primaryColor: "#1a3a2a",
      });
      const settings = await siteContent.getSiteSettings();
      expect(settings.brandName).toBe("Val Imóveis");
      expect(settings.themePreset).toBe("esmeralda");
    });
  });

  describe("getDepoimentos", () => {
    it("returns empty array as fallback when database throws", async () => {
      prismaMock.prisma.depoimento.findMany.mockRejectedValue(
        new Error("DB error"),
      );
      const items = await siteContent.getDepoimentos();
      expect(items).toEqual([]);
    });

    it("returns published items ordered by sortOrder", async () => {
      prismaMock.prisma.depoimento.findMany.mockResolvedValue([
        { id: "1", clientName: "Ana", isPublished: true, sortOrder: 0 },
      ]);
      const items = await siteContent.getDepoimentos();
      expect(items).toHaveLength(1);
      expect(items[0].clientName).toBe("Ana");
    });
  });

  describe("getMarcosHistoricos", () => {
    it("returns empty array as fallback when database throws", async () => {
      prismaMock.prisma.marcoHistorico.findMany.mockRejectedValue(
        new Error("DB error"),
      );
      const items = await siteContent.getMarcosHistoricos();
      expect(items).toEqual([]);
    });

    it("returns items when query succeeds", async () => {
      prismaMock.prisma.marcoHistorico.findMany.mockResolvedValue([
        { id: "m1", year: 1989, title: "Início", sortOrder: 0 },
      ]);
      const items = await siteContent.getMarcosHistoricos();
      expect(items).toHaveLength(1);
      expect(items[0].year).toBe(1989);
    });
  });

  describe("getMembrosEquipe", () => {
    it("returns empty array as fallback when database throws", async () => {
      prismaMock.prisma.membroEquipe.findMany.mockRejectedValue(
        new Error("DB error"),
      );
      const items = await siteContent.getMembrosEquipe();
      expect(items).toEqual([]);
    });

    it("returns items when query succeeds", async () => {
      prismaMock.prisma.membroEquipe.findMany.mockResolvedValue([
        { id: "e1", name: "Valdete", role: "Fundadora", sortOrder: 0 },
      ]);
      const items = await siteContent.getMembrosEquipe();
      expect(items).toHaveLength(1);
      expect(items[0].name).toBe("Valdete");
    });
  });
});
