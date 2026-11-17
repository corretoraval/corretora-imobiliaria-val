import { SITE_URL } from "@/lib/seo";

export function JsonLd({ data }: { data: Record<string, unknown> }) {
  return (
    <script
      type="application/ld+json"
      // biome-ignore lint/security/noDangerouslySetInnerHtml: Schema JSON-LD serializado de forma segura no servidor
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

export interface RealEstateAgentInput {
  brandName?: string | null;
  phone?: string | null;
  email?: string | null;
  address?: string | null;
  creci?: string | null;
  instagramUrl?: string | null;
}

export function generateRealEstateAgentSchema(
  settings: RealEstateAgentInput = {},
) {
  return {
    "@context": "https://schema.org",
    "@type": "RealEstateAgent",
    name: settings.brandName || "Corretora Val",
    alternateName: "Valdete Gonçalves de Melo - Corretora de Imóveis",
    url: SITE_URL,
    logo: `${SITE_URL}/images/institutional/corretora-val-logo-banner.png`,
    image: `${SITE_URL}/images/institutional/corretora-val-logo-banner.png`,
    telephone: settings.phone || "(47) 97400-7391",
    ...(settings.email ? { email: settings.email } : {}), // TODO: configurar e-mail público institucional no painel admin
    address: {
      "@type": "PostalAddress",
      // TODO: preencher rua e número completos nas configurações do site para endereço exato
      streetAddress: settings.address || "Balneário Camboriú",
      addressLocality: "Balneário Camboriú",
      addressRegion: "SC",
      addressCountry: "BR",
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: -26.9926,
      longitude: -48.6353,
    },
    areaServed: [
      {
        "@type": "AdministrativeArea",
        name: "Balneário Camboriú",
      },
      {
        "@type": "AdministrativeArea",
        name: "Camboriú",
      },
    ],
    identifier: settings.creci || "CRECI/SC 56372-F",
    priceRange: "$$",
    sameAs: settings.instagramUrl ? [settings.instagramUrl] : [],
  };
}

export interface PropertySchemaInput {
  title: string;
  summary?: string | null;
  description?: string | null;
  propertyType?: string | null;
  purpose?: string | null;
  city: string;
  neighborhood?: string | null;
  address?: string | null;
  addressVisibility?: string | null;
  salePrice?: number | null;
  monthlyRent?: number | null;
  dailyRate?: number | null;
  bedrooms?: number | null;
  bathrooms?: number | null;
  parkingSpaces?: number | null;
  privateArea?: number | null;
  slug: string;
  photos?: Array<{ url: string }>;
}

export function generatePropertySchema(property: PropertySchemaInput) {
  const isRent = property.purpose === "LOCACAO_ANUAL";
  const isSeason = property.purpose === "TEMPORADA";
  const price = isRent
    ? property.monthlyRent
    : isSeason
      ? property.dailyRate
      : property.salePrice;

  const isApartment =
    property.propertyType?.toLowerCase().includes("apart") ||
    property.propertyType?.toLowerCase().includes("flat") ||
    property.propertyType?.toLowerCase().includes("studio");

  const schemaType = isApartment ? "Apartment" : "SingleFamilyResidence";

  return {
    "@context": "https://schema.org",
    "@type": schemaType,
    name: property.title,
    description: property.summary || property.description || property.title,
    url: `${SITE_URL}/imoveis/${encodeURIComponent(property.slug)}`,
    image: property.photos?.map((p) => p.url) || [],
    address: {
      "@type": "PostalAddress",
      streetAddress:
        property.addressVisibility === "EXATA" && property.address
          ? property.address
          : property.neighborhood
            ? `${property.neighborhood}, ${property.city}`
            : property.city,
      addressLocality: property.city,
      addressRegion: "SC",
      addressCountry: "BR",
    },
    ...(property.bedrooms ? { numberOfRooms: property.bedrooms } : {}),
    ...(property.bathrooms
      ? { numberOfBathroomsTotal: property.bathrooms }
      : {}),
    ...(property.privateArea
      ? {
          floorSize: {
            "@type": "QuantitativeValue",
            value: property.privateArea,
            unitCode: "MTK",
          },
        }
      : {}),
    ...(price
      ? {
          offers: {
            "@type": "Offer",
            price: price,
            priceCurrency: "BRL",
            availability: "https://schema.org/InStock",
            url: `${SITE_URL}/imoveis/${encodeURIComponent(property.slug)}`,
          },
        }
      : {}),
  };
}
