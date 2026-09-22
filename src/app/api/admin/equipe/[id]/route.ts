import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { getServerSession } from "next-auth/next";
import { ZodError, z } from "zod";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const schema = z.object({
  name: z.string().trim().min(2).max(100),
  role: z.string().trim().min(2).max(100),
  bio: z.string().trim().max(1000).nullable().optional(),
  photoUrl: z.string().trim().max(500).nullable().optional(),
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
    const item = await prisma.membroEquipe.update({
      where: { id },
      data: {
        name: data.name,
        role: data.role,
        bio: data.bio ?? null,
        photoUrl: data.photoUrl ?? null,
        sortOrder: data.sortOrder,
      },
    });
    revalidatePath("/quem-somos");
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
  await prisma.membroEquipe.delete({ where: { id } });
  revalidatePath("/quem-somos");
  revalidatePath("/admin/conteudo");
  return NextResponse.json({ ok: true });
}
