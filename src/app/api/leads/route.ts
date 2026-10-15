import { Prisma, TipoLead } from "@prisma/client";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendContactNotification } from "@/lib/email";

// ── Constantes de rate-limit ──────────────────────────────────────────────────
const RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000; // 10 minutos
const RATE_LIMIT_MAX = 3; // máximo de leads por IP na janela

// ── Helper: IP do cliente ─────────────────────────────────────────────────────
async function getClientIp(): Promise<string> {
  const h = await headers();
  return (
    h.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    h.get("x-real-ip") ??
    "unknown"
  );
}

// ── Validação básica de e-mail (sem regex exótico) ────────────────────────────
function isValidEmail(value: unknown): value is string {
  return (
    typeof value === "string" && value.includes("@") && value.includes(".")
  );
}

export async function POST(request: Request) {
  try {
    // ── 1. Parse e saneamento do body ─────────────────────────────────────────
    let body: Record<string, unknown>;
    try {
      body = (await request.json()) as Record<string, unknown>;
    } catch {
      return NextResponse.json(
        { error: "Requisição inválida." },
        { status: 400 },
      );
    }

    const name = typeof body.name === "string" ? body.name : "";
    const email = typeof body.email === "string" ? body.email : "";
    const phone = typeof body.phone === "string" ? body.phone : "";
    const type = typeof body.type === "string" ? body.type : undefined;
    const subject = typeof body.subject === "string" ? body.subject : undefined;
    const message = typeof body.message === "string" ? body.message : undefined;
    const propertyAddress =
      typeof body.propertyAddress === "string" ? body.propertyAddress : undefined;
    const propertyType =
      typeof body.propertyType === "string" ? body.propertyType : undefined;

    // ── 2. Honeypot com detecção de spam e gravação segura ───────────────────
    const honeypotVal = (body.contact_security_token ?? body.website) as
      | string
      | undefined;

    if (honeypotVal && honeypotVal.trim() !== "") {
      const ipAddress = await getClientIp();
      await prisma.lead.create({
        data: {
          name: name.trim() ? name.trim() : "Spam Bot",
          email: email.trim() ? email.trim().toLowerCase() : "spam@detected.local",
          phone: phone.trim() ? phone.trim() : "000000000",
          type: TipoLead.CONTATO,
          subject: subject?.trim() || null,
          message: message?.trim() || null,
          propertyAddress: propertyAddress?.trim() || null,
          propertyType: propertyType?.trim() || null,
          ipAddress,
          emailStatus: "spam",
          emailError: "Tentativa de spam bloqueada via honeypot.",
          isRead: true, // Não conta no contador de mensagens pendentes/não lidas
        },
      });

      return NextResponse.json(
        {
          success: true,
          message: "Mensagem enviada com sucesso! Entraremos em contato em breve.",
        },
        { status: 201 },
      );
    }

    // ── 3. Validação dos campos ───────────────────────────────────────────────
    const leadType = Object.values(TipoLead).includes(type as TipoLead)
      ? (type as TipoLead)
      : TipoLead.CONTATO;

    // A validação de campos configuráveis no admin aplica-se EXCLUSIVAMENTE
    // quando o envio se identifica explicitamente com source: "contato-page".
    // Formulários de imóvel (property-lead-form) e proprietário (property-owner-form)
    // possuem seus próprios campos e não dependem do formulário geral.
    const isContactPage = body.source === "contato-page";

    const activeFields = await prisma.campoContato.findMany({
      where: { isActive: true },
      orderBy: { order: "asc" },
    });

    const knownKeys = new Set([
      "name",
      "email",
      "phone",
      "subject",
      "message",
      "propertyAddress",
      "propertyType",
      "type",
      "source",
      "website",
      "contact_security_token",
    ]);

    const customFields: Record<string, unknown> = {};
    for (const [key, val] of Object.entries(body)) {
      if (!knownKeys.has(key) && val !== undefined && val !== null && val !== "") {
        customFields[key] = val;
      }
    }

    if (isContactPage && activeFields.length > 0) {
      for (const field of activeFields) {
        const val = body[field.name];
        if (field.required) {
          if (val === undefined || val === null || String(val).trim() === "") {
            return NextResponse.json(
              { error: `O campo '${field.label}' é obrigatório.` },
              { status: 400 },
            );
          }
        }
        if (val !== undefined && val !== null && String(val).trim() !== "") {
          if (field.type === "email" && !isValidEmail(val)) {
            return NextResponse.json(
              { error: `Por favor, insira um e-mail válido no campo '${field.label}'.` },
              { status: 400 },
            );
          }
        }
      }
    } else if (isContactPage) {
      // Fallback padrão se não houver campos no banco para a página de contato
      if (!name?.trim() || !isValidEmail(email) || !phone?.trim()) {
        return NextResponse.json(
          { error: "Nome, e-mail válido e telefone são obrigatórios." },
          { status: 400 },
        );
      }
    }

    // Regra invariante para QUALQUER formulário (contato, imóvel, proprietário):
    // Nome e ao menos um canal de retorno válido são estritamente obrigatórios.
    if (!name.trim()) {
      return NextResponse.json(
        { error: "O nome é obrigatório." },
        { status: 400 },
      );
    }
    const hasEmail = Boolean(email && isValidEmail(email));
    const hasPhone = Boolean(phone && phone.trim().length >= 6);
    if (!hasEmail && !hasPhone) {
      return NextResponse.json(
        { error: "Informe ao menos um meio de contato válido (e-mail ou telefone)." },
        { status: 400 },
      );
    }

    // ── 4. Rate-limit por IP (via banco) ──────────────────────────────────────
    const ipAddress = await getClientIp();
    if (ipAddress !== "unknown") {
      const windowStart = new Date(Date.now() - RATE_LIMIT_WINDOW_MS);
      const recentCount = await prisma.lead.count({
        where: { ipAddress, createdAt: { gte: windowStart } },
      });
      if (recentCount >= RATE_LIMIT_MAX) {
        return NextResponse.json(
          { error: "Muitas mensagens enviadas. Aguarde alguns minutos e tente novamente." },
          { status: 429 },
        );
      }
    }

    // ── 5. Lê o e-mail de destino (contactEmail) do banco ────────────────────
    const siteConfig = await prisma.configuracaoSite.findUnique({
      where: { id: "principal" },
      select: { contactEmail: true, whatsapp: true },
    });
    const contactEmail = siteConfig?.contactEmail ?? null;
    const whatsapp = siteConfig?.whatsapp ?? null;

    // ── 6. Salva o lead ANTES de qualquer tentativa de e-mail ─────────────────
    const lead = await prisma.lead.create({
      data: {
        name: name.trim(),
        email: email ? email.trim().toLowerCase() : "",
        phone: phone ? phone.trim() : "",
        type: leadType,
        subject: subject?.trim() || null,
        message: message?.trim() || null,
        propertyAddress: propertyAddress?.trim() || null,
        propertyType: propertyType?.trim() || null,
        ipAddress,
        customFields:
          Object.keys(customFields).length > 0
            ? (customFields as Prisma.InputJsonValue)
            : Prisma.JsonNull,
        emailStatus: contactEmail ? "pending" : "no_config",
      },
    });

    // ── 7. Se não há contactEmail configurado, retorna com aviso de WhatsApp ──
    if (!contactEmail) {
      console.warn(`[leads] contactEmail não configurado. Lead ${lead.id} salvo sem e-mail.`);
      return NextResponse.json(
        {
          success: true,
          savedOnly: true,
          leadId: lead.id,
          whatsapp,
          message:
            "Recebemos sua mensagem! A Corretora Val entrará em contato em breve. Se preferir atendimento imediato, fale pelo WhatsApp.",
        },
        { status: 201 },
      );
    }

    // ── 8. Tenta enviar o e-mail ──────────────────────────────────────────────
    const result = await sendContactNotification({
      to: contactEmail,
      replyTo: email ? email.trim().toLowerCase() : contactEmail,
      clientName: name.trim(),
      clientEmail: email ? email.trim().toLowerCase() : "não informado",
      clientPhone: phone ? phone.trim() : "não informado",
      subject: subject?.trim() || null,
      message: message?.trim() || null,
      propertyAddress: propertyAddress?.trim() || null,
      propertyType: propertyType?.trim() || null,
      type: leadType,
      leadId: lead.id,
      createdAt: lead.createdAt,
      customFields: Object.keys(customFields).length > 0 ? customFields : null,
    });

    // ── 9. Atualiza o status do lead com resultado do envio ───────────────────
    if (result.ok) {
      await prisma.lead.update({
        where: { id: lead.id },
        data: { emailStatus: "sent" },
      });

      return NextResponse.json(
        {
          success: true,
          leadId: lead.id,
          message: "Mensagem enviada com sucesso! Entraremos em contato em breve.",
        },
        { status: 201 },
      );
    }

    // Envio falhou — lead já está salvo, atualiza com erro
    const errorMsg = result.error;
    await prisma.lead.update({
      where: { id: lead.id },
      data: { emailStatus: "failed", emailError: errorMsg },
    });
    console.error(`[leads] Falha no envio de e-mail para lead ${lead.id}:`, errorMsg);

    return NextResponse.json(
      {
        success: true,
        emailFailed: true,
        savedOnly: true,
        leadId: lead.id,
        whatsapp,
        message:
          "Recebemos sua mensagem! A Corretora Val entrará em contato em breve. Se preferir atendimento imediato, fale pelo WhatsApp.",
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("[leads] Erro interno:", error);
    return NextResponse.json(
      { error: "Ocorreu um erro interno ao enviar sua mensagem. Tente novamente." },
      { status: 500 },
    );
  }
}
