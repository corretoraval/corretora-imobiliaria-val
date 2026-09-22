import { Prisma } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getStorageProvider } from "@/lib/storage";

async function requireAdmin() {
  const session = await getServerSession(authOptions);
  return session?.user?.role === "admin";
}

/**
 * DELETE /api/imoveis/[id]
 * Hard delete: removes the property record AND all associated photo files.
 * Irreversible. Protected by requireAdmin.
 */
export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  try {
    // 1. Fetch photos before deleting so we can remove files
    const imovel = await prisma.imovel.findUnique({
      where: { id },
      include: { photos: true },
    });

    if (!imovel) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const slug = imovel.slug;

    // 2. Delete physical files (best-effort — do not fail if file missing)
    // Foto.url looks like "/uploads/filename.jpg" — strip the prefix to get the
    // relative path that LocalStorageProvider expects.
    if (imovel.photos.length > 0) {
      const storage = getStorageProvider();
      await Promise.allSettled(
        imovel.photos.map((p) => storage.deleteFile(p.url)),
      );
    }

    // 3. Hard delete record (cascades to Foto via Prisma schema)
    await prisma.imovel.delete({ where: { id } });

    // 4. On-demand revalidation
    try {
      revalidatePath("/imoveis");
      if (slug) revalidatePath(`/imoveis/${slug}`);
    } catch (e) {
      console.error("Revalidate after hard delete failed:", e);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2025"
    ) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    console.error("API /api/imoveis/[id] DELETE error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
