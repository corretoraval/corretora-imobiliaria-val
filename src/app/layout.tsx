import type { Metadata } from "next";
import {
  Cormorant_Garamond,
  DM_Serif_Display,
  Inter,
  Lora,
  Manrope,
  Outfit,
  Playfair_Display,
  Plus_Jakarta_Sans,
} from "next/font/google";
import { getSiteSettings } from "@/lib/site-content";
import type { ReactNode } from "react";
import "./globals.css";

// ── Fontes de título ─────────────────────────────────────────────────────────
const cormorant = Cormorant_Garamond({
  variable: "--font-cormorant",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
});

const lora = Lora({
  variable: "--font-lora",
  subsets: ["latin"],
});

const dmSerif = DM_Serif_Display({
  variable: "--font-dm-serif",
  subsets: ["latin"],
  weight: "400",
});

// ── Fontes de corpo ───────────────────────────────────────────────────────────
const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
});

const plusJakarta = Plus_Jakarta_Sans({
  variable: "--font-plus-jakarta",
  subsets: ["latin"],
});

// ── Mapa: chave do DB → variável CSS ─────────────────────────────────────────
const FONT_VAR: Record<string, string> = {
  cormorant: "var(--font-cormorant)",
  playfair: "var(--font-playfair)",
  lora: "var(--font-lora)",
  "dm-serif": "var(--font-dm-serif)",
  manrope: "var(--font-manrope)",
  inter: "var(--font-inter)",
  outfit: "var(--font-outfit)",
  "plus-jakarta": "var(--font-plus-jakarta)",
};

export const metadata: Metadata = {
  title: {
    default: "Corretora Val | Confiança que abre portas.",
    template: "%s | Corretora Val",
  },
  description:
    "Administração de imóveis, venda, locação anual e temporada em Balneário Camboriú e Camboriú.",
};

export default async function RootLayout({
  children,
}: {
  children: ReactNode;
}) {
  const cfg = await getSiteSettings();

  const titleFontFamily = FONT_VAR[cfg.titleFont] ?? "var(--font-cormorant)";
  const bodyFontFamily = FONT_VAR[cfg.bodyFont] ?? "var(--font-manrope)";

  const themeStyle = `
    :root {
      --plum: ${cfg.primaryColor};
      --plum-bright: ${cfg.primaryHover};
      --gold: ${cfg.accentColor};
      --gold-light: ${cfg.accentLightColor};
      --background: ${cfg.backgroundColor};
    }
    .display { font-family: ${titleFontFamily}, Georgia, serif; }
    body { font-family: ${bodyFontFamily}, Arial, sans-serif; }
  `;

  const fontVarClasses = [
    cormorant.variable,
    playfair.variable,
    lora.variable,
    dmSerif.variable,
    manrope.variable,
    inter.variable,
    outfit.variable,
    plusJakarta.variable,
  ].join(" ");

  return (
    <html lang="pt-BR" className={fontVarClasses}>
      {/* biome-ignore lint/security/noDangerouslySetInnerHtml: CSS de tema gerado no servidor, sem input do usuário */}
      <style dangerouslySetInnerHTML={{ __html: themeStyle }} />
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
