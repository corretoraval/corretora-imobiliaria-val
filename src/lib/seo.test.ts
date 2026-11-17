import { describe, expect, it } from "vitest";
import {
  SITE_URL,
  buildCanonicalUrl,
  buildPropertyDescription,
  buildPropertyImageAlt,
  buildPropertyTitle,
} from "./seo";

describe("lib/seo", () => {
  it("monta o título de imóvel no padrão exigido com dormitórios e localização", () => {
    const title = buildPropertyTitle({
      propertyType: "Apartamento",
      bedrooms: 3,
      purpose: "LOCACAO_ANUAL",
      neighborhood: "Centro",
      city: "Camboriú",
    });

    expect(title).toBe(
      "Apartamento 3 dormitórios para alugar no Centro, Camboriú | Corretora Val",
    );
  });

  it("monta título para imóvel à venda sem bairro específico", () => {
    const title = buildPropertyTitle({
      propertyType: "Casa",
      bedrooms: 4,
      purpose: "VENDA",
      city: "Balneário Camboriú",
    });

    expect(title).toBe(
      "Casa 4 dormitórios para comprar em Balneário Camboriú | Corretora Val",
    );
  });

  it("monta título para temporada sem quartos (ex.: Studio)", () => {
    const title = buildPropertyTitle({
      propertyType: "Studio",
      bedrooms: 0,
      purpose: "TEMPORADA",
      neighborhood: "Barra Sul",
      city: "Balneário Camboriú",
    });

    expect(title).toBe(
      "Studio para temporada no Barra Sul, Balneário Camboriú | Corretora Val",
    );
  });

  it("monta meta description com no máximo 155 caracteres", () => {
    const desc = buildPropertyDescription({
      propertyType: "Apartamento",
      bedrooms: 2,
      purpose: "LOCACAO_ANUAL",
      neighborhood: "Pioneiros",
      city: "Balneário Camboriú",
    });

    expect(desc.length).toBeLessThanOrEqual(155);
    expect(desc).toContain("apartamento com 2 dormitórios");
    expect(desc).toContain("Pioneiros em Balneário Camboriú");
  });

  it("monta alt descritivo para imagens", () => {
    const altCover = buildPropertyImageAlt(
      {
        propertyType: "Apartamento",
        bedrooms: 3,
        neighborhood: "Centro",
        city: "Camboriú",
        purpose: "LOCACAO_ANUAL",
      },
      0,
      true,
    );
    expect(altCover).toContain("Fachada e detalhes");
    expect(altCover).toContain("apartamento de 3 dormitórios para alugar");
    expect(altCover).toContain("Centro em Camboriú");

    const altAmbiente = buildPropertyImageAlt(
      {
        propertyType: "Apartamento",
        bedrooms: 3,
        neighborhood: "Centro",
        city: "Camboriú",
      },
      2,
      false,
    );
    expect(altAmbiente).toContain("Ambiente 3 do apartamento de 3 dormitórios");
  });

  it("monta URLs canônicas limpas e absolutas", () => {
    expect(buildCanonicalUrl("/")).toBe(SITE_URL);
    expect(buildCanonicalUrl("/imoveis")).toBe(`${SITE_URL}/imoveis`);
    expect(buildCanonicalUrl("/imoveis/")).toBe(`${SITE_URL}/imoveis`);
  });
});
