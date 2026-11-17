export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || "https://corretoraval.com.br";

export const DEFAULT_OG_IMAGE = {
  url: `${SITE_URL}/images/institutional/corretora-val-logo-banner.png`,
  width: 1200,
  height: 630,
  alt: "Corretora Val | Imóveis e Administração em Balneário Camboriú e Camboriú",
};

export interface PropertyMetadataInput {
  title?: string | null;
  summary?: string | null;
  description?: string | null;
  propertyType?: string | null;
  bedrooms?: number | null;
  purpose?: string | null;
  neighborhood?: string | null;
  city?: string | null;
  code?: string | null;
}

/**
 * Monta o título padronizado do imóvel para SEO:
 * Padrão: "Apartamento 3 dormitórios para alugar no Centro, Camboriú | Corretora Val"
 */
export function buildPropertyTitle(property: PropertyMetadataInput): string {
  const tipo = property.propertyType?.trim() || "Imóvel";
  const bedroomsCount = property.bedrooms ?? 0;
  const quartos =
    bedroomsCount > 0
      ? ` ${bedroomsCount} dormitório${bedroomsCount > 1 ? "s" : ""}`
      : "";

  let finalidadeText = "à venda";
  if (property.purpose === "LOCACAO_ANUAL") {
    finalidadeText = "para alugar";
  } else if (property.purpose === "TEMPORADA") {
    finalidadeText = "para temporada";
  } else if (property.purpose === "VENDA") {
    finalidadeText = "para comprar";
  }

  const neighborhood = property.neighborhood?.trim();
  const city = property.city?.trim() || "Balneário Camboriú";
  const local = neighborhood ? `no ${neighborhood}, ${city}` : `em ${city}`;

  return `${tipo}${quartos} ${finalidadeText} ${local} | Corretora Val`;
}

/**
 * Monta a meta description padronizada do imóvel (até 155 caracteres)
 */
export function buildPropertyDescription(
  property: PropertyMetadataInput,
): string {
  if (
    property.summary &&
    property.summary.trim().length >= 30 &&
    property.summary.trim().length <= 155
  ) {
    return property.summary.trim();
  }

  const tipo = property.propertyType?.trim() || "imóvel";
  const bedroomsCount = property.bedrooms ?? 0;
  const quartos =
    bedroomsCount > 0
      ? ` com ${bedroomsCount} dormitório${bedroomsCount > 1 ? "s" : ""}`
      : "";

  let finalidade = "venda";
  if (property.purpose === "LOCACAO_ANUAL") {
    finalidade = "locação anual";
  } else if (property.purpose === "TEMPORADA") {
    finalidade = "aluguel de temporada";
  }

  const neighborhood = property.neighborhood?.trim();
  const city = property.city?.trim() || "Balneário Camboriú";
  const local = neighborhood
    ? `no bairro ${neighborhood} em ${city}`
    : `em ${city}`;

  const desc =
    `Confira este ${tipo.toLowerCase()}${quartos} para ${finalidade} ${local}. Atendimento exclusivo e seguro com a Corretora Val. Agende uma visita!`.slice(
      0,
      155,
    );

  return desc;
}

/**
 * Gera texto alternativo (alt) descritivo e contextual para fotos de imóveis
 * Ex.: "Sala do apartamento de 3 dormitórios no Centro de Camboriú"
 */
export function buildPropertyImageAlt(
  property: PropertyMetadataInput,
  photoIndex = 0,
  isCover = false,
  customAlt?: string | null,
): string {
  if (customAlt && customAlt.trim().length > 5) {
    return customAlt.trim();
  }

  const tipo = property.propertyType?.trim() || "Imóvel";
  const bedroomsCount = property.bedrooms ?? 0;
  const quartos =
    bedroomsCount > 0
      ? ` de ${bedroomsCount} dormitório${bedroomsCount > 1 ? "s" : ""}`
      : "";

  const neighborhood = property.neighborhood?.trim();
  const city = property.city?.trim() || "Balneário Camboriú";
  const local = neighborhood ? `no ${neighborhood} em ${city}` : `em ${city}`;

  if (isCover || photoIndex === 0) {
    let finalidade = "à venda";
    if (property.purpose === "LOCACAO_ANUAL") finalidade = "para alugar";
    if (property.purpose === "TEMPORADA") finalidade = "para temporada";
    return `Fachada e detalhes do ${tipo.toLowerCase()}${quartos} ${finalidade} ${local} - Corretora Val`;
  }

  return `Ambiente ${photoIndex + 1} do ${tipo.toLowerCase()}${quartos} ${local} - Corretora Val`;
}

/**
 * Constrói URL canônica absoluta sem parâmetros de busca duplicados
 */
export function buildCanonicalUrl(pathname: string): string {
  const cleanPath = pathname.startsWith("/") ? pathname : `/${pathname}`;
  if (cleanPath === "/") {
    return SITE_URL;
  }
  return `${SITE_URL}${cleanPath.replace(/\/$/, "")}`;
}
