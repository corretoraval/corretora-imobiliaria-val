import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { PropertyMap } from "./property-map";

// Mock do componente interno que depende do Leaflet e window
vi.mock("./property-map-inner", () => ({
  default: () => <div data-testid="mock-map-inner">Mock Map</div>,
}));

afterEach(() => {
  cleanup();
});

describe("PropertyMap component", () => {
  it("não renderiza nada se visibility for OCULTA", () => {
    const { container } = render(
      <PropertyMap
        visibility="OCULTA"
        latitude={-26.9926}
        longitude={-48.6345}
        city="Balneário Camboriú"
        neighborhood="Centro"
        title="Apartamento Frente Mar"
      />,
    );

    expect(container.firstChild).toBeNull();
  });

  it("não renderiza nada se coordenadas latitude/longitude forem nulas", () => {
    const { container } = render(
      <PropertyMap
        visibility="EXATA"
        latitude={null}
        longitude={null}
        city="Balneário Camboriú"
        title="Apartamento Frente Mar"
      />,
    );

    expect(container.firstChild).toBeNull();
  });

  it("renderiza cabeçalho e badge de localização exata quando visibility for EXATA", async () => {
    render(
      <PropertyMap
        visibility="EXATA"
        latitude={-26.9926}
        longitude={-48.6345}
        city="Balneário Camboriú"
        neighborhood="Centro"
        address="Av. Atlântica, 2500"
        title="Apartamento Frente Mar"
      />,
    );

    expect(screen.getByRole("heading", { name: /localização/i })).not.toBeNull();
    expect(screen.getByText(/localização exata/i)).not.toBeNull();
    expect(
      screen.getByText(/av\. atlântica, 2500 — centro, balneário camboriú/i),
    ).not.toBeNull();
    expect(await screen.findByTestId("mock-map-inner")).not.toBeNull();
  });

  it("renderiza badge de região aproximada com mensagem explicativa quando visibility for APROXIMADA", async () => {
    render(
      <PropertyMap
        visibility="APROXIMADA"
        latitude={-26.9926}
        longitude={-48.6345}
        city="Balneário Camboriú"
        neighborhood="Barra Sul"
        title="Apartamento Frente Mar"
      />,
    );

    expect(screen.getByRole("heading", { name: /localização/i })).not.toBeNull();
    expect(screen.getByText(/região aproximada/i)).not.toBeNull();
    expect(
      screen.getByText(/por motivos de segurança e discrição aos proprietários/i),
    ).not.toBeNull();
    expect(await screen.findByTestId("mock-map-inner")).not.toBeNull();
  });

  it("renderiza pontos de referência se preenchidos", () => {
    render(
      <PropertyMap
        visibility="APROXIMADA"
        latitude={-26.9926}
        longitude={-48.6345}
        city="Balneário Camboriú"
        neighborhood="Barra Sul"
        pontosReferencia="A 100m da praia, próximo ao PZ Ecomall e supermercado BIG."
        title="Apartamento Frente Mar"
      />,
    );

    expect(
      screen.getByRole("heading", {
        name: /pontos de referência e proximidades/i,
      }),
    ).not.toBeNull();
    expect(
      screen.getByText(/a 100m da praia, próximo ao pz ecomall e supermercado big\./i),
    ).not.toBeNull();
  });
});
