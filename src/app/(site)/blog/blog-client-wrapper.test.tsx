import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { BlogClientWrapper } from "./blog-client-wrapper";

const mockPosts = [
  {
    id: "post-1",
    slug: "investimento-bc",
    title: "Guia de Investimento Imobiliário em Balneário Camboriú",
    summary: "Descubra por que a cidade possui alta valorização.",
    category: "Investimentos",
    authorName: "Corretora Val",
    readingTimeMinutes: 6,
    publishedAt: new Date("2026-08-01"),
  },
  {
    id: "post-2",
    slug: "locacao-anual",
    title: "5 Dicas para Preparar seu Imóvel para Locação Anual",
    summary: "Aumente a atratividade do seu patrimônio.",
    category: "Alugar",
    authorName: "Corretora Val",
    readingTimeMinutes: 4,
    publishedAt: new Date("2026-08-05"),
  },
  {
    id: "post-3",
    slug: "morar-em-camboriu",
    title: "Morar em Camboriú: Qualidade de Vida",
    summary: "Conheça as vantagens de residir na cidade vizinha.",
    category: "Comprar",
    authorName: "Corretora Val",
    readingTimeMinutes: 5,
    publishedAt: new Date("2026-08-10"),
  },
  {
    id: "post-4",
    slug: "dicas-proprietario",
    title: "Dicas ao Proprietário",
    summary: "Cuidados simples para valorizar seu imóvel.",
    category: "Dicas ao Proprietário",
    authorName: "Corretora Val",
    readingTimeMinutes: 4,
    publishedAt: new Date("2026-08-12"),
  },
];

afterEach(() => cleanup());

describe("BlogClientWrapper — sem flash de carregamento", () => {
  it("renderiza os posts iniciais imediatamente sem 'Carregando artigos...'", () => {
    render(<BlogClientWrapper initialPosts={mockPosts} />);

    // O texto de loading NÃO deve aparecer em momento algum
    expect(screen.queryByText(/Carregando artigos/i)).toBeNull();

    // Todos os 3 posts devem estar visíveis direto
    expect(
      screen.getByText(
        "Guia de Investimento Imobiliário em Balneário Camboriú",
      ),
    ).toBeTruthy();
    expect(
      screen.getByText("5 Dicas para Preparar seu Imóvel para Locação Anual"),
    ).toBeTruthy();
    expect(
      screen.getByText("Morar em Camboriú: Qualidade de Vida"),
    ).toBeTruthy();
  });

  it("filtra instantaneamente por categoria sem estado de loading", () => {
    render(<BlogClientWrapper initialPosts={mockPosts} />);

    // Clica em 'Investimentos'
    fireEvent.click(screen.getByRole("button", { name: /^investimentos$/i }));

    expect(screen.queryByText(/Carregando artigos/i)).toBeNull();
    expect(
      screen.getByText(
        "Guia de Investimento Imobiliário em Balneário Camboriú",
      ),
    ).toBeTruthy();
    expect(
      screen.queryByText("5 Dicas para Preparar seu Imóvel para Locação Anual"),
    ).toBeNull();
    expect(
      screen.queryByText("Morar em Camboriú: Qualidade de Vida"),
    ).toBeNull();

    // Clica em 'Alugar'
    fireEvent.click(screen.getByRole("button", { name: /^alugar$/i }));

    expect(screen.queryByText(/Carregando artigos/i)).toBeNull();
    expect(
      screen.getByText("5 Dicas para Preparar seu Imóvel para Locação Anual"),
    ).toBeTruthy();
    expect(
      screen.queryByText(
        "Guia de Investimento Imobiliário em Balneário Camboriú",
      ),
    ).toBeNull();

    // Volta para 'Todos'
    fireEvent.click(screen.getByRole("button", { name: /^todos$/i }));

    expect(
      screen.getByText(
        "Guia de Investimento Imobiliário em Balneário Camboriú",
      ),
    ).toBeTruthy();
    expect(
      screen.getByText("5 Dicas para Preparar seu Imóvel para Locação Anual"),
    ).toBeTruthy();
    expect(
      screen.getByText("Morar em Camboriú: Qualidade de Vida"),
    ).toBeTruthy();
  });

  it("filtra pelas novas categorias de conteúdo", () => {
    render(<BlogClientWrapper initialPosts={mockPosts} />);

    fireEvent.click(
      screen.getByRole("button", { name: /^dicas ao proprietário$/i }),
    );

    expect(screen.getAllByText("Dicas ao Proprietário").length).toBeGreaterThan(
      0,
    );
    expect(
      screen.queryByText(
        "Guia de Investimento Imobiliário em Balneário Camboriú",
      ),
    ).toBeNull();
  });

  it("filtra instantaneamente por texto no campo de busca sem loading", () => {
    render(<BlogClientWrapper initialPosts={mockPosts} />);

    const searchInput = screen.getByPlaceholderText(
      "Buscar artigos por palavra-chave ou tema...",
    );

    // Busca por 'Camboriú' — deve retornar post-1 e post-3
    fireEvent.change(searchInput, { target: { value: "Camboriú" } });

    expect(screen.queryByText(/Carregando artigos/i)).toBeNull();
    expect(
      screen.getByText(
        "Guia de Investimento Imobiliário em Balneário Camboriú",
      ),
    ).toBeTruthy();
    expect(
      screen.getByText("Morar em Camboriú: Qualidade de Vida"),
    ).toBeTruthy();
    expect(
      screen.queryByText("5 Dicas para Preparar seu Imóvel para Locação Anual"),
    ).toBeNull();

    // Busca sem resultado — deve mostrar "Nenhum artigo encontrado" e jamais loading
    fireEvent.change(searchInput, { target: { value: "xyz-inexistente" } });

    expect(screen.getByText("Nenhum artigo encontrado")).toBeTruthy();
    expect(screen.queryByText(/Carregando artigos/i)).toBeNull();
  });
});
