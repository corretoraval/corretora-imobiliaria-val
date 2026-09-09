"use client";

import { ChevronLeft, ChevronRight, Expand, Home, X } from "lucide-react";
import Image from "next/image";
import { useEffect, useState } from "react";

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

  // Close lightbox on Escape key
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") setLightboxOpen(false);
      if (e.key === "ArrowRight") nextPhoto();
      if (e.key === "ArrowLeft") prevPhoto();
    }
    if (lightboxOpen) {
      window.addEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "hidden";
    }
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "unset";
    };
  }, [lightboxOpen, photos.length]);

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

  function nextPhoto() {
    setSelectedIndex((prev) => (prev + 1) % photos.length);
  }

  function prevPhoto() {
    setSelectedIndex((prev) => (prev - 1 + photos.length) % photos.length);
  }

  return (
    <div className="space-y-3">
      {/* Imagem Principal */}
      <div className="group relative aspect-[16/10] w-full overflow-hidden rounded-3xl bg-neutral-950 shadow-xl sm:aspect-[16/9]">
        <Image
          src={currentPhoto.url}
          alt={currentPhoto.alt || `${title} - Foto ${selectedIndex + 1}`}
          fill
          priority
          sizes="(max-width: 1024px) 100vw, 70vw"
          className="object-cover transition-all duration-300"
        />

        {/* Gradiente de proteção para controles */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-black/30 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity" />

        {/* Botão de Expandir / Lightbox */}
        <button
          type="button"
          onClick={() => setLightboxOpen(true)}
          aria-label="Ver fotos em tela cheia"
          className="interactive absolute right-4 top-4 flex items-center gap-2 rounded-full bg-black/60 px-3.5 py-2 text-xs font-bold text-white backdrop-blur-md hover:bg-black/80 transition-all"
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
              className="interactive absolute left-4 top-1/2 -translate-y-1/2 flex h-10 w-10 items-center justify-center rounded-full bg-black/50 text-white backdrop-blur-md hover:bg-black/80 transition-all opacity-0 group-hover:opacity-100"
            >
              <ChevronLeft size={22} />
            </button>
            <button
              type="button"
              onClick={nextPhoto}
              aria-label="Próxima foto"
              className="interactive absolute right-4 top-1/2 -translate-y-1/2 flex h-10 w-10 items-center justify-center rounded-full bg-black/50 text-white backdrop-blur-md hover:bg-black/80 transition-all opacity-0 group-hover:opacity-100"
            >
              <ChevronRight size={22} />
            </button>
          </>
        )}

        {/* Indicador de fotos */}
        {photos.length > 1 && (
          <div className="absolute bottom-4 left-4 rounded-full bg-black/60 px-3 py-1 text-xs font-semibold text-white/90 backdrop-blur-md">
            {selectedIndex + 1} / {photos.length}
          </div>
        )}
      </div>

      {/* Miniaturas */}
      {photos.length > 1 && (
        <div className="flex gap-2.5 overflow-x-auto pb-2 scrollbar-thin">
          {photos.map((photo, index) => (
            <button
              key={photo.url || photo.id || index}
              type="button"
              onClick={() => setSelectedIndex(index)}
              className={`relative h-20 w-28 shrink-0 overflow-hidden rounded-xl border-2 transition-all ${
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
          {/* Fechar */}
          <button
            type="button"
            onClick={() => setLightboxOpen(false)}
            aria-label="Fechar galeria"
            className="interactive absolute right-6 top-6 z-10 flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 transition-all"
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
                className="interactive absolute left-6 top-1/2 -translate-y-1/2 flex h-12 w-12 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 transition-all"
              >
                <ChevronLeft size={28} />
              </button>
              <button
                type="button"
                onClick={nextPhoto}
                aria-label="Próxima foto"
                className="interactive absolute right-6 top-1/2 -translate-y-1/2 flex h-12 w-12 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 transition-all"
              >
                <ChevronRight size={28} />
              </button>
            </>
          )}

          {/* Imagem em tamanho grande */}
          <div className="relative h-[85vh] w-[90vw] max-w-6xl">
            <Image
              src={currentPhoto.url}
              alt={currentPhoto.alt || title}
              fill
              priority
              sizes="90vw"
              className="object-contain"
            />
          </div>

          {/* Contador de fotos no modal */}
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 rounded-full bg-white/10 px-4 py-1.5 text-sm font-semibold text-white backdrop-blur-md">
            {selectedIndex + 1} de {photos.length}
          </div>
        </div>
      )}
    </div>
  );
}
