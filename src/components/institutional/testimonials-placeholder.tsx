import { MessageSquareText, Quote, ShieldCheck } from "lucide-react";
import Image from "next/image";
import { SectionTitle } from "@/components/site/section-title";

export interface TestimonialItem {
  id: string;
  clientName: string;
  text: string;
  role?: string | null;
  avatarUrl?: string | null;
}

interface TestimonialsPlaceholderProps {
  showTitle?: boolean;
  className?: string;
  testimonials?: TestimonialItem[];
}

export function TestimonialsPlaceholder({
  showTitle = true,
  className = "",
  testimonials = [],
}: TestimonialsPlaceholderProps) {
  const hasItems = testimonials.length > 0;

  return (
    <div className={`shell max-w-6xl ${className}`}>
      {showTitle && (
        <SectionTitle
          eyebrow="Depoimentos Reais"
          title="O que dizem os nossos clientes"
          subtitle="Histórias de proprietários, investidores e inquilinos que confiam no nosso trabalho."
          align="center"
        />
      )}

      {hasItems ? (
        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {testimonials.map((item) => (
            <div
              key={item.id}
              className="flex flex-col justify-between rounded-3xl border border-[var(--gold-light)] bg-white p-7 shadow-xs hover:shadow-md transition-shadow"
            >
              <div className="space-y-4">
                <div className="flex size-10 items-center justify-center rounded-full bg-[var(--surface-muted)] text-[var(--gold)]">
                  <Quote size={20} />
                </div>
                <p className="text-sm md:text-base text-[var(--ink)] leading-relaxed italic">
                  &ldquo;{item.text}&rdquo;
                </p>
              </div>

              <div className="mt-6 flex items-center gap-3.5 border-t border-[var(--border,#f0ede6)] pt-4">
                <div className="size-11 rounded-full bg-[var(--plum)]/10 text-[var(--plum)] font-bold flex items-center justify-center text-sm shrink-0 overflow-hidden border border-[var(--gold-light)]">
                  {item.avatarUrl ? (
                    <Image
                      src={item.avatarUrl}
                      alt={item.clientName}
                      width={44}
                      height={44}
                      className="w-full h-full object-cover"
                      unoptimized
                    />
                  ) : (
                    item.clientName.slice(0, 2).toUpperCase()
                  )}
                </div>
                <div>
                  <h4 className="font-bold text-sm text-[var(--plum)]">
                    {item.clientName}
                  </h4>
                  {item.role && (
                    <p className="text-xs text-[var(--ink-soft)] font-medium">
                      {item.role}
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="rounded-3xl border border-[var(--gold-light)] bg-white p-8 md:p-12 shadow-xs text-center space-y-4 max-w-4xl mx-auto">
          <div className="inline-flex size-14 items-center justify-center rounded-full bg-[var(--plum)] text-[var(--gold-light)] mb-2 shadow-xs">
            <MessageSquareText size={26} />
          </div>
          <h3 className="display text-2xl md:text-3xl text-[var(--plum)] font-bold">
            Em breve, depoimentos reais de clientes da Corretora Val
          </h3>
          <p className="text-sm text-[var(--ink-soft)] max-w-xl mx-auto leading-relaxed">
            Estamos reunindo os relatos e histórias de clientes que acompanham
            nossa trajetória ao longo dos anos. Todas as avaliações serão
            publicadas mediante autorização formal e expressa.
          </p>
          <div className="pt-4 flex items-center justify-center gap-2 text-xs font-bold text-[var(--gold)] uppercase tracking-wider">
            <ShieldCheck size={16} /> Compromisso com transparência e
            autenticidade
          </div>
        </div>
      )}
    </div>
  );
}
