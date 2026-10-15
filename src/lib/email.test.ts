import { describe, expect, it } from "vitest";
import { escapeHtml, sanitizeHeader } from "./email";

describe("email utilities", () => {
  describe("escapeHtml", () => {
    it("escapa caracteres especiais HTML prevenindo injeção de scripts", () => {
      const malicious = '<script>alert("XSS")</script> & "quotes" \'single\'';
      const escaped = escapeHtml(malicious);
      expect(escaped).not.toContain("<script>");
      expect(escaped).toContain("&lt;script&gt;");
      expect(escaped).toContain("&amp;");
      expect(escaped).toContain("&quot;quotes&quot;");
      expect(escaped).toContain("&#039;single&#039;");
    });

    it("mantém texto inofensivo inalterado", () => {
      expect(escapeHtml("Olá, Corretora Val!")).toBe("Olá, Corretora Val!");
    });
  });

  describe("sanitizeHeader", () => {
    it("remove quebras de linha CRLF para impedir injeção de cabeçalhos de e-mail", () => {
      const headerWithCRLF = "Assunto Normal\r\nBcc: hacker@example.com\r\nSubject: Injected";
      const sanitized = sanitizeHeader(headerWithCRLF);
      expect(sanitized).not.toContain("\r");
      expect(sanitized).not.toContain("\n");
      expect(sanitized).toBe("Assunto Normal Bcc: hacker@example.com Subject: Injected");
    });
  });
});
