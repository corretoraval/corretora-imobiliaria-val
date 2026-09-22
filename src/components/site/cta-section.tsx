import { ArrowRight, MessageCircle } from "lucide-react";
import Link from "next/link";

interface CTASectionProps {
  title?: string;
  description?: string;
  primaryButtonText?: string;
  primaryButtonHref?: string;
  secondaryButtonText?: string;
  secondaryButtonHref?: string;
  isWhatsApp?: boolean;
}

export function CTASection({
  title = "Deixe seu patrimônio nas mãos de quem cuida dele.",
  description = "Fale diretamente comigo para administração, venda ou avaliação do seu imóvel em Balneário Camboriú e região.",
  primaryButtonText = "Falar pelo WhatsApp",
  primaryButtonHref = "https://wa.me/5547974007391",
  secondaryButtonText = "Conhecer Nossos Imóveis",
  secondaryButtonHref = "/imoveis",
  isWhatsApp = true,
}: CTASectionProps) {
  return (
    <section className="relative overflow-hidden bg-[var(--plum)] py-16 text-white lg:py-24">
      <div className="absolute top-0 right-0 -translate-y-12 translate-x-12 size-96 rounded-full bg-[var(--gold)]/10 blur-3xl" />
      <div className="shell relative z-10 text-center">
        <h2 className="display text-3xl md:text-5xl leading-tight text-white max-w-3xl mx-auto">
          {title}
        </h2>
        <p className="mt-6 text-lg text-white/80 max-w-2xl mx-auto leading-relaxed">
          {description}
        </p>

        <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
          <a
            href={primaryButtonHref}
            target={primaryButtonHref.startsWith("http") ? "_blank" : undefined}
            rel="noreferrer"
            className="interactive inline-flex items-center gap-2 rounded-full bg-[var(--gold)] px-8 py-4 text-xs font-extrabold tracking-[0.1em] text-[var(--plum)] uppercase shadow-lg hover:bg-[var(--gold-light)] hover:-translate-y-0.5 transition-all"
          >
            {isWhatsApp && <MessageCircle size={18} />}
            {primaryButtonText}
          </a>

          {secondaryButtonText && (
            <Link
              href={secondaryButtonHref}
              className="interactive inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/5 px-8 py-4 text-xs font-extrabold tracking-[0.1em] text-white uppercase backdrop-blur-xs hover:bg-white/10 transition-all"
            >
              {secondaryButtonText}
              <ArrowRight size={16} />
            </Link>
          )}
        </div>
      </div>
    </section>
  );
}
