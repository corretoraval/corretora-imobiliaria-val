import { describe, expect, it, vi } from "vitest";
import robots from "./robots";
import sitemap from "./sitemap";
import { prisma } from "@/lib/prisma";
import { SITE_URL } from "@/lib/seo";

vi.mock("@/lib/prisma", () => ({
  prisma: {
    imovel: {
      findMany: vi.fn(),
    },
    postBlog: {
      findMany: vi.fn(),
    },
  },
}));

describe("sitemap.ts e robots.ts", () => {
  it("robots.ts aponta para o sitemap e restringe áreas internas", () => {
    const config = robots();
    expect(config.sitemap).toBe(`${SITE_URL}/sitemap.xml`);
    const rules = Array.isArray(config.rules) ? config.rules[0] : config.rules;
    expect(rules.allow).toBe("/");
    expect(rules.disallow).toContain("/admin");
  });

  it("sitemap inclui páginas fixas e dinâmicas de imóveis e blog", async () => {
    const mockImoveis = [
      {
        slug: "apartamento-centro-camboriu",
        updatedAt: new Date("2026-10-01T12:00:00Z"),
      },
    ];
    const mockPosts = [
      {
        slug: "guia-locacao-balneario-camboriu",
        publishedAt: new Date("2026-09-15T10:00:00Z"),
        updatedAt: new Date("2026-09-15T10:00:00Z"),
      },
    ];

    vi.mocked(prisma.imovel.findMany).mockResolvedValueOnce(
      mockImoveis as unknown as ReturnType<typeof prisma.imovel.findMany>,
    );
    vi.mocked(prisma.postBlog.findMany).mockResolvedValueOnce(
      mockPosts as unknown as ReturnType<typeof prisma.postBlog.findMany>,
    );

    const result = await sitemap();
    const urls = result.map((r) => r.url);

    expect(urls).toContain(`${SITE_URL}`);
    expect(urls).toContain(`${SITE_URL}/imoveis`);
    expect(urls).toContain(
      `${SITE_URL}/imoveis/apartamento-centro-camboriu`,
    );
    expect(urls).toContain(
      `${SITE_URL}/blog/guia-locacao-balneario-camboriu`,
    );
  });
});
