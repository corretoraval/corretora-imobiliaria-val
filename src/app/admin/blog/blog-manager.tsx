"use client";

import {
  BookOpen,
  Calendar,
  CheckCircle,
  Clock,
  ExternalLink,
  FileText,
  Image as ImageIcon,
  LoaderCircle,
  Pencil,
  Plus,
  RefreshCw,
  Search,
  Sparkles,
  Trash2,
  Upload,
  X,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import {
  type FormEvent,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import { AdminModal } from "@/components/admin/admin-modal";
import { BLOG_CATEGORIES, type BlogCategory } from "@/lib/blog-constants";
import { toSlug } from "@/lib/identifiers";
import { uploadFile } from "@/lib/upload-file";
import { BlogEditor } from "./blog-editor";

export const categories = BLOG_CATEGORIES;
export type Category = BlogCategory;

export type BlogPost = {
  id: string;
  slug: string;
  title: string;
  summary: string;
  content: string;
  category: Category;
  coverImage: string | null;
  authorName: string;
  readingTimeMinutes: number;
  isFeatured: boolean;
  isPublished: boolean;
  publishedAt: string | Date;
  seoTitle: string | null;
  seoDescription: string | null;
  createdAt: string | Date;
  updatedAt: string | Date;
};

type DraftPost = {
  title: string;
  slug: string;
  summary: string;
  content: string;
  category: Category;
  coverImage: string;
  authorName: string;
  readingTimeMinutes: number;
  isFeatured: boolean;
  isPublished: boolean;
  seoTitle: string;
  seoDescription: string;
};

const initialDraft: DraftPost = {
  title: "",
  slug: "",
  summary: "",
  content: "",
  category: "Mercado",
  coverImage: "",
  authorName: "Corretora Val",
  readingTimeMinutes: 5,
  isFeatured: false,
  isPublished: false,
  seoTitle: "",
  seoDescription: "",
};

function calculateReadingTime(html: string): number {
  const text = html
    .replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  const words = text ? text.split(/\s+/).filter(Boolean).length : 0;
  return Math.max(1, Math.ceil(words / 200));
}

function formatDate(dateInput: string | Date): string {
  const d = new Date(dateInput);
  if (Number.isNaN(d.getTime())) return "-";
  return d.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

export function AdminBlogManager() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [uploadingCover, setUploadingCover] = useState(false);
  const [message, setMessage] = useState<{
    text: string;
    type: "success" | "error";
  } | null>(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draft, setDraft] = useState<DraftPost>(initialDraft);
  const [userEditedSlug, setUserEditedSlug] = useState(false);

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("TODAS");
  const [postToDelete, setPostToDelete] = useState<BlogPost | null>(null);

  const loadPosts = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/blog", { cache: "no-store" });
      if (!res.ok) {
        const body = await res.json().catch(() => null);
        const detail =
          typeof body?.error === "string"
            ? body.error
            : res.status === 401 || res.status === 403
              ? "Sua sessão não tem permissão para acessar os artigos."
              : `A API retornou o status ${res.status}.`;
        throw new Error(`Falha ao carregar artigos do blog: ${detail}`);
      }
      const data: BlogPost[] = await res.json();
      setPosts(data);
    } catch (err) {
      console.error(err);
      setMessage({
        text:
          err instanceof Error
            ? err.message
            : "Não foi possível carregar os artigos.",
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadPosts();
  }, [loadPosts]);

  const handleOpenCreate = () => {
    setEditingId(null);
    setDraft(initialDraft);
    setUserEditedSlug(false);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (post: BlogPost) => {
    setEditingId(post.id);
    setDraft({
      title: post.title,
      slug: post.slug,
      summary: post.summary,
      content: post.content,
      category: post.category,
      coverImage: post.coverImage || "",
      authorName: post.authorName || "Corretora Val",
      readingTimeMinutes: post.readingTimeMinutes || 5,
      isFeatured: post.isFeatured,
      isPublished: post.isPublished,
      seoTitle: post.seoTitle || "",
      seoDescription: post.seoDescription || "",
    });
    setUserEditedSlug(true);
    setIsModalOpen(true);
  };

  const handleTitleChange = (newTitle: string) => {
    if (!userEditedSlug && !editingId) {
      setDraft((prev) => ({
        ...prev,
        title: newTitle,
        slug: toSlug(newTitle),
      }));
    } else {
      setDraft((prev) => ({ ...prev, title: newTitle }));
    }
  };

  const handleContentChange = (html: string) => {
    const readingTime = calculateReadingTime(html);
    setDraft((prev) => ({
      ...prev,
      content: html,
      readingTimeMinutes: readingTime,
    }));
  };

  const handleCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploadingCover(true);
      const uploaded = await uploadFile(file);
      setDraft((prev) => ({ ...prev, coverImage: uploaded.url }));
      setMessage({
        text: "Imagem de capa enviada com sucesso.",
        type: "success",
      });
    } catch (err) {
      console.error(err);
      setMessage({
        text: "Erro ao enviar imagem de capa.",
        type: "error",
      });
    } finally {
      setUploadingCover(false);
      e.target.value = "";
    }
  };

  const handleTogglePublish = async (post: BlogPost) => {
    try {
      const nextState = !post.isPublished;
      const res = await fetch(`/api/admin/blog/${post.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isPublished: nextState }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Erro ao alterar status");
      }

      const updated: BlogPost = await res.json();
      setPosts((prev) =>
        prev.map((item) => (item.id === updated.id ? updated : item)),
      );
      setMessage({
        text: nextState
          ? `Artigo "${post.title}" publicado com sucesso!`
          : `Artigo "${post.title}" alterado para rascunho.`,
        type: "success",
      });
    } catch (err) {
      console.error(err);
      setMessage({
        text:
          err instanceof Error
            ? err.message
            : "Não foi possível atualizar o artigo.",
        type: "error",
      });
    }
  };

  const handleDeletePost = async () => {
    if (!postToDelete) return;

    try {
      const res = await fetch(`/api/admin/blog/${postToDelete.id}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Erro ao excluir artigo");
      }

      setPosts((prev) => prev.filter((item) => item.id !== postToDelete.id));
      setMessage({
        text: `Artigo "${postToDelete.title}" excluído com sucesso.`,
        type: "success",
      });
    } catch (err) {
      console.error(err);
      setMessage({
        text: err instanceof Error ? err.message : "Erro ao excluir o artigo.",
        type: "error",
      });
    } finally {
      setPostToDelete(null);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!draft.title.trim()) {
      setMessage({ text: "O título é obrigatório.", type: "error" });
      return;
    }
    if (!draft.slug.trim()) {
      setMessage({ text: "O slug da URL é obrigatório.", type: "error" });
      return;
    }
    if (!draft.summary.trim()) {
      setMessage({
        text: "O resumo deve ter pelo menos 10 caracteres.",
        type: "error",
      });
      return;
    }
    if (!draft.content.trim() || draft.content === "<p></p>") {
      setMessage({
        text: "O conteúdo do artigo não pode estar vazio.",
        type: "error",
      });
      return;
    }

    try {
      setSubmitting(true);
      const payload = {
        title: draft.title.trim(),
        slug: draft.slug.trim() || undefined,
        summary: draft.summary.trim(),
        content: draft.content.trim(),
        category: draft.category,
        coverImage: draft.coverImage.trim() || null,
        authorName: draft.authorName.trim() || "Corretora Val",
        readingTimeMinutes: draft.readingTimeMinutes || 5,
        isFeatured: draft.isFeatured,
        isPublished: draft.isPublished,
        seoTitle: draft.seoTitle.trim() || draft.title.trim(),
        seoDescription: draft.seoDescription.trim() || draft.summary.trim(),
      };

      const url = editingId
        ? `/api/admin/blog/${editingId}`
        : "/api/admin/blog";
      const method = editingId ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const json = await res.json();

      if (!res.ok) {
        if (json.error && Array.isArray(json.error)) {
          const firstErr = json.error[0]?.message || "Dados inválidos.";
          throw new Error(firstErr);
        }
        throw new Error(json.error || "Erro ao salvar artigo");
      }

      if (editingId) {
        setPosts((prev) =>
          prev.map((item) => (item.id === json.id ? json : item)),
        );
        setMessage({
          text: `Artigo "${json.title}" atualizado com sucesso!`,
          type: "success",
        });
      } else {
        setPosts((prev) => [json, ...prev]);
        setMessage({
          text: `Artigo "${json.title}" criado com sucesso!`,
          type: "success",
        });
      }

      setIsModalOpen(false);
    } catch (err) {
      console.error(err);
      setMessage({
        text:
          err instanceof Error ? err.message : "Erro ao processar solicitação.",
        type: "error",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const filteredPosts = useMemo(() => {
    return posts.filter((post) => {
      const matchCategory =
        selectedCategory === "TODAS" || post.category === selectedCategory;
      const matchSearch =
        post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        post.summary.toLowerCase().includes(searchTerm.toLowerCase()) ||
        post.slug.toLowerCase().includes(searchTerm.toLowerCase());
      return matchCategory && matchSearch;
    });
  }, [posts, selectedCategory, searchTerm]);

  return (
    <div className="p-6 md:p-10 max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-[var(--gold)]">
            <BookOpen size={16} />
            <span>Gestão de Conteúdo</span>
          </div>
          <h1 className="text-3xl font-extrabold text-[var(--plum)] tracking-tight mt-1">
            Artigos do Blog
          </h1>
          <p className="text-sm text-[var(--ink-soft)] mt-1">
            Escreva, edite e publique artigos informativos para atrair e educar
            seus clientes.
          </p>
        </div>

        <button
          type="button"
          onClick={handleOpenCreate}
          className="interactive inline-flex items-center gap-2 rounded-xl bg-[var(--plum)] px-5 py-3 text-sm font-extrabold text-white shadow-sm hover:bg-[var(--plum-bright)] transition-colors self-start sm:self-auto"
        >
          <Plus size={18} />
          <span>Novo Artigo</span>
        </button>
      </div>

      {/* Notifications */}
      {message && (
        <div
          className={`flex items-center justify-between gap-3 p-4 rounded-xl border text-sm ${
            message.type === "success"
              ? "bg-emerald-50 text-emerald-900 border-emerald-200"
              : "bg-red-50 text-red-900 border-red-200"
          }`}
        >
          <span>{message.text}</span>
          <button
            type="button"
            onClick={() => setMessage(null)}
            className="text-current opacity-70 hover:opacity-100"
            aria-label="Fechar mensagem"
          >
            <X size={16} />
          </button>
        </div>
      )}

      {/* Filters and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center gap-3 bg-white p-4 rounded-2xl border border-[var(--border,#d4cec4)] shadow-xs">
        <div className="relative flex-1 w-full">
          <Search
            size={18}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--ink-soft)]"
          />
          <input
            type="text"
            placeholder="Buscar artigo por título, resumo ou slug..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[var(--border,#d4cec4)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--plum)] bg-[var(--surface-muted)]"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3.5 py-2.5 rounded-xl border border-[var(--border,#d4cec4)] text-sm font-semibold text-[var(--ink)] bg-white focus:outline-none focus:ring-2 focus:ring-[var(--plum)]"
          >
            <option value="TODAS">Todas as categorias</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>

          <button
            type="button"
            onClick={loadPosts}
            title="Atualizar lista"
            className="p-2.5 rounded-xl border border-[var(--border,#d4cec4)] text-[var(--ink-soft)] hover:text-[var(--plum)] hover:bg-[var(--surface-muted)] transition-colors"
          >
            <RefreshCw size={18} className={loading ? "animate-spin" : ""} />
          </button>
        </div>
      </div>

      {/* Posts Table */}
      <div className="bg-white rounded-2xl border border-[var(--border,#d4cec4)] overflow-hidden shadow-xs">
        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center gap-3 text-[var(--ink-soft)]">
            <LoaderCircle
              size={32}
              className="animate-spin text-[var(--plum)]"
            />
            <p className="text-sm font-medium">Carregando artigos...</p>
          </div>
        ) : filteredPosts.length === 0 ? (
          <div className="py-20 text-center px-4">
            <FileText
              size={48}
              className="mx-auto text-[var(--ink-soft)] opacity-40 mb-3"
            />
            <h3 className="text-base font-bold text-[var(--ink)]">
              Nenhum artigo encontrado
            </h3>
            <p className="text-sm text-[var(--ink-soft)] mt-1 max-w-sm mx-auto">
              {searchTerm || selectedCategory !== "TODAS"
                ? "Tente ajustar os filtros ou a busca."
                : "Comece criando o primeiro artigo informativo do blog!"}
            </p>
            {!(searchTerm || selectedCategory !== "TODAS") && (
              <button
                type="button"
                onClick={handleOpenCreate}
                className="mt-5 inline-flex items-center gap-2 rounded-xl bg-[var(--plum)] px-4 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-[var(--plum-bright)] transition-colors"
              >
                <Plus size={16} /> Criar Primeiro Artigo
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[var(--border,#d4cec4)] bg-[var(--surface-muted)] text-[11px] font-extrabold uppercase tracking-wider text-[var(--ink-soft)]">
                  <th className="py-3.5 px-4 sm:px-6">Artigo</th>
                  <th className="py-3.5 px-4">Categoria</th>
                  <th className="py-3.5 px-4">Leitura</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4">Publicação</th>
                  <th className="py-3.5 px-4 sm:px-6 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border,#d4cec4)] text-sm">
                {filteredPosts.map((post) => (
                  <tr
                    key={post.id}
                    className="hover:bg-[var(--surface-muted)]/50 transition-colors"
                  >
                    {/* Artigo Info */}
                    <td className="py-4 px-4 sm:px-6">
                      <div className="flex items-center gap-3">
                        {post.coverImage ? (
                          <div className="relative h-12 w-16 shrink-0 rounded-lg overflow-hidden border border-[var(--border,#d4cec4)] bg-stone-100">
                            <Image
                              src={post.coverImage}
                              alt={post.title}
                              fill
                              className="object-cover"
                            />
                          </div>
                        ) : (
                          <div className="h-12 w-16 shrink-0 rounded-lg border border-dashed border-[var(--border,#d4cec4)] bg-stone-50 flex items-center justify-center text-[var(--ink-soft)]">
                            <ImageIcon size={18} className="opacity-40" />
                          </div>
                        )}

                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-[var(--ink)] truncate max-w-xs sm:max-w-md block">
                              {post.title}
                            </span>
                            {post.isFeatured && (
                              <span
                                title="Artigo em Destaque"
                                className="inline-flex items-center gap-1 rounded-md bg-amber-50 px-1.5 py-0.5 text-[10px] font-bold text-amber-700 border border-amber-200 shrink-0"
                              >
                                <Sparkles size={10} /> Destaque
                              </span>
                            )}
                          </div>
                          <span className="text-xs text-[var(--ink-soft)] font-mono block mt-0.5 truncate max-w-xs sm:max-w-md">
                            /{post.slug}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Categoria */}
                    <td className="py-4 px-4 whitespace-nowrap">
                      <span className="inline-block rounded-lg bg-[var(--plum)]/10 px-2.5 py-1 text-xs font-bold text-[var(--plum)]">
                        {post.category}
                      </span>
                    </td>

                    {/* Leitura */}
                    <td className="py-4 px-4 whitespace-nowrap text-xs text-[var(--ink-soft)]">
                      <div className="flex items-center gap-1.5">
                        <Clock size={14} />
                        <span>{post.readingTimeMinutes} min</span>
                      </div>
                    </td>

                    {/* Status */}
                    <td className="py-4 px-4 whitespace-nowrap">
                      {post.isPublished ? (
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-700 border border-emerald-200">
                          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                          Publicado
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-2.5 py-1 text-xs font-bold text-amber-700 border border-amber-200">
                          <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
                          Rascunho
                        </span>
                      )}
                    </td>

                    {/* Data */}
                    <td className="py-4 px-4 whitespace-nowrap text-xs text-[var(--ink-soft)]">
                      <div className="flex items-center gap-1.5">
                        <Calendar size={14} />
                        <span>
                          {formatDate(post.publishedAt || post.createdAt)}
                        </span>
                      </div>
                    </td>

                    {/* Ações */}
                    <td className="py-4 px-4 sm:px-6 text-right whitespace-nowrap">
                      <div className="inline-flex items-center gap-1.5">
                        {post.isPublished && (
                          <Link
                            href={`/blog/${post.slug}`}
                            target="_blank"
                            title="Ver artigo no site público"
                            className="p-1.5 rounded-lg text-[var(--ink-soft)] hover:text-[var(--plum)] hover:bg-stone-100 transition-colors"
                          >
                            <ExternalLink size={16} />
                          </Link>
                        )}

                        <button
                          type="button"
                          onClick={() => handleTogglePublish(post)}
                          title={
                            post.isPublished
                              ? "Mudar para rascunho"
                              : "Publicar no site agora"
                          }
                          className="px-2.5 py-1 rounded-lg text-xs font-bold border border-[var(--border,#d4cec4)] text-[var(--ink)] hover:border-[var(--plum)] hover:text-[var(--plum)] transition-colors"
                        >
                          {post.isPublished ? "Despublicar" : "Publicar"}
                        </button>

                        <button
                          type="button"
                          onClick={() => handleOpenEdit(post)}
                          title="Editar artigo"
                          className="p-1.5 rounded-lg text-[var(--ink-soft)] hover:text-[var(--plum)] hover:bg-stone-100 transition-colors"
                        >
                          <Pencil size={16} />
                        </button>

                        <button
                          type="button"
                          onClick={() => setPostToDelete(post)}
                          title="Excluir artigo"
                          className="p-1.5 rounded-lg text-red-500 hover:text-red-700 hover:bg-red-50 transition-colors"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {postToDelete && (
        <AdminModal
          isOpen={Boolean(postToDelete)}
          onClose={() => setPostToDelete(null)}
          title="Excluir Artigo"
          description="Tem certeza que deseja excluir permanentemente este artigo do blog?"
          size="md"
        >
          <div className="space-y-4">
            <p className="text-sm text-[var(--ink-soft)]">
              O artigo <strong>&quot;{postToDelete.title}&quot;</strong> será
              apagado do banco de dados e deixará de estar disponível no site.
              Esta ação não pode ser desfeita.
            </p>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-[var(--border,#d4cec4)]">
              <button
                type="button"
                onClick={() => setPostToDelete(null)}
                className="px-4 py-2 rounded-xl text-sm font-bold text-[var(--ink)] hover:bg-stone-100 transition-colors"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleDeletePost}
                className="px-4 py-2 rounded-xl text-sm font-bold bg-red-600 text-white hover:bg-red-700 shadow-xs transition-colors"
              >
                Sim, Excluir Artigo
              </button>
            </div>
          </div>
        </AdminModal>
      )}

      {/* Create / Edit Modal */}
      <AdminModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingId ? "Editar Artigo do Blog" : "Novo Artigo do Blog"}
        description="Preencha os campos abaixo. O artigo possui editor visual (WYSIWYG) sem necessidade de código."
        size="4xl"
      >
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Título & Slug */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="post-title"
                className="block text-xs font-bold uppercase tracking-wider text-[var(--ink-soft)] mb-1.5"
              >
                Título do Artigo *
              </label>
              <input
                id="post-title"
                type="text"
                maxLength={200}
                placeholder="Ex: Como escolher o imóvel ideal para temporada"
                value={draft.title}
                required
                onChange={(e) => handleTitleChange(e.target.value)}
                className="w-full rounded-xl border border-[var(--border,#d4cec4)] px-3.5 py-2.5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[var(--plum)] bg-white"
              />
            </div>

            <div>
              <label
                htmlFor="post-slug"
                className="block text-xs font-bold uppercase tracking-wider text-[var(--ink-soft)] mb-1.5"
              >
                URL Amigável (Slug)
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-mono text-[var(--ink-soft)]">
                  /blog/
                </span>
                <input
                  id="post-slug"
                  type="text"
                  required
                  maxLength={200}
                  placeholder="como-escolher-o-imovel-ideal"
                  value={draft.slug}
                  onChange={(e) => {
                    setUserEditedSlug(true);
                    setDraft((prev) => ({
                      ...prev,
                      slug: toSlug(e.target.value),
                    }));
                  }}
                  className="w-full rounded-xl border border-[var(--border,#d4cec4)] pl-16 pr-3.5 py-2.5 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-[var(--plum)] bg-white"
                />
              </div>
            </div>
          </div>

          {/* Categoria, Autor, Tempo de leitura */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label
                htmlFor="post-category"
                className="block text-xs font-bold uppercase tracking-wider text-[var(--ink-soft)] mb-1.5"
              >
                Categoria *
              </label>
              <select
                id="post-category"
                value={draft.category}
                onChange={(e) =>
                  setDraft((prev) => ({
                    ...prev,
                    category: e.target.value as Category,
                  }))
                }
                className="w-full rounded-xl border border-[var(--border,#d4cec4)] px-3.5 py-2.5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[var(--plum)] bg-white"
              >
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label
                htmlFor="post-author"
                className="block text-xs font-bold uppercase tracking-wider text-[var(--ink-soft)] mb-1.5"
              >
                Autor *
              </label>
              <input
                id="post-author"
                type="text"
                required
                maxLength={100}
                value={draft.authorName}
                onChange={(e) =>
                  setDraft((prev) => ({ ...prev, authorName: e.target.value }))
                }
                className="w-full rounded-xl border border-[var(--border,#d4cec4)] px-3.5 py-2.5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[var(--plum)] bg-white"
              />
            </div>

            <div>
              <label
                htmlFor="post-reading-time"
                className="block text-xs font-bold uppercase tracking-wider text-[var(--ink-soft)] mb-1.5"
              >
                Tempo de Leitura (minutos)
              </label>
              <div className="relative">
                <input
                  id="post-reading-time"
                  type="number"
                  min={1}
                  max={60}
                  value={draft.readingTimeMinutes}
                  onChange={(e) =>
                    setDraft((prev) => ({
                      ...prev,
                      readingTimeMinutes: Math.max(
                        1,
                        Number(e.target.value) || 1,
                      ),
                    }))
                  }
                  className="w-full rounded-xl border border-[var(--border,#d4cec4)] px-3.5 py-2.5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[var(--plum)] bg-white"
                />
                <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs text-[var(--ink-soft)]">
                  min
                </span>
              </div>
            </div>
          </div>

          {/* Resumo */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label
                htmlFor="post-summary"
                className="block text-xs font-bold uppercase tracking-wider text-[var(--ink-soft)]"
              >
                Resumo / Subtítulo * (mínimo 10 caracteres)
              </label>
              <span className="text-[11px] text-[var(--ink-soft)]">
                {draft.summary.length}/500
              </span>
            </div>
            <textarea
              id="post-summary"
              rows={2}
              required
              maxLength={500}
              placeholder="Breve resumo que aparece na listagem e cards do blog..."
              value={draft.summary}
              onChange={(e) =>
                setDraft((prev) => ({ ...prev, summary: e.target.value }))
              }
              className="w-full rounded-xl border border-[var(--border,#d4cec4)] p-3.5 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--plum)] bg-white"
            />
          </div>

          {/* Imagem de Capa */}
          <div>
            <label
              htmlFor="post-cover"
              className="block text-xs font-bold uppercase tracking-wider text-[var(--ink-soft)] mb-1.5"
            >
              Imagem de Capa (URL ou Upload)
            </label>

            <div className="flex flex-col sm:flex-row items-start gap-4">
              {draft.coverImage ? (
                <div className="relative h-28 w-44 rounded-xl overflow-hidden border border-[var(--border,#d4cec4)] bg-stone-100 group shrink-0">
                  <Image
                    src={draft.coverImage}
                    alt="Preview da Capa"
                    fill
                    className="object-cover"
                  />
                  <button
                    type="button"
                    onClick={() =>
                      setDraft((prev) => ({ ...prev, coverImage: "" }))
                    }
                    className="absolute top-1.5 right-1.5 p-1 rounded-full bg-black/60 text-white hover:bg-black transition-colors"
                    title="Remover imagem"
                  >
                    <X size={14} />
                  </button>
                </div>
              ) : (
                <div className="h-28 w-44 rounded-xl border-2 border-dashed border-[var(--border,#d4cec4)] flex flex-col items-center justify-center text-[var(--ink-soft)] gap-1 shrink-0 bg-[var(--surface-muted)]">
                  <ImageIcon size={22} className="opacity-40" />
                  <span className="text-[11px]">Sem imagem</span>
                </div>
              )}

              <div className="flex-1 w-full space-y-2">
                <input
                  id="post-cover"
                  type="url"
                  placeholder="https://exemplo.com/imagem.jpg"
                  value={draft.coverImage}
                  onChange={(e) =>
                    setDraft((prev) => ({
                      ...prev,
                      coverImage: e.target.value,
                    }))
                  }
                  className="w-full rounded-xl border border-[var(--border,#d4cec4)] px-3.5 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--plum)] bg-white"
                />

                <div className="flex items-center gap-2">
                  <label className="interactive inline-flex items-center gap-2 rounded-xl border border-[var(--border,#d4cec4)] px-3.5 py-2 text-xs font-bold text-[var(--ink)] hover:bg-[var(--surface-muted)] cursor-pointer transition-colors">
                    {uploadingCover ? (
                      <>
                        <LoaderCircle size={14} className="animate-spin" />
                        <span>Enviando...</span>
                      </>
                    ) : (
                      <>
                        <Upload size={14} />
                        <span>Fazer Upload de Foto</span>
                      </>
                    )}
                    <input
                      type="file"
                      accept="image/*"
                      disabled={uploadingCover}
                      onChange={handleCoverUpload}
                      className="hidden"
                    />
                  </label>
                  <span className="text-[11px] text-[var(--ink-soft)]">
                    JPG, PNG ou WebP recomendados
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Conteúdo WYSIWYG */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label
                htmlFor="post-content-editor"
                className="block text-xs font-bold uppercase tracking-wider text-[var(--ink-soft)]"
              >
                Conteúdo do Artigo *
              </label>
              <span className="text-[11px] text-[var(--ink-soft)]">
                Editor visual formatado
              </span>
            </div>
            <BlogEditor value={draft.content} onChange={handleContentChange} />
          </div>

          {/* Destaque & Publicação Switches */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-xl bg-[var(--surface-muted)] border border-[var(--border,#d4cec4)]">
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={draft.isFeatured}
                onChange={(e) =>
                  setDraft((prev) => ({
                    ...prev,
                    isFeatured: e.target.checked,
                  }))
                }
                className="mt-1 h-4 w-4 rounded border-stone-300 text-[var(--plum)] focus:ring-[var(--plum)]"
              />
              <div>
                <span className="text-sm font-bold text-[var(--ink)] block">
                  Destacar Artigo
                </span>
                <span className="text-xs text-[var(--ink-soft)]">
                  Exibe o artigo em destaque na página principal do blog.
                </span>
              </div>
            </label>

            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={draft.isPublished}
                onChange={(e) =>
                  setDraft((prev) => ({
                    ...prev,
                    isPublished: e.target.checked,
                  }))
                }
                className="mt-1 h-4 w-4 rounded border-stone-300 text-[var(--plum)] focus:ring-[var(--plum)]"
              />
              <div>
                <span className="text-sm font-bold text-[var(--ink)] block">
                  Publicar no Site
                </span>
                <span className="text-xs text-[var(--ink-soft)]">
                  Se desmarcado, ficará salvo como rascunho visível apenas para
                  administradores.
                </span>
              </div>
            </label>
          </div>

          {/* Detalhes de SEO Avançado */}
          <details className="rounded-xl border border-[var(--border,#d4cec4)] p-4 bg-white group">
            <summary className="text-xs font-bold uppercase tracking-wider text-[var(--ink-soft)] cursor-pointer list-none flex items-center justify-between">
              <span>Otimização para Mecanismos de Busca (SEO Avançado)</span>
              <span className="text-[11px] font-normal text-[var(--ink-soft)] group-open:hidden">
                Clique para expandir
              </span>
            </summary>

            <div className="mt-4 space-y-4 pt-3 border-t border-[var(--border,#d4cec4)]">
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label
                    htmlFor="seo-title"
                    className="block text-xs font-semibold text-[var(--ink)]"
                  >
                    Meta Título SEO
                  </label>
                  <span className="text-[11px] text-[var(--ink-soft)]">
                    {draft.seoTitle.length}/160
                  </span>
                </div>
                <input
                  id="seo-title"
                  type="text"
                  maxLength={160}
                  placeholder={
                    draft.title ||
                    "Preenchimento automático a partir do título..."
                  }
                  value={draft.seoTitle}
                  onChange={(e) =>
                    setDraft((prev) => ({
                      ...prev,
                      seoTitle: e.target.value,
                    }))
                  }
                  className="w-full rounded-xl border border-[var(--border,#d4cec4)] px-3.5 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--plum)] bg-white"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label
                    htmlFor="seo-desc"
                    className="block text-xs font-semibold text-[var(--ink)]"
                  >
                    Meta Descrição SEO
                  </label>
                  <span className="text-[11px] text-[var(--ink-soft)]">
                    {draft.seoDescription.length}/320
                  </span>
                </div>
                <textarea
                  id="seo-desc"
                  rows={2}
                  maxLength={320}
                  placeholder={
                    draft.summary ||
                    "Preenchimento automático a partir do resumo..."
                  }
                  value={draft.seoDescription}
                  onChange={(e) =>
                    setDraft((prev) => ({
                      ...prev,
                      seoDescription: e.target.value,
                    }))
                  }
                  className="w-full rounded-xl border border-[var(--border,#d4cec4)] p-3 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--plum)] bg-white"
                />
              </div>
            </div>
          </details>

          {/* Botões do Rodapé do Formulário */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-[var(--border,#d4cec4)]">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-5 py-2.5 rounded-xl text-sm font-bold text-[var(--ink)] hover:bg-stone-100 transition-colors"
            >
              Cancelar
            </button>

            <button
              type="submit"
              disabled={submitting}
              className="interactive inline-flex items-center gap-2 rounded-xl bg-[var(--plum)] px-6 py-2.5 text-sm font-extrabold text-white shadow-sm hover:bg-[var(--plum-bright)] disabled:opacity-50 transition-colors"
            >
              {submitting ? (
                <>
                  <LoaderCircle size={16} className="animate-spin" />
                  <span>Salvando...</span>
                </>
              ) : (
                <>
                  <CheckCircle size={16} />
                  <span>
                    {editingId ? "Salvar Alterações" : "Salvar Artigo"}
                  </span>
                </>
              )}
            </button>
          </div>
        </form>
      </AdminModal>
    </div>
  );
}
