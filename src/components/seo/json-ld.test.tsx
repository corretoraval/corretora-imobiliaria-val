import { describe, expect, it } from "vitest";
import {
  generatePropertySchema,
  generateRealEstateAgentSchema,
} from "./json-ld";

describe("JSON-LD schemas", () => {
  it("gera schema RealEstateAgent com dados de contato, CRECI e regiao", () => {
    const schema = generateRealEstateAgentSchema({
      brandName: "Corretora Val",
      phone: "(47) 97400-7391",
      email: "contato@corretoraval.com.br",
      address: "Balneário Camboriú — SC",
      creci: "CRECI/SC 56372-F",
    });

    expect(schema["@type"]).toBe("RealEstateAgent");
    expect(schema.name).toBe("Corretora Val");
    expect(schema.telephone).toBe("(47) 97400-7391");
    expect(schema.email).toBe("contato@corretoraval.com.br");
    expect(schema.identifier).toBe("CRECI/SC 56372-F");
    expect(schema.areaServed).toHaveLength(2);
  });

  it("gera schema para Apartamento com ofertas e dimensoes", () => {
    const schema = generatePropertySchema({
      title: "Apartamento 3 dormitórios no Centro",
      propertyType: "Apartamento",
      purpose: "LOCACAO_ANUAL",
      city: "Balneário Camboriú",
      neighborhood: "Centro",
      monthlyRent: 4500,
      bedrooms: 3,
      bathrooms: 2,
      privateArea: 120,
      slug: "apartamento-3-dormitorios-centro",
      photos: [{ url: "https://example.com/foto1.jpg" }],
    });

    expect(schema["@type"]).toBe("Apartment");
    expect(schema.name).toBe("Apartamento 3 dormitórios no Centro");
    expect(schema.numberOfRooms).toBe(3);
    expect(schema.numberOfBathroomsTotal).toBe(2);
    expect(schema.offers?.price).toBe(4500);
    expect(schema.offers?.priceCurrency).toBe("BRL");
  });

  it("gera schema para Casa/Sobrado com SingleFamilyResidence", () => {
    const schema = generatePropertySchema({
      title: "Casa em condomínio fechado",
      propertyType: "Casa",
      purpose: "VENDA",
      city: "Camboriú",
      salePrice: 950000,
      bedrooms: 4,
      slug: "casa-condominio-camboriu",
    });

    expect(schema["@type"]).toBe("SingleFamilyResidence");
    expect(schema.offers?.price).toBe(950000);
  });
});
