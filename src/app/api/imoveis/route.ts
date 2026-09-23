import { Prisma } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { ZodError, z } from "zod";
import { authOptions } from "@/lib/auth";
import { findAvailableSlug, nextPropertyCode } from "@/lib/identifiers";
import { prisma } from "@/lib/prisma";
import { getStorageProvider } from "@/lib/storage";

const purposes = ["VENDA", "LOCACAO_ANUAL", "TEMPORADA"] as const;
const statuses = [
  "DISPONIVEL",
  "RESERVADO",
  "EM_NEGOCIACAO",
  "ALUGADO",
  "VENDIDO",
  "INDISPONIVEL",
  "ARQUIVADO",
] as const;
const markers = [
  "DESTAQUE",
  "LANCAMENTO",
  "OPORTUNIDADE",
  "EXCLUSIVIDADE",
  "ALTO_PADRAO",
  "FRENTE_MAR",
  "QUADRA_MAR",
  "ESTUDANTE",
  "PET_FRIENDLY",
] as const;

const optionalText = z.string().trim().max(4_000).optional().nullable();
const optionalAmount = z.number().int().nonnegative().optional().nullable();
const optionalInteger = z.number().int().nonnegative().optional().nullable();
const optionalDate = z.coerce.date().optional().nullable();

const propertyPhotoSchema = z.object({
  url: z.string().trim().min(1),
  alt: z.string().trim().max(500).optional().nullable(),
  position: z.number().int().nonnegative().optional().nullable(),
  isCover: z.boolean().optional().nullable(),
});

const propertyFeaturesSchema = z
  .array(z.string().trim().min(1).max(80))
  .max(30);

const propertyFields = z.object({
  code: z.string().trim().min(3).max(32).optional(),
  slug: z
    .string()
    .trim()
    .min(3)
    .max(180)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
    .optional(),
  title: z.string().trim().min(3).max(160),
  summary: optionalText,
  description: optionalText,
  propertyType: z.string().trim().min(2).max(80),
  purpose: z.enum(purposes),
  status: z.enum(statuses).default("DISPONIVEL"),
  city: z.string().trim().min(2).max(80),
  neighborhood: z.string().trim().max(80).optional().nullable(),
  salePrice: optionalAmount,
  monthlyRent: optionalAmount,
  dailyRate: optionalAmount,
  guestCapacity: z.number().int().positive().optional().nullable(),
  dailyRateConsultation: z.boolean().default(false),
  availabilityStart: optionalDate,
  availabilityEnd: optionalDate,
  availabilityNotes: optionalText,
  bedrooms: optionalInteger,
  suites: optionalInteger,
  bathrooms: optionalInteger,
  parkingSpaces: optionalInteger,
  privateArea: optionalInteger,
  isFeatured: z.boolean().default(false),
  markers: z.array(z.enum(markers)).default([]),
  furnished: z.boolean().default(false),
  hasAirConditioning: z.boolean().default(false),
  hasBarbecue: z.boolean().default(false),
  hasBalcony: z.boolean().default(false),
  seaView: z.boolean().default(false),
  oceanFront: z.boolean().default(false),
  hasElevator: z.boolean().default(false),
  allowsPets: z.boolean().default(false),
  features: propertyFeaturesSchema.optional(),
});

const propertySchema = propertyFields.superRefine((data, ctx) => {
  const priceByPurpose = {
    VENDA: data.salePrice,
    LOCACAO_ANUAL: data.monthlyRent,
    TEMPORADA: data.dailyRate,
  };

  if (priceByPurpose[data.purpose] == null) {
    if (data.purpose === "TEMPORADA" && data.dailyRateConsultation) {
      return;
    }
    ctx.addIssue({
      code: "custom",
      path: ["purpose"],
      message: "Informe o valor principal para a finalidade do imóvel.",
    });
  }

  if (
    data.purpose === "TEMPORADA" &&
    data.availabilityStart &&
    data.availabilityEnd &&
    data.availabilityEnd < data.availabilityStart
  ) {
    ctx.addIssue({
      code: "custom",
      path: ["availabilityEnd"],
      message: "A data final não pode ser anterior à data inicial.",
    });
  }
});

const updateSchema = propertyFields
  .partial()
  .refine((data) => Object.keys(data).length > 0, {
    message: "Informe ao menos um campo para atualizar",
  })
  .superRefine((data, ctx) => {
    if (
      data.purpose === "TEMPORADA" &&
      data.dailyRate == null &&
      data.dailyRateConsultation !== true
    ) {
      ctx.addIssue({
        code: "custom",
        path: ["dailyRate"],
        message: "Informe a diária ou marque a opção sob consulta.",
      });
    }
    if (
      data.availabilityStart &&
      data.availabilityEnd &&
      data.availabilityEnd < data.availabilityStart
    ) {
      ctx.addIssue({
        code: "custom",
        path: ["availabilityEnd"],
        message: "A data final não pode ser anterior à data inicial.",
      });
    }
  });

async function requireAdmin() {
  const session = await getServerSession(authOptions);
  return session?.user?.role === "admin";
}

function errorResponse(error: unknown) {
  if (error instanceof ZodError) {
    return NextResponse.json({ error: error.issues }, { status: 400 });
  }

  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    if (error.code === "P2025") {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    if (error.code === "P2002") {
      return NextResponse.json(
        { error: "Código ou URL amigável já está em uso." },
        { status: 409 },
      );
    }
  }

  // Log error server-side; return a generic 500 to the client to avoid leaking internals
  if (error instanceof Error) {
    console.error("API /api/imoveis internal error:", error);
  }

  return NextResponse.json({ error: "Internal server error" }, { status: 500 });
}

export async function GET(req: Request) {
  const url = new URL(req.url);
  const id = url.searchParams.get("id");
  const purpose = url.searchParams.get("purpose");

  if (id) {
    const item = await prisma.imovel.findUnique({
      where: { id },
      include: { photos: { orderBy: { position: "asc" } } },
    });
    if (!item)
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json(item);
  }

  const list = await prisma.imovel.findMany({
    where: {
      archivedAt: null,
      ...(purposes.includes(purpose as (typeof purposes)[number])
        ? { purpose: purpose as (typeof purposes)[number] }
        : {}),
    },
    orderBy: [{ isFeatured: "desc" }, { createdAt: "desc" }],
    include: {
      photos: {
        orderBy: [{ isCover: "desc" }, { position: "asc" }],
        take: 1,
      },
    },
  });
  return NextResponse.json(list);
}

export async function POST(req: Request) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const data = propertySchema.parse(body);
    const photos = z.array(propertyPhotoSchema).optional().parse(body.photos);
    const slug = await findAvailableSlug(
      data.slug || data.title,
      async (candidate) =>
        Boolean(
          await prisma.imovel.findUnique({
            where: { slug: candidate },
            select: { id: true },
          }),
        ),
    );
    const existingCodes = await prisma.imovel.findMany({
      select: { code: true },
    });
    const nextCode =
      data.code || nextPropertyCode(existingCodes.map((item) => item.code));
    const created = await prisma.$transaction(async (tx) => {
      const property = await tx.imovel.create({
        data: { ...data, code: nextCode, slug },
      });

      if (photos?.length) {
        const coverIndex = photos.findIndex((photo) => photo.isCover === true);
        await tx.foto.createMany({
          data: photos.map((photo, index) => ({
            url: photo.url,
            alt: photo.alt ?? null,
            position: index,
            isCover: index === (coverIndex >= 0 ? coverIndex : 0),
            imovelId: property.id,
          })),
        });
      }

      return property;
    });

    try {
      // on-demand revalidation for home, public listing and individual pages
      revalidatePath("/", "layout");
      revalidatePath("/imoveis");
      if (created.slug) revalidatePath(`/imoveis/${created.slug}`);
      if (created.code) revalidatePath(`/imoveis/${created.code}`);
    } catch (e) {
      console.error("Revalidate after create failed:", e);
    }
    return NextResponse.json(created, { status: 201 });
  } catch (error) {
    console.error("API /api/imoveis POST error:", error);
    return errorResponse(error);
  }
}

export async function PUT(req: Request) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const id = new URL(req.url).searchParams.get("id");
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

  try {
    const body = await req.json();
    const data = updateSchema.parse(body);
    const photos = z.array(propertyPhotoSchema).optional().parse(body.photos);
    // Capture existing photo URLs before the transaction so we can diff later.
    const previousPhotoUrls: string[] =
      photos !== undefined
        ? ((
            await prisma.imovel.findUnique({
              where: { id },
              select: { photos: { select: { url: true } } },
            })
          )?.photos.map((p) => p.url) ?? [])
        : [];
    const updated = await prisma.$transaction(async (tx) => {
      const property = await tx.imovel.update({ where: { id }, data });

      if (photos !== undefined) {
        await tx.foto.deleteMany({ where: { imovelId: id } });
        if (photos.length > 0) {
          const coverIndex = photos.findIndex(
            (photo) => photo.isCover === true,
          );
          await tx.foto.createMany({
            data: photos.map((photo, index) => ({
              url: photo.url,
              alt: photo.alt ?? null,
              position: index,
              isCover: index === (coverIndex >= 0 ? coverIndex : 0),
              imovelId: id,
            })),
          });
        }
      }

      return property;
    });

    // Only delete from storage the photos that were truly removed (not kept).
    if (previousPhotoUrls.length > 0 && photos !== undefined) {
      const keptUrls = new Set(photos.map((p) => p.url));
      const removedUrls = previousPhotoUrls.filter((url) => !keptUrls.has(url));
      if (removedUrls.length > 0) {
        const storage = getStorageProvider();
        const results = await Promise.allSettled(
          removedUrls.map((url) => storage.deleteFile(url)),
        );
        results
          .filter(
            (result): result is PromiseRejectedResult =>
              result.status === "rejected",
          )
          .forEach((result) => {
            console.error(
              "Photo cleanup after property update failed:",
              result.reason,
            );
          });
      }
    }
    try {
      revalidatePath("/", "layout");
      revalidatePath("/imoveis");
      if (updated.slug) revalidatePath(`/imoveis/${updated.slug}`);
      if (updated.code) revalidatePath(`/imoveis/${updated.code}`);
    } catch (e) {
      console.error("Revalidate after update failed:", e);
    }
    return NextResponse.json(updated);
  } catch (error) {
    console.error("API /api/imoveis PUT error:", error);
    return errorResponse(error);
  }
}

export async function DELETE(req: Request) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const id = new URL(req.url).searchParams.get("id");
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

  try {
    const archived = await prisma.imovel.update({
      where: { id },
      data: { archivedAt: new Date(), status: "ARQUIVADO", isFeatured: false },
    });
    try {
      revalidatePath("/", "layout");
      revalidatePath("/imoveis");
      if (archived.slug) revalidatePath(`/imoveis/${archived.slug}`);
      if (archived.code) revalidatePath(`/imoveis/${archived.code}`);
    } catch (e) {
      console.error("Revalidate after archive failed:", e);
    }
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("API /api/imoveis DELETE error:", error);
    return errorResponse(error);
  }
}
