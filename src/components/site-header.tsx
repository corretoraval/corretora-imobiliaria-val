import { ChevronDown, Heart, Menu } from "lucide-react";
import Link from "next/link";
import { getPublishedPages, getSiteSettings } from "@/lib/site-content";

const navigationSlugs = [
  "administracao",
  "quem-somos",
  "autoridade",
  "memoria-viva",
  "blog",
  "contato",
];

const fallbackNavigation = [
  { slug: "administracao", label: "Administração" },
  { slug: "quem-somos", label: "Quem Somos" },
  { slug: "autoridade", label: "Autoridade" },
  { slug: "memoria-viva", label: "Memória Viva" },
  { slug: "blog", label: "Blog" },
  { slug: "contato", label: "Contato" },
];

export async function SiteHeader() {
  const [settings, pages] = await Promise.all([
    getSiteSettings(),
    getPublishedPages().catch(() => []),
  ]);

  const dbNav = pages.filter((page) => navigationSlugs.includes(page.slug));
  const navigation =
    dbNav.length > 0
      ? dbNav.map((p) => ({ slug: p.slug, label: p.navigationLabel }))
      : fallbackNavigation;

  const whatsappUrl = settings.whatsapp
    ? `https://wa.me/${settings.whatsapp}`
    : "/contato";

  return (
    <header className="sticky top-0 z-50 border-b bg-[rgba(248,245,239,0.95)] backdrop-blur-md shadow-xs">
      <div className="shell flex min-h-20 items-center justify-between gap-6">
        <Link
          aria-label={`${settings.brandName} — página inicial`}
          className="interactive group flex items-center gap-2 rounded-sm py-2 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--gold)]"
          href="/"
        >
          <span className="flex size-9 items-center justify-center rounded-full border border-[var(--gold-light)] bg-[var(--surface)] text-[var(--plum)] shadow-[0_2px_12px_rgba(53,16,79,0.08)]">
            <Heart aria-hidden="true" size={17} strokeWidth={1.7} />
          </span>
          <span className="leading-none">
            <span className="display block text-[2rem] leading-[0.65] text-[var(--plum)]">
              Val
            </span>
            <span className="mt-2 block text-[0.48rem] font-extrabold tracking-[0.16em] text-[var(--ink-soft)] uppercase">
              {settings.brandName}
            </span>
          </span>
        </Link>
        <nav
          aria-label="Navegação principal"
          className="hidden items-center gap-5 xl:flex"
        >
          <Link
            className="interactive rounded-sm py-2 text-[0.68rem] font-extrabold tracking-[0.06em] text-[var(--ink)] uppercase hover:text-[var(--plum-bright)]"
            href="/imoveis"
          >
            Imóveis
          </Link>
          {navigation.map((item) => (
            <Link
              className="interactive rounded-sm py-2 text-[0.68rem] font-extrabold tracking-[0.06em] text-[var(--ink)] uppercase hover:text-[var(--plum-bright)]"
              href={`/${item.slug}`}
              key={item.slug}
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <a
          className="interactive hidden items-center gap-2 rounded-full bg-[var(--plum)] px-4 py-3 text-[0.68rem] font-extrabold tracking-[0.06em] text-white uppercase shadow-[0_8px_20px_rgba(53,16,79,0.2)] hover:-translate-y-0.5 hover:bg-[var(--plum-bright)] md:flex"
          href={whatsappUrl}
          rel="noreferrer"
          target={whatsappUrl.startsWith("http") ? "_blank" : undefined}
        >
          <svg aria-hidden="true" fill="currentColor" height="16" viewBox="0 0 24 24" width="16" xmlns="http://www.w3.org/2000/svg">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z" />
          </svg> WhatsApp
        </a>
        <details className="relative xl:hidden">
          <summary className="interactive flex size-11 cursor-pointer list-none items-center justify-center rounded-full border bg-[var(--surface)] text-[var(--plum)] [&::-webkit-details-marker]:hidden">
            <Menu aria-hidden="true" size={20} />
            <span className="sr-only">Abrir navegação</span>
          </summary>
          <nav
            aria-label="Navegação móvel"
            className="absolute top-[calc(100%+0.75rem)] right-0 z-20 flex w-72 origin-top-right flex-col rounded-2xl border bg-[var(--surface)] p-2 shadow-[0_18px_50px_rgba(53,16,79,0.16)]"
          >
            <Link
              className="interactive flex items-center justify-between rounded-xl px-4 py-3 text-sm font-bold text-[var(--ink)] hover:bg-[var(--surface-muted)]"
              href="/imoveis"
            >
              Imóveis
              <ChevronDown
                aria-hidden="true"
                className="-rotate-90 text-[var(--gold)]"
                size={15}
              />
            </Link>
            {navigation.map((item) => (
              <Link
                className="interactive flex items-center justify-between rounded-xl px-4 py-3 text-sm font-bold text-[var(--ink)] hover:bg-[var(--surface-muted)]"
                href={`/${item.slug}`}
                key={item.slug}
              >
                {item.label}
                <ChevronDown
                  aria-hidden="true"
                  className="-rotate-90 text-[var(--gold)]"
                  size={15}
                />
              </Link>
            ))}
          </nav>
        </details>
      </div>
    </header>
  );
}
