"use client";

import { ChevronLeft, ChevronRight, Expand, Home, X } from "lucide-react";
import Image from "next/image";
import { useCallback, useEffect, useState } from "react";

interface PropertyGalleryProps {
  title: string;
  photos: Array<{
    id?: string;
    url: string;
    alt?: string | null;
    isCover?: boolean;
    position?: number;
  }>;
}

export function PropertyGallery({ title, photos }: PropertyGalleryProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);

  const nextPhoto = useCallback(() => {
    setSelectedIndex((prev) => (prev + 1) % photos.length);
  }, [photos.length]);

  const prevPhoto = useCallback(() => {
    setSelectedIndex((prev) => (prev - 1 + photos.length) % photos.length);
  }, [photos.length]);

  // Close lightbox on Escape key
  useEffect(() => {
    if (!lightboxOpen) return;

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") setLightboxOpen(false);
      if (e.key === "ArrowRight") nextPhoto();
      if (e.key === "ArrowLeft") prevPhoto();
    }

    window.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = "hidden";

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "unset";
    };
  }, [lightboxOpen, nextPhoto, prevPhoto]);

  if (!photos || photos.length === 0) {
    return (
      <div className="relative flex aspect-[16/9] w-full items-center justify-center overflow-hidden rounded-3xl bg-gradient-to-br from-[var(--plum)] to-[var(--plum-bright)] text-white shadow-xl">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_30%,rgba(216,189,130,0.3),transparent_60%)]" />
        <div className="relative text-center">
          <Home className="mx-auto mb-3 opacity-60" size={56} />
          <p className="text-sm font-bold tracking-widest uppercase text-[var(--gold-light)]">
            Corretora Val
          </p>
          <p className="mt-1 text-xs text-white/70">Fotos sob consulta</p>
        </div>
      </div>
    );
  }

  const currentPhoto = photos[selectedIndex] || photos[0];

  return (
    <div className="space-y-3 w-full min-w-0 max-w-full">
      {/* Imagem Principal com Contenção e Fundo Desfocado */}
      <div className="group relative h-[300px] sm:h-[400px] md:h-[460px] lg:h-[500px] xl:h-[540px] max-h-[70vh] w-full max-w-full overflow-hidden rounded-3xl bg-neutral-950 shadow-xl">
        {/* Fundo Desfocado da Própria Foto para Preenchimento Elegante */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <Image
            src={currentPhoto.url}
            alt=""
            fill
            sizes="100vw"
            className="scale-125 object-cover opacity-35 blur-2xl filter"
            aria-hidden="true"
            priority
          />
          <div className="absolute inset-0 bg-neutral-950/40 backdrop-blur-xs" />
        </div>

        {/* Imagem Principal Preservando 100% dos Ambientes sem Cortes */}
        <Image
          src={currentPhoto.url}
          alt={currentPhoto.alt || `${title} - Foto ${selectedIndex + 1}`}
          fill
          priority
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 100vw, 850px"
          className="relative z-10 object-contain p-1 sm:p-2 transition-all duration-300"
        />

        {/* Gradiente de proteção para controles */}
        <div className="absolute inset-0 z-20 bg-gradient-to-t from-black/60 via-transparent to-black/30 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity" />

        {/* Botão de Expandir / Lightbox */}
        <button
          type="button"
          onClick={() => setLightboxOpen(true)}
          aria-label="Ver fotos em tela cheia"
          className="interactive absolute right-4 top-4 z-30 flex items-center gap-2 rounded-full bg-black/65 px-3.5 py-2 text-xs font-bold text-white backdrop-blur-md hover:bg-black/85 transition-all shadow-md"
        >
          <Expand size={14} />
          <span>Ver todas as fotos ({photos.length})</span>
        </button>

        {/* Setas de navegação */}
        {photos.length > 1 && (
          <>
            <button
              type="button"
              onClick={prevPhoto}
              aria-label="Foto anterior"
              className="interactive absolute left-4 top-1/2 -translate-y-1/2 z-30 flex h-10 w-10 items-center justify-center rounded-full bg-black/60 text-white backdrop-blur-md hover:bg-black/85 transition-all opacity-90 sm:opacity-0 group-hover:opacity-100 shadow-md"
            >
              <ChevronLeft size={22} />
            </button>
            <button
              type="button"
              onClick={nextPhoto}
              aria-label="Próxima foto"
              className="interactive absolute right-4 top-1/2 -translate-y-1/2 z-30 flex h-10 w-10 items-center justify-center rounded-full bg-black/60 text-white backdrop-blur-md hover:bg-black/85 transition-all opacity-90 sm:opacity-0 group-hover:opacity-100 shadow-md"
            >
              <ChevronRight size={22} />
            </button>
          </>
        )}

        {/* Indicador de fotos */}
        {photos.length > 1 && (
          <div className="absolute bottom-4 left-4 z-30 rounded-full bg-black/65 px-3 py-1 text-xs font-semibold text-white/95 backdrop-blur-md shadow-md">
            {selectedIndex + 1} / {photos.length}
          </div>
        )}
      </div>

      {/* Miniaturas */}
      {photos.length > 1 && (
        <div className="w-full min-w-0 max-w-full flex gap-2.5 overflow-x-auto pb-2 scrollbar-thin">
          {photos.map((photo, index) => (
            <button
              key={photo.url || photo.id || index}
              type="button"
              onClick={() => setSelectedIndex(index)}
              className={`relative h-20 w-28 shrink-0 overflow-hidden rounded-xl border-2 transition-all bg-neutral-900 ${
                selectedIndex === index
                  ? "border-[var(--gold)] ring-2 ring-[var(--gold)]/40 scale-[1.02]"
                  : "border-transparent opacity-70 hover:opacity-100"
              }`}
            >
              <Image
                src={photo.url}
                alt={photo.alt || `Miniatura ${index + 1}`}
                fill
                sizes="120px"
                className="object-cover"
              />
            </button>
          ))}
        </div>
      )}

      {/* Modal Lightbox em Tela Cheia */}
      {lightboxOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 p-4 backdrop-blur-md">
          {/* Fundo Desfocado no Modal */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <Image
              src={currentPhoto.url}
              alt=""
              fill
              sizes="100vw"
              className="scale-125 object-cover opacity-25 blur-3xl filter"
              aria-hidden="true"
            />
            <div className="absolute inset-0 bg-black/70" />
          </div>

          {/* Fechar */}
          <button
            type="button"
            onClick={() => setLightboxOpen(false)}
            aria-label="Fechar galeria"
            className="interactive absolute right-6 top-6 z-20 flex h-11 w-11 items-center justify-center rounded-full bg-white/15 text-white hover:bg-white/25 transition-all backdrop-blur-md"
          >
            <X size={24} />
          </button>

          {/* Navegação no modal */}
          {photos.length > 1 && (
            <>
              <button
                type="button"
                onClick={prevPhoto}
                aria-label="Foto anterior"
                className="interactive absolute left-6 top-1/2 -translate-y-1/2 z-20 flex h-12 w-12 items-center justify-center rounded-full bg-white/15 text-white hover:bg-white/25 transition-all backdrop-blur-md"
              >
                <ChevronLeft size={28} />
              </button>
              <button
                type="button"
                onClick={nextPhoto}
                aria-label="Próxima foto"
                className="interactive absolute right-6 top-1/2 -translate-y-1/2 z-20 flex h-12 w-12 items-center justify-center rounded-full bg-white/15 text-white hover:bg-white/25 transition-all backdrop-blur-md"
              >
                <ChevronRight size={28} />
              </button>
            </>
          )}

          {/* Imagem em tamanho grande com object-contain */}
          <div className="relative z-10 h-[80vh] w-[92vw] max-w-6xl">
            <Image
              src={currentPhoto.url}
              alt={currentPhoto.alt || title}
              fill
              priority
              sizes="95vw"
              className="object-contain"
            />
          </div>

          {/* Contador de fotos no modal */}
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 rounded-full bg-white/15 px-4 py-1.5 text-sm font-semibold text-white backdrop-blur-md border border-white/10">
            {selectedIndex + 1} de {photos.length}
          </div>
        </div>
      )}
    </div>
  );
}
