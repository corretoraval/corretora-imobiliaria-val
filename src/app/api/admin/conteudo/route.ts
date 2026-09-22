import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { getServerSession } from "next-auth/next";
import { Prisma } from "@prisma/client";
import { ZodError, z } from "zod";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const COLOR_REGEX = /^#[0-9a-fA-F]{6}$/;
const VALID_THEME_PRESETS = [
  "ametista-ouro",
  "ardosia-terracota",
  "verde-champanhe",
  "marinho-coral",
  "grafite-cobre",
] as const;
const VALID_TITLE_FONTS = [
  "cormorant",
  "playfair",
  "lora",
  "dm-serif",
] as const;
const VALID_BODY_FONTS = [
  "manrope",
  "inter",
  "outfit",
  "plus-jakarta",
] as const;

const nullableText = (max: number) =>
  z.preprocess(
    (value) => (value === "" ? null : value),
    z.string().trim().max(max).nullable(),
  );

const nullableEmail = z.preprocess(
  (value) => (value === "" ? null : value),
  z.string().trim().email().nullable(),
);

const nullableUrl = z.preprocess(
  (value) => (value === "" ? null : value),
  z.string().trim().url().nullable(),
);

const settingsSchema = z.object({
  brandName: z.string().trim().min(2).max(80),
  tagline: z.string().trim().min(2).max(160),
  phone: nullableText(40),
  whatsapp: nullableText(32),
  email: nullableEmail,
  address: nullableText(160),
  instagramUrl: nullableUrl,
  creci: z.string().trim().min(3).max(60),
  // Tema visual
  themePreset: z.enum(VALID_THEME_PRESETS),
  primaryColor: z.string().regex(COLOR_REGEX),
  primaryHover: z.string().regex(COLOR_REGEX),
  accentColor: z.string().regex(COLOR_REGEX),
  accentLightColor: z.string().regex(COLOR_REGEX),
  backgroundColor: z.string().regex(COLOR_REGEX),
  titleFont: z.enum(VALID_TITLE_FONTS),
  bodyFont: z.enum(VALID_BODY_FONTS),
});

const pageSchema = z.object({
  slug: z
    .string()
    .trim()
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  navigationLabel: z.string().trim().min(2).max(40),
  eyebrow: z.string().trim().max(80).nullable(),
  title: z.string().trim().min(3).max(160),
  heading: z.string().trim().min(3).max(220),
  intro: z.string().trim().max(1_000).nullable(),
  body: z.string().trim().max(8_000).nullable(),
  ctaLabel: z.string().trim().max(60).nullable(),
  ctaHref: z.string().trim().max(500).nullable(),
  seoTitle: z.string().trim().max(160).nullable(),
  seoDescription: z.string().trim().max(320).nullable(),
  content: z.record(z.string(), z.unknown()).nullable().optional(),
  isPublished: z.boolean(),
  sortOrder: z.number().int().nonnegative(),
});

// Payload for saving structured Json content of a specific page slug
const pageContentSchema = z.object({
  slug: z
    .string()
    .trim()
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  content: z.record(z.string(), z.unknown()),
});

const requestSchema = z.discriminatedUnion("type", [
  z.object({ type: z.literal("settings"), settings: settingsSchema }),
  z.object({ type: z.literal("page"), page: pageSchema }),
  z.object({
    type: z.literal("page-content"),
    slug: z.string().trim().min(1),
    content: z.record(z.string(), z.unknown()),
  }),
  z.object({ type: z.literal("page-content"), pageContent: pageContentSchema }),
]);

async function isAdmin() {
  const session = await getServerSession(authOptions);
  return session?.user?.role === "admin";
}

function errorResponse(error: unknown, context: string) {
  console.error(`${context}:`, error);

  if (error instanceof ZodError) {
    return NextResponse.json(
      {
        error: "Dados inválidos. Revise os campos informados.",
        details: error.issues,
      },
      { status: 400 },
    );
  }

  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    return NextResponse.json(
      { error: "Não foi possível persistir os dados no banco de dados." },
      { status: 500 },
    );
  }

  return NextResponse.json(
    { error: "Não foi possível concluir a operação. Tente novamente." },
    { status: 500 },
  );
}

export async function GET() {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const [settings, pages] = await prisma.$transaction([
      prisma.configuracaoSite.findUnique({ where: { id: "principal" } }),
      prisma.paginaSite.findMany({ orderBy: { sortOrder: "asc" } }),
    ]);
    return NextResponse.json({ settings, pages });
  } catch (error) {
    return errorResponse(error, "GET /api/admin/conteudo failed");
  }
}

export async function PUT(request: Request) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const payload = requestSchema.parse(await request.json());
    if (payload.type === "settings") {
      const settings = await prisma.configuracaoSite.upsert({
        where: { id: "principal" },
        update: payload.settings,
        create: { id: "principal", ...payload.settings },
      });

      try {
        revalidatePath("/", "layout");
        revalidatePath("/", "page");
      } catch (e) {
        console.error("Revalidate after settings update failed:", e);
      }

      return NextResponse.json({ settings });
    }

    if (payload.type === "page-content") {
      const slug =
        "pageContent" in payload ? payload.pageContent.slug : payload.slug;
      const content =
        "pageContent" in payload
          ? payload.pageContent.content
          : payload.content;
      const page = await prisma.paginaSite.update({
        where: { slug },
        data: { content: content as Prisma.InputJsonValue },
      });
      try {
        if (slug === "home") {
          revalidatePath("/", "page");
        } else {
          revalidatePath(`/${slug}`, "page");
        }
      } catch (e) {
        console.error("Revalidate after page-content update failed:", e);
      }
      return NextResponse.json({ page });
    }

    const { content, ...pageData } = payload.page;
    const normalizedContent =
      content === undefined
        ? undefined
        : content === null
          ? Prisma.JsonNull
          : (content as Prisma.InputJsonValue);

    const page = await prisma.paginaSite.upsert({
      where: { slug: payload.page.slug },
      update: {
        ...pageData,
        ...(normalizedContent === undefined
          ? {}
          : { content: normalizedContent }),
      },
      create: {
        ...pageData,
        ...(normalizedContent === undefined
          ? {}
          : { content: normalizedContent }),
      },
    });

    try {
      // Revalidate home (footer/header) and the page's public route
      revalidatePath("/");
      if (page.slug && page.slug !== "home") revalidatePath(`/${page.slug}`);
    } catch (e) {
      console.error("Revalidate after page update failed:", e);
    }

    return NextResponse.json({ page });
  } catch (error) {
    return errorResponse(error, "PUT /api/admin/conteudo failed");
  }
}
