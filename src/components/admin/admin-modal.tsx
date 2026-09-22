"use client";

import { X } from "lucide-react";
import { type ReactNode, useEffect, useId, useRef } from "react";

type AdminModalSize = "md" | "lg" | "xl" | "2xl" | "4xl";

export interface AdminModalProps {
  /** Se o modal está visível */
  isOpen: boolean;
  /** Callback acionado ao fechar (ESC, backdrop ou botão X) */
  onClose: () => void;
  /** Título acessível exibido no cabeçalho e referenciado por aria-labelledby */
  title: string;
  /** Descrição opcional de apoio, referenciada por aria-describedby */
  description?: string;
  /** Conteúdo do formulário ou corpo do modal */
  children: ReactNode;
  /** Largura máxima no desktop (padrão: "xl") */
  size?: AdminModalSize;
}

const sizeClasses: Record<AdminModalSize, string> = {
  md: "sm:max-w-md",
  lg: "sm:max-w-lg",
  xl: "sm:max-w-xl",
  "2xl": "sm:max-w-2xl",
  "4xl": "sm:max-w-4xl",
};

/**
 * Componente modal acessível e responsivo para formulários do painel administrativo.
 *
 * Características:
 * - Acessibilidade: role="dialog", aria-modal="true", foco gerenciado (focus trap) e tecla ESC.
 * - Responsividade: ocupa a tela inteira em mobile com scroll interno; centralizado em desktop.
 * - Bloqueio de rolagem da página enquanto estiver aberto.
 */
export function AdminModal({
  isOpen,
  onClose,
  title,
  description,
  children,
  size = "xl",
}: AdminModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);
  const previousActiveElement = useRef<HTMLElement | null>(null);
  const titleId = useId();
  const descId = useId();

  // Guarda elemento focado anteriormente e bloqueia scroll do body
  useEffect(() => {
    if (!isOpen) return;

    previousActiveElement.current =
      document.activeElement as HTMLElement | null;
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    // Foca o primeiro elemento interativo dentro do modal após renderizar
    const timer = setTimeout(() => {
      if (modalRef.current) {
        const focusable = modalRef.current.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
        );
        if (focusable.length > 0) {
          focusable[0].focus();
        } else {
          modalRef.current.focus();
        }
      }
    }, 50);

    return () => {
      clearTimeout(timer);
      document.body.style.overflow = originalOverflow;
      if (
        previousActiveElement.current &&
        typeof previousActiveElement.current.focus === "function"
      ) {
        previousActiveElement.current.focus();
      }
    };
  }, [isOpen]);

  // Captura tecla Escape e implementa Focus Trap
  useEffect(() => {
    if (!isOpen) return;

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        event.stopPropagation();
        onClose();
        return;
      }

      if (event.key === "Tab" && modalRef.current) {
        const focusable = modalRef.current.querySelectorAll<HTMLElement>(
          'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
        );
        if (focusable.length === 0) return;

        const first = focusable[0];
        const last = focusable[focusable.length - 1];

        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first.focus();
        }
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      aria-describedby={description ? descId : undefined}
      aria-labelledby={titleId}
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-0 sm:p-4 lg:p-6"
      role="dialog"
    >
      {/* Backdrop com blur suave */}
      <div
        aria-hidden="true"
        className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
        onClick={onClose}
      />

      {/* Caixa do Modal */}
      <div
        ref={modalRef}
        tabIndex={-1}
        className={`relative flex flex-col w-full h-full sm:h-auto sm:max-h-[90vh] bg-[var(--surface,#ffffff)] shadow-2xl transition-all sm:rounded-3xl border border-[var(--border,#e8e3d9)] text-[var(--ink)] animate-in zoom-in-95 duration-200 ${sizeClasses[size]}`}
      >
        {/* Cabeçalho Fixo do Modal */}
        <div className="flex items-start justify-between border-b border-[var(--border,#f0ede6)] p-5 sm:px-8 sm:py-6 shrink-0 bg-[var(--surface,#ffffff)] sm:rounded-t-3xl">
          <div>
            <h2
              id={titleId}
              className="display text-2xl text-[var(--plum)] sm:text-3xl font-bold"
            >
              {title}
            </h2>
            {description && (
              <p
                id={descId}
                className="mt-1 text-xs sm:text-sm text-[var(--ink-soft)]"
              >
                {description}
              </p>
            )}
          </div>
          <button
            aria-label="Fechar modal"
            className="interactive -mr-2 -mt-1 p-2 rounded-full text-[var(--ink-soft)] hover:bg-gray-100 hover:text-[var(--plum)] focus:outline-hidden focus:ring-2 focus:ring-[var(--plum)]/30"
            onClick={onClose}
            type="button"
          >
            <X size={20} />
          </button>
        </div>

        {/* Corpo com Rolagem Interna */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-8">{children}</div>
      </div>
    </div>
  );
}
