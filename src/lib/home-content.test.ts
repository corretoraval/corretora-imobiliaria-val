import { describe, expect, it } from "vitest";
import {
  defaultHomeContent,
  normalizeHomeContent,
  splitHighlightedText,
} from "./home-content";

describe("Home content normalization", () => {
  it("keeps canonical persisted content ahead of fallbacks and legacy aliases", () => {
    const content = normalizeHomeContent({
      hero: {
        title: "Título canônico",
        description: "Descrição canônica",
        text: "Descrição legada que não deve vencer",
      },
    });

    expect(content.hero.title).toBe("Título canônico");
    expect(content.hero.description).toBe("Descrição canônica");
  });

  it("maps legacy Home keys without losing the rest of the structure", () => {
    const content = normalizeHomeContent({
      hero: {
        text: "Texto legado",
        primaryCtaText: "Ver imóveis",
        cardText: "Card legado",
      },
      services: defaultHomeContent.services,
    });

    expect(content.hero.description).toBe("Texto legado");
    expect(content.hero.primaryLabel).toBe("Ver imóveis");
    expect(content.hero.cardDescription).toBe("Card legado");
    expect(content.authority.storyTitle).toBe(
      "Uma trajetória guiada pela confiança",
    );
  });
});

describe("splitHighlightedText", () => {
  it("splits a present emphasis without removing surrounding text", () => {
    expect(splitHighlightedText("Confiança que abre portas.", "abre")).toEqual({
      before: "Confiança que ",
      highlighted: "abre",
      after: " portas.",
    });
  });

  it("renders the full title when emphasis is not present", () => {
    expect(
      splitHighlightedText("Confiança que abre portas.", "inexistente"),
    ).toEqual({
      before: "Confiança que abre portas.",
      highlighted: "",
      after: "",
    });
  });
});
