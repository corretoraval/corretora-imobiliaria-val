import sanitizeHtml from "sanitize-html";

/**
 * Sanitiza o conteúdo HTML de artigos do blog gerados pelo editor visual (Tiptap).
 * Remove scripts, event handlers inline e tags maliciosas, preservando a formatação rica.
 */
export function sanitizeBlogPostContent(html: string): string {
  return sanitizeHtml(html, {
    allowedTags: [
      "h2",
      "h3",
      "p",
      "strong",
      "em",
      "s",
      "u",
      "ul",
      "ol",
      "li",
      "blockquote",
      "hr",
      "a",
      "img",
      "br",
    ],
    allowedAttributes: {
      a: ["href", "target", "rel", "title", "class"],
      img: ["src", "alt", "title", "class"],
    },
    allowedSchemes: ["http", "https", "mailto", "tel"],
    allowProtocolRelative: false,
  });
}
