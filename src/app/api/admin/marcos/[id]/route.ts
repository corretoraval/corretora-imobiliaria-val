import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { getServerSession } from "next-auth/next";
import { ZodError, z } from "zod";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const schema = z.object({
  year: z.coerce.number().int().min(1900).max(2100),
  title: z.string().trim().min(1).max(150),
  description: z.string().trim().max(2000).nullable().optional(),
  sortOrder: z.coerce.number().int().default(0),
});

async function isAdmin() {
  const session = await getServerSession(authOptions);
  return session?.user?.role === "admin";
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!(await isAdmin()))
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { id } = await params;
    const data = schema.parse(await request.json());
    const item = await prisma.marcoHistorico.update({
      where: { id },
      data: {
        year: data.year,
        title: data.title,
        description: data.description ?? null,
        sortOrder: data.sortOrder,
      },
    });
    revalidatePath("/memoria-viva");
    revalidatePath("/admin/conteudo");
    return NextResponse.json({ item });
  } catch (error) {
    if (error instanceof ZodError)
      return NextResponse.json({ error: error.issues }, { status: 400 });
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!(await isAdmin()))
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  await prisma.marcoHistorico.delete({ where: { id } });
  revalidatePath("/memoria-viva");
  revalidatePath("/admin/conteudo");
  return NextResponse.json({ ok: true });
}
