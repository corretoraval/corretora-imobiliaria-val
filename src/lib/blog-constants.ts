import { z } from "zod";

export const BLOG_CATEGORIES = [
  "Investimentos",
  "Alugar",
  "Comprar",
  "Mercado",
  "Temporada",
  "Administração de Imóveis",
  "Dicas ao Proprietário",
] as const;

export type BlogCategory = (typeof BLOG_CATEGORIES)[number];

export const blogPostSchema = z.object({
  slug: z
    .string()
    .trim()
    .min(3, "O slug deve ter pelo menos 3 caracteres")
    .max(200, "O slug não pode ter mais de 200 caracteres")
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Formato de URL amigável inválido")
    .optional(),
  title: z
    .string()
    .trim()
    .min(3, "O título deve ter pelo menos 3 caracteres")
    .max(200, "O título não pode ter mais de 200 caracteres"),
  summary: z
    .string()
    .trim()
    .min(10, "O resumo deve ter pelo menos 10 caracteres")
    .max(500, "O resumo não pode ter mais de 500 caracteres"),
  content: z.string().trim().min(1, "O conteúdo do post não pode estar vazio"),
  category: z.enum(BLOG_CATEGORIES),
  coverImage: z.string().trim().url().nullable().optional(),
  authorName: z
    .string()
    .trim()
    .min(2, "Nome do autor deve ter pelo menos 2 caracteres")
    .max(100)
    .default("Corretora Val"),
  readingTimeMinutes: z.coerce.number().int().positive().default(5),
  isFeatured: z.boolean().default(false),
  isPublished: z.boolean().default(false),
  seoTitle: z.string().trim().max(160).nullable().optional(),
  seoDescription: z.string().trim().max(320).nullable().optional(),
});

