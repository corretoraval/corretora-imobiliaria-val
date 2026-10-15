import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const defaultCampos = [
  {
    id: "campo_nome",
    name: "name",
    label: "Nome completo",
    type: "text",
    required: true,
    placeholder: "Seu nome completo",
    options: null,
    order: 0,
    isActive: true,
    isProtected: true,
  },
  {
    id: "campo_email",
    name: "email",
    label: "E-mail",
    type: "email",
    required: true,
    placeholder: "seu@email.com",
    options: null,
    order: 1,
    isActive: true,
    isProtected: true,
  },
  {
    id: "campo_phone",
    name: "phone",
    label: "Telefone / WhatsApp",
    type: "tel",
    required: true,
    placeholder: "(47) 99999-9999",
    options: null,
    order: 2,
    isActive: true,
    isProtected: true,
  },
  {
    id: "campo_subject",
    name: "subject",
    label: "Assunto",
    type: "text",
    required: false,
    placeholder: "Sobre o que gostaria de conversar?",
    options: null,
    order: 3,
    isActive: true,
    isProtected: false,
  },
  {
    id: "campo_message",
    name: "message",
    label: "Mensagem",
    type: "textarea",
    required: false,
    placeholder: "Escreva sua mensagem aqui...",
    options: null,
    order: 4,
    isActive: true,
    isProtected: false,
  },
];

const defaultFormTexts = {
  formTitle: "Envie uma Mensagem",
  formSubtitle:
    "Preencha o formulário abaixo e eu entrarei em contato diretamente com a orientação certa para o que você precisa.",
  formButtonText: "Enviar Mensagem",
  formSuccessMessage:
    "Obrigada pelo contato! Retornarei sua mensagem o mais breve possível.",
};

// GET /api/formulario-contato
// Rota pública para obter os campos ativos e textos configurados
export async function GET() {
  try {
    const [fieldsFromDb, contatoPage, siteSettings] = await Promise.all([
      prisma.campoContato.findMany({
        where: { isActive: true },
        orderBy: { order: "asc" },
      }),
      prisma.paginaSite.findUnique({
        where: { slug: "contato" },
        select: { content: true },
      }),
      prisma.configuracaoSite.findUnique({
        where: { id: "principal" },
        select: { contactEmail: true, whatsapp: true },
      }),
    ]);

    const fields = fieldsFromDb.length > 0 ? fieldsFromDb : defaultCampos;
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

    return NextResponse.json({
      fields,
      texts,
      isConfigured: Boolean(siteSettings?.contactEmail),
      whatsapp: siteSettings?.whatsapp ?? null,
    });
  } catch (error) {
    console.error("GET /api/formulario-contato error:", error);
    return NextResponse.json({
      fields: defaultCampos,
      texts: defaultFormTexts,
      isConfigured: false,
      whatsapp: null,
    });
  }
}
