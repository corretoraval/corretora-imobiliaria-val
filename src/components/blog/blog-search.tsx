"use client";

import { Search } from "lucide-react";
import { BLOG_CATEGORIES } from "@/lib/blog-constants";

const categories = ["Todos", ...BLOG_CATEGORIES];

interface BlogSearchProps {
  activeCategory: string;
  onCategoryChange: (category: string) => void;
  query: string;
  onQueryChange: (query: string) => void;
}

export function BlogSearch({
  activeCategory,
  onCategoryChange,
  query,
  onQueryChange,
}: BlogSearchProps) {
  return (
    <div className="space-y-6">
      {/* Search Input */}
      <div className="relative max-w-xl">
        <Search
          className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--ink-soft)]"
          size={18}
        />
        <input
          type="text"
          value={query}
          onChange={(e) => onQueryChange(e.target.value)}
          placeholder="Buscar artigos por palavra-chave ou tema..."
          className="w-full rounded-2xl border bg-white py-3.5 pl-12 pr-4 text-sm text-[var(--ink)] placeholder-[var(--ink-soft)] shadow-xs focus:border-[var(--gold)] focus:outline-hidden"
        />
      </div>

      {/* Category Pills */}
      <div className="flex flex-wrap items-center gap-2">
        {categories.map((cat) => {
          const isActive = activeCategory === cat;
          return (
            <button
              key={cat}
              type="button"
              onClick={() => onCategoryChange(cat)}
              className={`interactive rounded-full px-4 py-2 text-xs font-bold tracking-wider uppercase transition-all ${
                isActive
                  ? "bg-[var(--plum)] text-white shadow-xs"
                  : "bg-white border text-[var(--ink-soft)] hover:border-[var(--gold-light)] hover:text-[var(--plum)]"
              }`}
            >
              {cat}
            </button>
          );
        })}
      </div>
    </div>
  );
}
