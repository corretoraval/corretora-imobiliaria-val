import { describe, expect, it, vi } from "vitest";
import { findAvailableSlug, nextPropertyCode, toSlug } from "./identifiers";

describe("identifiers", () => {
  it("normalizes titles to accent-free kebab-case slugs", () => {
    expect(toSlug("Apartamento à Beira-Mar, 3 suítes!")).toBe(
      "apartamento-a-beira-mar-3-suites",
    );
  });

  it("adds the first available numeric suffix to duplicate slugs", async () => {
    const taken = new Set(["casa-na-praia", "casa-na-praia-2"]);

    await expect(
      findAvailableSlug("Casa na Praia", async (slug) => taken.has(slug)),
    ).resolves.toBe("casa-na-praia-3");
  });

  it("falls back to item for titles without usable characters", async () => {
    const isTaken = vi.fn().mockResolvedValue(false);

    await expect(findAvailableSlug("!!!", isTaken)).resolves.toBe("item");
  });

  it("continues the VAL sequence and ignores legacy codes", () => {
    expect(nextPropertyCode(["VAL-001", "VAL-009", "OLD-22"])).toBe("VAL-010");
    expect(nextPropertyCode([])).toBe("VAL-001");
  });
});
