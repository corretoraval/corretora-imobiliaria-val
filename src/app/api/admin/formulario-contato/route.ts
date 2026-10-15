import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { z } from "zod";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

async function isAdmin() {
  const session = await getServerSession(authOptions);
  return session?.user?.role === "admin";
}

const defaultFormTexts = {
  formTitle: "Envie uma Mensagem",
  formSubtitle:
    "Preencha o formulário abaixo e eu entrarei em contato diretamente com a orientação certa para o que você precisa.",
  formButtonText: "Enviar Mensagem",
  formSuccessMessage:
    "Obrigada pelo contato! Retornarei sua mensagem o mais breve possível.",
};

const updateTextsSchema = z.object({
  formTitle: z.string().trim().min(2).max(120),
  formSubtitle: z.string().trim().max(300).optional().nullable(),
  formButtonText: z.string().trim().min(2).max(60),
  formSuccessMessage: z.string().trim().min(5).max(300),
});

const saveFieldSchema = z.object({
  id: z.string().optional(),
  name: z
    .string()
    .trim()
    .min(2)
    .max(50)
    .regex(/^[a-zA-Z0-9_]+$/, "Identificador técnico deve conter apenas letras, números e underline"),
  label: z.string().trim().min(2).max(100),
  type: z.enum(["text", "email", "tel", "textarea", "select"]),
  required: z.boolean(),
  placeholder: z.string().trim().max(120).optional().nullable(),
  options: z.string().trim().max(500).optional().nullable(),
  order: z.number().int().nonnegative(),
  isActive: z.boolean(),
  isProtected: z.boolean().optional(),
});

// GET /api/admin/formulario-contato
export async function GET() {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const [fields, contatoPage] = await Promise.all([
      prisma.campoContato.findMany({ orderBy: { order: "asc" } }),
      prisma.paginaSite.findUnique({
        where: { slug: "contato" },
        select: { content: true },
      }),
    ]);

    const pageContent = (contatoPage?.content ?? {}) as Record<string, unknown>;
    const texts = {
      formTitle: (pageContent.formTitle as string) || defaultFormTexts.formTitle,
      formSubtitle:
        pageContent.formSubtitle !== undefined
          ? (pageContent.formSubtitle as string)
          : defaultFormTexts.formSubtitle,
      formButtonText:
        (pageContent.formButtonText as string) || defaultFormTexts.formButtonText,
      formSuccessMessage:
        (pageContent.formSuccessMessage as string) ||
        defaultFormTexts.formSuccessMessage,
    };

    return NextResponse.json({ fields, texts });
  } catch (error) {
    console.error("GET /api/admin/formulario-contato error:", error);
    return NextResponse.json({ error: "Erro ao carregar dados do formulário." }, { status: 500 });
  }
}

// PUT /api/admin/formulario-contato
// Atualiza os textos ou reordena/atualiza a lista completa de campos
export async function PUT(request: Request) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = (await request.json()) as {
      texts?: unknown;
      fields?: unknown;
    };

    // 1. Atualização dos textos do formulário
    if (body.texts) {
      const parsedTexts = updateTextsSchema.parse(body.texts);
      const existingPage = await prisma.paginaSite.findUnique({
        where: { slug: "contato" },
      });

      const currentContent = (existingPage?.content ?? {}) as Record<string, unknown>;
      const updatedContent = {
        ...currentContent,
        ...parsedTexts,
      };

      await prisma.paginaSite.upsert({
        where: { slug: "contato" },
        update: { content: updatedContent },
        create: {
          slug: "contato",
          navigationLabel: "Contato",
          title: "Contato",
          heading: "Encontre a orientação certa para o seu imóvel.",
          content: updatedContent,
        },
      });
    }

    // 2. Atualização dos campos (reordenação / CRUD em lote)
    if (body.fields && Array.isArray(body.fields)) {
      const parsedFields = z.array(saveFieldSchema).parse(body.fields);

      // Validação de segurança: campos protegidos
      const nameField = parsedFields.find((f) => f.name === "name");
      if (!nameField?.isActive || !nameField.required) {
        return NextResponse.json(
          { error: "O campo 'Nome completo' é obrigatório e não pode ser desativado." },
          { status: 400 },
        );
      }

      const emailField = parsedFields.find((f) => f.name === "email");
      const phoneField = parsedFields.find((f) => f.name === "phone");
      const hasActiveContactMethod =
        (emailField?.isActive && emailField?.required) ||
        (phoneField?.isActive && phoneField?.required);

      if (!hasActiveContactMethod) {
        return NextResponse.json(
          {
            error:
              "Ao menos um meio de retorno ('E-mail' ou 'Telefone / WhatsApp') deve permanecer ativo e obrigatório.",
          },
          { status: 400 },
        );
      }

      // Upsert / sync fields
      await prisma.$transaction(
        parsedFields.map((f, index) =>
          prisma.campoContato.upsert({
            where: { name: f.name },
            update: {
              label: f.label,
              type: f.type,
              required: f.required,
              placeholder: f.placeholder ?? null,
              options: f.options ?? null,
              order: index,
              isActive: f.isActive,
              isProtected: f.name === "name" || f.name === "email" || f.name === "phone",
            },
            create: {
              name: f.name,
              label: f.label,
              type: f.type,
              required: f.required,
              placeholder: f.placeholder ?? null,
              options: f.options ?? null,
              order: index,
              isActive: f.isActive,
              isProtected: f.name === "name" || f.name === "email" || f.name === "phone",
            },
          }),
        ),
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("PUT /api/admin/formulario-contato error:", error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Dados inválidos.", details: error.issues },
        { status: 400 },
      );
    }
    return NextResponse.json({ error: "Erro ao salvar formulário." }, { status: 500 });
  }
}

// DELETE /api/admin/formulario-contato?id=xxx
export async function DELETE(request: Request) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");

  if (!id) {
    return NextResponse.json({ error: "ID não informado." }, { status: 400 });
  }

  const campo = await prisma.campoContato.findUnique({ where: { id } });
  if (!campo) {
    return NextResponse.json({ error: "Campo não encontrado." }, { status: 404 });
  }

  if (campo.isProtected || campo.name === "name" || campo.name === "email" || campo.name === "phone") {
    return NextResponse.json(
      { error: "Campos protegidos não podem ser excluídos." },
      { status: 400 },
    );
  }

  await prisma.campoContato.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
