"use client";

import ImageExtension from "@tiptap/extension-image";
import LinkExtension from "@tiptap/extension-link";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import {
  Bold,
  Heading2,
  Heading3,
  ImageIcon,
  Italic,
  Link2,
  List,
  ListOrdered,
  LoaderCircle,
  Minus,
  Quote,
  Redo,
  Strikethrough,
  Undo,
  Unlink,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { uploadFile } from "@/lib/upload-file";

type BlogEditorProps = {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
};

export function BlogEditor({ value, onChange }: BlogEditorProps) {
  const [uploadingImage, setUploadingImage] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const editor = useEditor({
    extensions: [
      StarterKit,
      LinkExtension.configure({
        openOnClick: false,
        HTMLAttributes: {
          target: "_blank",
          rel: "noopener noreferrer",
          class:
            "text-[var(--plum)] underline font-semibold hover:text-[var(--gold)]",
        },
      }),
      ImageExtension.configure({
        inline: false,
        HTMLAttributes: {
          class:
            "rounded-xl border border-[var(--border,#d4cec4)] my-4 max-w-full h-auto shadow-xs",
        },
      }),
    ],
    content: value,
    immediatelyRender: false,
    editorProps: {
      attributes: {
        class:
          "min-h-[280px] max-h-[480px] overflow-y-auto p-4 focus:outline-none text-[var(--ink)] leading-relaxed prose prose-plum max-w-none [&_h2]:text-xl [&_h2]:font-bold [&_h2]:text-[var(--plum)] [&_h2]:mt-4 [&_h2]:mb-2 [&_h3]:text-lg [&_h3]:font-bold [&_h3]:text-[var(--plum)] [&_h3]:mt-3 [&_h3]:mb-1 [&_p]:text-sm [&_p]:leading-relaxed [&_p]:mb-3 [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:mb-3 [&_ol]:list-decimal [&_ol]:pl-5 [&_ol]:mb-3 [&_blockquote]:border-l-4 [&_blockquote]:border-[var(--gold)] [&_blockquote]:pl-3 [&_blockquote]:italic [&_blockquote]:mb-3 [&_hr]:my-4 [&_hr]:border-[var(--border,#d4cec4)] [&_img]:rounded-xl [&_img]:border [&_img]:my-3",
      },
    },
    onUpdate: ({ editor: ed }) => {
      onChange(ed.getHTML());
    },
  });

  useEffect(() => {
    if (editor && editor.getHTML() !== value) {
      editor.commands.setContent(value || "");
    }
  }, [value, editor]);

  const handleSetLink = () => {
    if (!editor) return;
    const previousUrl = editor.getAttributes("link").href || "";
    const url = window.prompt(
      "Digite ou cole a URL do link (ex: https://exemplo.com):",
      previousUrl,
    );

    if (url === null) return;
    if (url.trim() === "") {
      editor.chain().focus().unsetLink().run();
      return;
    }

    const trimmed = url.trim();
    const validUrl =
      trimmed.startsWith("http://") ||
      trimmed.startsWith("https://") ||
      trimmed.startsWith("mailto:") ||
      trimmed.startsWith("tel:")
        ? trimmed
        : `https://${trimmed}`;

    editor.chain().focus().setLink({ href: validUrl }).run();
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!editor) return;
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploadingImage(true);
      const uploaded = await uploadFile(file);
      editor
        .chain()
        .focus()
        .setImage({ src: uploaded.url, alt: file.name })
        .run();
    } catch (err) {
      console.error("Erro no upload de imagem:", err);
      alert("Erro na conexão durante upload da imagem.");
    } finally {
      setUploadingImage(false);
      e.target.value = "";
    }
  };

  if (!editor) {
    return (
      <div className="h-[280px] rounded-xl border border-[var(--border,#d4cec4)] bg-[var(--surface-muted)] flex items-center justify-center text-sm text-[var(--ink-soft)]">
        Carregando editor...
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-[var(--border,#d4cec4)] bg-white overflow-hidden shadow-xs">
      {/* Hidden image file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        disabled={uploadingImage}
        onChange={handleImageUpload}
        className="hidden"
      />

      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-1 border-b border-[var(--border,#d4cec4)] bg-[var(--surface-muted)] p-2">
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBold().run()}
          disabled={!editor.can().chain().focus().toggleBold().run()}
          className={`p-2 rounded-lg text-xs font-bold transition-colors ${
            editor.isActive("bold")
              ? "bg-[var(--plum)] text-white"
              : "text-[var(--ink-soft)] hover:bg-white hover:text-[var(--ink)]"
          }`}
          title="Negrito"
          aria-label="Negrito"
        >
          <Bold size={15} />
        </button>

        <button
          type="button"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          disabled={!editor.can().chain().focus().toggleItalic().run()}
          className={`p-2 rounded-lg text-xs font-bold transition-colors ${
            editor.isActive("italic")
              ? "bg-[var(--plum)] text-white"
              : "text-[var(--ink-soft)] hover:bg-white hover:text-[var(--ink)]"
          }`}
          title="Itálico"
          aria-label="Itálico"
        >
          <Italic size={15} />
        </button>

        <button
          type="button"
          onClick={() => editor.chain().focus().toggleStrike().run()}
          disabled={!editor.can().chain().focus().toggleStrike().run()}
          className={`p-2 rounded-lg text-xs font-bold transition-colors ${
            editor.isActive("strike")
              ? "bg-[var(--plum)] text-white"
              : "text-[var(--ink-soft)] hover:bg-white hover:text-[var(--ink)]"
          }`}
          title="Tachado"
          aria-label="Tachado"
        >
          <Strikethrough size={15} />
        </button>

        <div className="h-5 w-px bg-[var(--border,#d4cec4)] mx-1" />

        <button
          type="button"
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 2 }).run()
          }
          className={`px-2.5 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1 transition-colors ${
            editor.isActive("heading", { level: 2 })
              ? "bg-[var(--plum)] text-white"
              : "text-[var(--ink-soft)] hover:bg-white hover:text-[var(--ink)]"
          }`}
          title="Título Principal (H2)"
          aria-label="Título Principal (H2)"
        >
          <Heading2 size={15} />
          <span>H2</span>
        </button>

        <button
          type="button"
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 3 }).run()
          }
          className={`px-2.5 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1 transition-colors ${
            editor.isActive("heading", { level: 3 })
              ? "bg-[var(--plum)] text-white"
              : "text-[var(--ink-soft)] hover:bg-white hover:text-[var(--ink)]"
          }`}
          title="Subtítulo (H3)"
          aria-label="Subtítulo (H3)"
        >
          <Heading3 size={15} />
          <span>H3</span>
        </button>

        <div className="h-5 w-px bg-[var(--border,#d4cec4)] mx-1" />

        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={`p-2 rounded-lg text-xs font-bold transition-colors ${
            editor.isActive("bulletList")
              ? "bg-[var(--plum)] text-white"
              : "text-[var(--ink-soft)] hover:bg-white hover:text-[var(--ink)]"
          }`}
          title="Lista com marcadores"
          aria-label="Lista com marcadores"
        >
          <List size={15} />
        </button>

        <button
          type="button"
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={`p-2 rounded-lg text-xs font-bold transition-colors ${
            editor.isActive("orderedList")
              ? "bg-[var(--plum)] text-white"
              : "text-[var(--ink-soft)] hover:bg-white hover:text-[var(--ink)]"
          }`}
          title="Lista numerada"
          aria-label="Lista numerada"
        >
          <ListOrdered size={15} />
        </button>

        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          className={`p-2 rounded-lg text-xs font-bold transition-colors ${
            editor.isActive("blockquote")
              ? "bg-[var(--plum)] text-white"
              : "text-[var(--ink-soft)] hover:bg-white hover:text-[var(--ink)]"
          }`}
          title="Citação"
          aria-label="Citação"
        >
          <Quote size={15} />
        </button>

        <button
          type="button"
          onClick={() => editor.chain().focus().setHorizontalRule().run()}
          className="p-2 rounded-lg text-xs font-bold text-[var(--ink-soft)] hover:bg-white hover:text-[var(--ink)] transition-colors"
          title="Linha divisória"
          aria-label="Linha divisória"
        >
          <Minus size={15} />
        </button>

        <div className="h-5 w-px bg-[var(--border,#d4cec4)] mx-1" />

        {/* Link Button */}
        <button
          type="button"
          onClick={handleSetLink}
          className={`p-2 rounded-lg text-xs font-bold transition-colors ${
            editor.isActive("link")
              ? "bg-[var(--plum)] text-white"
              : "text-[var(--ink-soft)] hover:bg-white hover:text-[var(--ink)]"
          }`}
          title={
            editor.isActive("link") ? "Editar ou remover link" : "Inserir link"
          }
          aria-label="Inserir ou editar link"
        >
          <Link2 size={15} />
        </button>

        {editor.isActive("link") && (
          <button
            type="button"
            onClick={() => editor.chain().focus().unsetLink().run()}
            className="p-2 rounded-lg text-xs font-bold text-red-500 hover:bg-red-50 transition-colors"
            title="Remover link"
            aria-label="Remover link"
          >
            <Unlink size={15} />
          </button>
        )}

        {/* Image Upload Button */}
        <button
          type="button"
          disabled={uploadingImage}
          onClick={() => fileInputRef.current?.click()}
          className="p-2 rounded-lg text-xs font-bold text-[var(--ink-soft)] hover:bg-white hover:text-[var(--ink)] disabled:opacity-50 transition-colors flex items-center gap-1"
          title="Inserir imagem (upload)"
          aria-label="Inserir imagem"
        >
          {uploadingImage ? (
            <LoaderCircle size={15} className="animate-spin" />
          ) : (
            <ImageIcon size={15} />
          )}
        </button>

        <div className="h-5 w-px bg-[var(--border,#d4cec4)] mx-1" />

        <button
          type="button"
          onClick={() => editor.chain().focus().undo().run()}
          disabled={!editor.can().chain().focus().undo().run()}
          className="p-2 rounded-lg text-xs font-bold text-[var(--ink-soft)] hover:bg-white hover:text-[var(--ink)] disabled:opacity-40 disabled:hover:bg-transparent transition-colors"
          title="Desfazer"
          aria-label="Desfazer"
        >
          <Undo size={15} />
        </button>

        <button
          type="button"
          onClick={() => editor.chain().focus().redo().run()}
          disabled={!editor.can().chain().focus().redo().run()}
          className="p-2 rounded-lg text-xs font-bold text-[var(--ink-soft)] hover:bg-white hover:text-[var(--ink)] disabled:opacity-40 disabled:hover:bg-transparent transition-colors"
          title="Refazer"
          aria-label="Refazer"
        >
          <Redo size={15} />
        </button>
      </div>

      {/* Editor Body */}
      <EditorContent editor={editor} />
    </div>
  );
}
