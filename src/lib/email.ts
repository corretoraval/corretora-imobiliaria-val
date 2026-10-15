/**
 * Módulo de envio de e-mail via Resend.
 *
 * Variável de ambiente obrigatória: RESEND_API_KEY
 * Remetente: noreply@corretoraval.com.br (após verificação do domínio no Resend)
 * Remetente de fallback: onboarding@resend.dev (sandbox — só entrega para o dono da conta)
 */
import { Resend } from "resend";

const RESEND_API_KEY = process.env.RESEND_API_KEY;

// Remetente verificado no Resend. Enquanto o domínio não estiver verificado,
// use "onboarding@resend.dev" (sandbox — só entrega para a conta do Resend).
// Após verificar corretoraval.com.br no painel do Resend, altere para:
// "noreply@corretoraval.com.br"
const FROM_ADDRESS =
  process.env.RESEND_FROM_EMAIL ??
  process.env.EMAIL_FROM ??
  "Corretora Val <onboarding@resend.dev>";

export function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

export function sanitizeHeader(str: string): string {
  return str.replace(/[\r\n]+/g, " ").trim();
}

export type ContactEmailPayload = {
  to: string; // destinatário (contactEmail da ConfiguracaoSite)
  replyTo: string; // e-mail do cliente
  clientName: string;
  clientEmail: string;
  clientPhone: string;
  subject?: string | null;
  message?: string | null;
  propertyAddress?: string | null;
  propertyType?: string | null;
  type: string; // TipoLead
  leadId: string;
  createdAt: Date;
  customFields?: Record<string, unknown> | null;
};

export type SendResult =
  | { ok: true; messageId: string }
  | { ok: false; error: string };

/**
 * Envia o e-mail de notificação de novo lead para o endereço configurado no admin.
 * Retorna `{ ok: true }` em caso de sucesso ou `{ ok: false, error }` em caso de falha,
 * nunca lança exceção (para não impedir o salvamento do lead).
 */
export async function sendContactNotification(
  payload: ContactEmailPayload,
): Promise<SendResult> {
  if (!RESEND_API_KEY) {
    return { ok: false, error: "RESEND_API_KEY não configurada no servidor." };
  }

  const resend = new Resend(RESEND_API_KEY);

  const typeLabel: Record<string, string> = {
    CONTATO: "Contato geral",
    ANUNCIAR: "Quer anunciar imóvel",
    ALUGAR: "Busca imóvel para alugar",
    COMPRAR: "Busca imóvel para comprar",
  };

  const fields: { label: string; value: string | null | undefined }[] = [
    { label: "Nome", value: payload.clientName },
    { label: "E-mail", value: payload.clientEmail },
    { label: "Telefone/WhatsApp", value: payload.clientPhone },
    { label: "Assunto", value: payload.subject },
    { label: "Mensagem", value: payload.message },
    { label: "Imóvel de interesse", value: payload.propertyAddress },
    { label: "Tipo de imóvel", value: payload.propertyType },
    {
      label: "Tipo de solicitação",
      value: typeLabel[payload.type] ?? payload.type,
    },
  ];

  if (payload.customFields && typeof payload.customFields === "object") {
    for (const [key, val] of Object.entries(payload.customFields)) {
      if (val !== null && val !== undefined && val !== "") {
        fields.push({ label: key, value: String(val) });
      }
    }
  }

  const fieldsHtml = fields
    .filter((f) => f.value)
    .map(
      (f) => `
      <tr>
        <td style="padding:8px 12px;font-size:13px;font-weight:700;color:#35104f;background:#f8f5ef;border-bottom:1px solid #e8e3d9;white-space:nowrap;vertical-align:top;">${escapeHtml(f.label)}</td>
        <td style="padding:8px 12px;font-size:13px;color:#3d3530;background:#ffffff;border-bottom:1px solid #e8e3d9;word-break:break-word;">${escapeHtml(String(f.value))}</td>
      </tr>`,
    )
    .join("");

  const dataFormatada = new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "full",
    timeStyle: "short",
    timeZone: "America/Sao_Paulo",
  }).format(payload.createdAt);

  const cleanName = sanitizeHeader(payload.clientName);
  const cleanReplyTo = sanitizeHeader(payload.replyTo);
  const cleanSubject = payload.subject ? sanitizeHeader(payload.subject) : null;

  const html = `
<!DOCTYPE html>
<html lang="pt-BR">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f0ede6;font-family:'Segoe UI',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f0ede6;padding:32px 16px;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(53,16,79,0.10);">
        <!-- Header -->
        <tr>
          <td style="background:linear-gradient(135deg,#35104f 0%,#4a1768 100%);padding:28px 32px;">
            <p style="margin:0;font-size:11px;font-weight:700;letter-spacing:0.14em;color:#d8bd82;text-transform:uppercase;">Nova mensagem recebida</p>
            <h1 style="margin:6px 0 0;font-size:22px;font-weight:700;color:#ffffff;">Corretora Val</h1>
          </td>
        </tr>
        <!-- Body -->
        <tr>
          <td style="padding:28px 32px 8px;">
            <p style="margin:0 0 20px;font-size:14px;color:#6b6460;">Recebida em ${dataFormatada}</p>
            <table width="100%" cellpadding="0" cellspacing="0" style="border-radius:10px;overflow:hidden;border:1px solid #e8e3d9;">
              ${fieldsHtml}
            </table>
          </td>
        </tr>
        <!-- CTA -->
        <tr>
          <td style="padding:24px 32px 32px;">
            <a href="mailto:${cleanReplyTo}"
               style="display:inline-block;background:#35104f;color:#ffffff;font-size:13px;font-weight:700;padding:12px 24px;border-radius:50px;text-decoration:none;">
              Responder para ${escapeHtml(cleanName)}
            </a>
            <p style="margin:16px 0 0;font-size:11px;color:#9e9892;">
              ID do lead: ${escapeHtml(payload.leadId)} · Este e-mail foi gerado automaticamente pelo site Corretora Val.
            </p>
          </td>
        </tr>
        <!-- Footer -->
        <tr>
          <td style="background:#f8f5ef;padding:16px 32px;border-top:1px solid #e8e3d9;">
            <p style="margin:0;font-size:11px;color:#b8b4ae;">Corretora Val · CRECI/SC 56372-F · Balneário Camboriú — SC</p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;

  const subjectLine = cleanSubject
    ? `Nova mensagem: ${cleanSubject}`
    : `Nova mensagem de ${cleanName}`;

  try {
    const { data, error } = await resend.emails.send({
      from: FROM_ADDRESS,
      to: [payload.to],
      replyTo: cleanReplyTo,
      subject: subjectLine,
      html,
    });

    if (error) {
      return { ok: false, error: error.message ?? JSON.stringify(error) };
    }

    return { ok: true, messageId: data?.id ?? "" };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return { ok: false, error: message };
  }
}

/**
 * Envia um e-mail de teste para confirmar que a integração está funcionando.
 */
export async function sendTestEmail(to: string): Promise<SendResult> {
  if (!RESEND_API_KEY) {
    return { ok: false, error: "RESEND_API_KEY não configurada no servidor." };
  }

  const resend = new Resend(RESEND_API_KEY);

  try {
    const { data, error } = await resend.emails.send({
      from: FROM_ADDRESS,
      to: [to],
      subject: "Teste de e-mail · Corretora Val",
      html: `
        <div style="font-family:sans-serif;padding:32px;max-width:480px;margin:0 auto;">
          <h2 style="color:#35104f;">Teste bem-sucedido! ✅</h2>
          <p style="color:#3d3530;">O envio de e-mails está configurado corretamente.<br>
          Os formulários de contato do site irão entregar mensagens para este endereço.</p>
          <p style="color:#9e9892;font-size:12px;">Corretora Val · CRECI/SC 56372-F</p>
        </div>`,
    });

    if (error) {
      return { ok: false, error: error.message ?? JSON.stringify(error) };
    }

    return { ok: true, messageId: data?.id ?? "" };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return { ok: false, error: message };
  }
}
