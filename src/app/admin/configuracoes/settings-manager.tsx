"use client";

import { LoaderCircle, Palette, Save, Settings2 } from "lucide-react";
import { type FormEvent, useCallback, useEffect, useState } from "react";

// ── Tipos ─────────────────────────────────────────────────────────────────────
type Settings = {
  brandName: string;
  tagline: string;
  phone: string | null;
  whatsapp: string | null;
  email: string | null;
  address: string | null;
  instagramUrl: string | null;
  creci: string;
  themePreset: string;
  primaryColor: string;
  primaryHover: string;
  accentColor: string;
  accentLightColor: string;
  backgroundColor: string;
  titleFont: string;
  bodyFont: string;
};

// ── Catálogo de presets ───────────────────────────────────────────────────────
const COLOR_PRESETS = [
  {
    id: "ametista-ouro",
    name: "Ametista & Ouro Real",
    primaryColor: "#35104f",
    primaryHover: "#4a1768",
    accentColor: "#b58a3a",
    accentLightColor: "#d8bd82",
    backgroundColor: "#f8f5ef",
  },
  {
    id: "ardosia-terracota",
    name: "Ardósia & Terracota",
    primaryColor: "#2c3e50",
    primaryHover: "#3d5166",
    accentColor: "#c0392b",
    accentLightColor: "#e07b71",
    backgroundColor: "#f9f7f4",
  },
  {
    id: "verde-champanhe",
    name: "Verde Floresta & Champanhe",
    primaryColor: "#1a3a2a",
    primaryHover: "#2a5040",
    accentColor: "#c5a55a",
    accentLightColor: "#dfc896",
    backgroundColor: "#f5f3ee",
  },
  {
    id: "marinho-coral",
    name: "Azul Marinho & Coral",
    primaryColor: "#1a2e4a",
    primaryHover: "#2a4468",
    accentColor: "#e8704a",
    accentLightColor: "#f0a08a",
    backgroundColor: "#f7f5f2",
  },
  {
    id: "grafite-cobre",
    name: "Grafite & Cobre",
    primaryColor: "#2d2d2d",
    primaryHover: "#444444",
    accentColor: "#b87333",
    accentLightColor: "#d4a06a",
    backgroundColor: "#f6f4f1",
  },
] as const;

const TITLE_FONTS = [
  { id: "cormorant", name: "Cormorant Garamond", style: "Georgia, serif" },
  {
    id: "playfair",
    name: "Playfair Display",
    style: "'Playfair Display', Georgia, serif",
  },
  { id: "lora", name: "Lora", style: "'Lora', Georgia, serif" },
  {
    id: "dm-serif",
    name: "DM Serif Display",
    style: "'DM Serif Display', Georgia, serif",
  },
] as const;

const BODY_FONTS = [
  { id: "manrope", name: "Manrope", style: "'Manrope', Arial, sans-serif" },
  { id: "inter", name: "Inter", style: "'Inter', Arial, sans-serif" },
  { id: "outfit", name: "Outfit", style: "'Outfit', Arial, sans-serif" },
  {
    id: "plus-jakarta",
    name: "Plus Jakarta Sans",
    style: "'Plus Jakarta Sans', Arial, sans-serif",
  },
] as const;

// ── Helpers ───────────────────────────────────────────────────────────────────
function emptyToNull(value: string) {
  const trimmed = value.trim();
  return trimmed || null;
}

function Input({
  label,
  value,
  onChange,
  type = "text",
}: {
  label: string;
  value: string | null;
  onChange: (value: string) => void;
  type?: "text" | "email" | "url";
}) {
  return (
    <label className="grid gap-1 text-sm font-bold text-[var(--plum)]">
      {label}
      <input
        className="rounded-lg border bg-white px-3 py-2 font-normal text-[var(--ink)]"
        onChange={(event) => onChange(event.target.value)}
        type={type}
        value={value ?? ""}
      />
    </label>
  );
}

// ── Componente principal ──────────────────────────────────────────────────────
export function SettingsManager() {
  const [settings, setSettings] = useState<Settings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"identity" | "design">("identity");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/admin/conteudo", {
        cache: "no-store",
      });
      if (!response.ok)
        throw new Error("Não foi possível carregar as configurações.");
      const data = await response.json();
      setSettings(data.settings);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Ocorreu um erro.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function saveSettings(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!settings) return;
    setSaving(true);
    setMessage(null);
    try {
      const response = await fetch("/api/admin/conteudo", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "settings", settings }),
      });
      if (!response.ok)
        throw new Error("Não foi possível salvar as configurações.");
      setMessage(
        "Configurações salvas. As alterações serão refletidas no site.",
      );
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Ocorreu um erro.");
    } finally {
      setSaving(false);
    }
  }

  function applyColorPreset(presetId: string) {
    const preset = COLOR_PRESETS.find((p) => p.id === presetId);
    if (!preset || !settings) return;
    setSettings({
      ...settings,
      themePreset: preset.id,
      primaryColor: preset.primaryColor,
      primaryHover: preset.primaryHover,
      accentColor: preset.accentColor,
      accentLightColor: preset.accentLightColor,
      backgroundColor: preset.backgroundColor,
    });
  }

  if (loading)
    return (
      <main className="grid min-h-[50vh] place-items-center">
        <p className="flex items-center gap-2 text-sm text-[var(--ink-soft)]">
          <LoaderCircle className="animate-spin" size={18} /> Carregando
          configurações…
        </p>
      </main>
    );

  return (
    <main className="p-6 sm:p-10">
      <p className="eyebrow">Configurações</p>
      <h1 className="display mt-3 text-4xl text-[var(--plum)] sm:text-5xl">
        Configurações do site
      </h1>
      <p className="mt-3 max-w-2xl text-[var(--ink-soft)]">
        Edite as configurações globais e o tema visual do site.
      </p>

      {/* Tabs */}
      <div className="mt-8 flex gap-1 rounded-xl border bg-[var(--surface-muted)] p-1 w-fit">
        <button
          type="button"
          onClick={() => setActiveTab("identity")}
          className={`interactive flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-bold transition-colors ${
            activeTab === "identity"
              ? "bg-white text-[var(--plum)] shadow-sm"
              : "text-[var(--ink-soft)] hover:text-[var(--plum)]"
          }`}
        >
          <Settings2 size={15} />
          Identidade
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("design")}
          className={`interactive flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-bold transition-colors ${
            activeTab === "design"
              ? "bg-white text-[var(--plum)] shadow-sm"
              : "text-[var(--ink-soft)] hover:text-[var(--plum)]"
          }`}
        >
          <Palette size={15} />
          Design
        </button>
      </div>

      <section className="mt-6">
        {settings ? (
          <form onSubmit={saveSettings}>
            {/* ── ABA IDENTIDADE ─────────────────────────────────────────── */}
            {activeTab === "identity" && (
              <div className="grid gap-4 rounded-2xl border bg-[var(--surface)] p-5 shadow-[0_8px_22px_rgba(53,16,79,0.05)] sm:p-7 md:grid-cols-2">
                <Input
                  label="Nome da marca"
                  value={settings.brandName}
                  onChange={(value) =>
                    setSettings({ ...settings, brandName: value })
                  }
                />
                <Input
                  label="Slogan"
                  value={settings.tagline}
                  onChange={(value) =>
                    setSettings({ ...settings, tagline: value })
                  }
                />
                <Input
                  label="Telefone"
                  value={settings.phone}
                  onChange={(value) =>
                    setSettings({ ...settings, phone: emptyToNull(value) })
                  }
                />
                <Input
                  label="WhatsApp (somente números)"
                  value={settings.whatsapp}
                  onChange={(value) =>
                    setSettings({ ...settings, whatsapp: emptyToNull(value) })
                  }
                />
                <Input
                  label="E-mail"
                  type="email"
                  value={settings.email}
                  onChange={(value) =>
                    setSettings({ ...settings, email: emptyToNull(value) })
                  }
                />
                <Input
                  label="CRECI"
                  value={settings.creci}
                  onChange={(value) =>
                    setSettings({ ...settings, creci: value })
                  }
                />
                <Input
                  label="Endereço"
                  value={settings.address}
                  onChange={(value) =>
                    setSettings({ ...settings, address: emptyToNull(value) })
                  }
                />
                <Input
                  label="Instagram"
                  type="url"
                  value={settings.instagramUrl}
                  onChange={(value) =>
                    setSettings({
                      ...settings,
                      instagramUrl: emptyToNull(value),
                    })
                  }
                />
              </div>
            )}

            {/* ── ABA DESIGN ─────────────────────────────────────────────── */}
            {activeTab === "design" && (
              <div className="grid gap-8 rounded-2xl border bg-[var(--surface)] p-5 shadow-[0_8px_22px_rgba(53,16,79,0.05)] sm:p-7">
                {/* Presets de cor */}
                <div>
                  <p className="text-sm font-bold text-[var(--plum)]">
                    Paleta de cores
                  </p>
                  <p className="mt-1 text-xs text-[var(--ink-soft)]">
                    Selecione um preset. Cores e tons são aplicados
                    automaticamente em todo o site.
                  </p>
                  <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    {COLOR_PRESETS.map((preset) => {
                      const isActive = settings.themePreset === preset.id;
                      return (
                        <button
                          key={preset.id}
                          type="button"
                          onClick={() => applyColorPreset(preset.id)}
                          className={`interactive flex items-center gap-3 rounded-xl border-2 p-3 text-left transition-all ${
                            isActive
                              ? "border-[var(--plum)] bg-[var(--surface-muted)]"
                              : "border-transparent bg-[var(--surface-muted)] hover:border-[var(--line)]"
                          }`}
                        >
                          {/* Círculos de preview */}
                          <div className="flex shrink-0 -space-x-2">
                            <span
                              className="size-8 rounded-full border-2 border-white shadow"
                              style={{ background: preset.primaryColor }}
                            />
                            <span
                              className="size-8 rounded-full border-2 border-white shadow"
                              style={{ background: preset.accentColor }}
                            />
                            <span
                              className="size-8 rounded-full border-2 border-white shadow"
                              style={{ background: preset.backgroundColor }}
                            />
                          </div>
                          <div className="min-w-0">
                            <p className="truncate text-xs font-bold text-[var(--ink)]">
                              {preset.name}
                            </p>
                            {isActive && (
                              <p className="text-xs text-[var(--gold)] font-semibold">
                                ✓ Ativo
                              </p>
                            )}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Fonte de título */}
                <div>
                  <label className="grid gap-2 text-sm font-bold text-[var(--plum)]">
                    Fonte de título
                    <select
                      className="rounded-lg border bg-white px-3 py-2 font-normal text-[var(--ink)]"
                      value={settings.titleFont}
                      onChange={(e) =>
                        setSettings({ ...settings, titleFont: e.target.value })
                      }
                    >
                      {TITLE_FONTS.map((f) => (
                        <option key={f.id} value={f.id}>
                          {f.name}
                        </option>
                      ))}
                    </select>
                  </label>
                  {/* Preview da fonte de título */}
                  <p
                    className="mt-3 text-3xl text-[var(--plum)]"
                    style={{
                      fontFamily:
                        TITLE_FONTS.find((f) => f.id === settings.titleFont)
                          ?.style ?? "Georgia, serif",
                    }}
                  >
                    Confiança que abre portas.
                  </p>
                </div>

                {/* Fonte de corpo */}
                <div>
                  <label className="grid gap-2 text-sm font-bold text-[var(--plum)]">
                    Fonte de corpo
                    <select
                      className="rounded-lg border bg-white px-3 py-2 font-normal text-[var(--ink)]"
                      value={settings.bodyFont}
                      onChange={(e) =>
                        setSettings({ ...settings, bodyFont: e.target.value })
                      }
                    >
                      {BODY_FONTS.map((f) => (
                        <option key={f.id} value={f.id}>
                          {f.name}
                        </option>
                      ))}
                    </select>
                  </label>
                  {/* Preview da fonte de corpo */}
                  <p
                    className="mt-3 text-sm text-[var(--ink-soft)] max-w-lg"
                    style={{
                      fontFamily:
                        BODY_FONTS.find((f) => f.id === settings.bodyFont)
                          ?.style ?? "Arial, sans-serif",
                    }}
                  >
                    Com uma trajetória no mercado imobiliário iniciada em 1990,
                    a Corretora Val une experiência, atendimento humano, gestão
                    responsável e compromisso real com o seu patrimônio.
                  </p>
                </div>
              </div>
            )}

            <button
              className="interactive mt-6 inline-flex items-center gap-2 rounded-full bg-[var(--gold)] px-5 py-3 text-sm font-extrabold text-[var(--plum)] hover:bg-[var(--gold-light)] disabled:opacity-60"
              disabled={saving}
              type="submit"
            >
              <Save size={17} /> {saving ? "Salvando…" : "Salvar configurações"}
            </button>
          </form>
        ) : (
          <p className="text-sm text-[var(--ink-soft)]">
            Nenhuma configuração encontrada.
          </p>
        )}

        {message && (
          <p
            className="mt-5 rounded-xl border bg-[var(--surface)] p-4 text-sm text-[var(--plum)]"
            role="status"
          >
            {message}
          </p>
        )}
      </section>
    </main>
  );
}
