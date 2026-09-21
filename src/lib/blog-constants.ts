export const BLOG_CATEGORIES = [
  "Investimentos",
  "Alugar",
  "Comprar",
  "Mercado",
  "Temporada",
] as const;

export type BlogCategory = (typeof BLOG_CATEGORIES)[number];
