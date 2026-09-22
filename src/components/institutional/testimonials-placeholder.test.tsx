import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { TestimonialsPlaceholder } from "./testimonials-placeholder";

afterEach(() => {
  cleanup();
});

describe("TestimonialsPlaceholder component", () => {
  it("renders fallback placeholder message when testimonials list is empty", () => {
    render(<TestimonialsPlaceholder testimonials={[]} />);

    expect(
      screen.getByText(/Em breve, depoimentos reais de clientes da Corretora Val/i),
    ).not.toBeNull();
    expect(
      screen.getByText(/Compromisso com transparência e autenticidade/i),
    ).not.toBeNull();
  });

  it("renders client testimonials cards when items are provided", () => {
    const mockTestimonials = [
      {
        id: "t1",
        clientName: "Márcia Oliveira",
        role: "Proprietária",
        text: "Atendimento humano e transparência em todas as negociações.",
        avatarUrl: null,
      },
      {
        id: "t2",
        clientName: "Roberto Fonseca",
        role: "Comprador",
        text: "Excelente assessoria na compra do meu imóvel.",
        avatarUrl: null,
      },
    ];

    render(<TestimonialsPlaceholder testimonials={mockTestimonials} />);

    expect(screen.getByText("Márcia Oliveira")).not.toBeNull();
    expect(screen.getByText("Proprietária")).not.toBeNull();
    expect(
      screen.getByText(/Atendimento humano e transparência em todas as negociações/i),
    ).not.toBeNull();

    expect(screen.getByText("Roberto Fonseca")).not.toBeNull();
    expect(screen.getByText("Comprador")).not.toBeNull();

    // Fallback message should NOT be displayed
    expect(
      screen.queryByText(/Em breve, depoimentos reais de clientes da Corretora Val/i),
    ).toBeNull();
  });
});
