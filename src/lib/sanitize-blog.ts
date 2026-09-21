import DOMPurify from "isomorphic-dompurify";

/**
 * Sanitiza o conteúdo HTML de artigos do blog gerados pelo editor visual (Tiptap).
 * Remove scripts, event handlers inline e tags maliciosas, preservando a formatação rica.
 */
export function sanitizeBlogPostContent(html: string): string {
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: [
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
    ALLOWED_ATTR: ["href", "target", "rel", "src", "alt", "title", "class"],
    ALLOWED_URI_REGEXP:
      /^(?:(?:(?:f|ht)tps?|mailto|tel):|[^a-z]|[a-z+.-]+(?:[^a-z+.-:]|$))/i,
  });
}
