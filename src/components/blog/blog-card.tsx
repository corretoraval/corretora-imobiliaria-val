import { ArrowUpRight, Clock, User } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

interface BlogCardProps {
  post: {
    slug: string;
    title: string;
    summary: string;
    category: string;
    authorName: string;
    readingTimeMinutes: number;
    publishedAt: Date | string;
    coverImage?: string | null;
  };
}

export function BlogCard({ post }: BlogCardProps) {
  const formattedDate = new Date(post.publishedAt).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

  return (
    <article className="group flex flex-col rounded-2xl border bg-white overflow-hidden shadow-xs hover:border-[var(--gold-light)] hover:shadow-md transition-all">
      {post.coverImage && (
        <Link
          href={`/blog/${post.slug}`}
          className="relative block aspect-[16/9] overflow-hidden bg-[var(--surface-muted)]"
          aria-label={`Ler artigo: ${post.title}`}
        >
          <Image
            src={post.coverImage}
            alt={`Capa do artigo: ${post.title}`}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
        </Link>
      )}
      <div className="p-6 md:p-8 flex flex-col flex-1">
        <div className="flex items-center justify-between gap-2 mb-4">
          <span className="rounded-full bg-[var(--surface-muted)] px-3 py-1 text-[0.65rem] font-extrabold tracking-wider text-[var(--plum)] uppercase">
            {post.category}
          </span>
          <div className="flex items-center gap-1.5 text-xs text-[var(--ink-soft)]">
            <Clock size={13} className="text-[var(--gold)]" />
            <span>{formattedDate}</span>
          </div>
        </div>

        <Link
          href={`/blog/${post.slug}`}
          className="group-hover:text-[var(--plum-bright)] transition-colors"
        >
          <h3 className="display text-xl leading-snug font-bold text-[var(--plum)] mb-3">
            {post.title}
          </h3>
        </Link>

        <p className="text-sm text-[var(--ink-soft)] leading-relaxed mb-6 line-clamp-3 flex-1">
          {post.summary}
        </p>

        <div className="pt-4 border-t flex items-center justify-between text-xs text-[var(--ink-soft)]">
          <div className="flex items-center gap-1.5">
            <User size={13} className="text-[var(--gold)]" />
            <span>{post.authorName}</span>
          </div>
          <Link
            href={`/blog/${post.slug}`}
            className="inline-flex items-center gap-1 font-bold text-[var(--plum)] group-hover:text-[var(--gold)] transition-colors"
          >
            Ler artigo <ArrowUpRight size={14} />
          </Link>
        </div>
      </div>
    </article>
  );
}
