import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { AdminModal } from "./admin-modal";

afterEach(() => {
  cleanup();
  document.body.style.overflow = "";
});

describe("AdminModal Component", () => {
  it("não renderiza nada quando isOpen é false", () => {
    render(
      <AdminModal isOpen={false} onClose={vi.fn()} title="Título de Teste">
        <p>Conteúdo interno</p>
      </AdminModal>,
    );

    expect(screen.queryByRole("dialog")).toBeNull();
    expect(screen.queryByText("Conteúdo interno")).toBeNull();
  });

  it("renderiza corretamente com título e conteúdo quando isOpen é true", () => {
    render(
      <AdminModal
        isOpen={true}
        onClose={vi.fn()}
        title="Título de Teste"
        description="Descrição auxiliar"
      >
        <p>Conteúdo interno do modal</p>
      </AdminModal>,
    );

    const dialog = screen.getByRole("dialog");
    expect(dialog).not.toBeNull();
    expect(
      screen.getByRole("heading", { name: "Título de Teste" }),
    ).not.toBeNull();
    expect(screen.getByText("Descrição auxiliar")).not.toBeNull();
    expect(screen.getByText("Conteúdo interno do modal")).not.toBeNull();
  });

  it("chama onClose ao clicar no botão de fechar", () => {
    const handleClose = vi.fn();
    render(
      <AdminModal isOpen={true} onClose={handleClose} title="Modal Fechar">
        <p>Conteúdo</p>
      </AdminModal>,
    );

    const closeButton = screen.getByRole("button", { name: /fechar modal/i });
    fireEvent.click(closeButton);

    expect(handleClose).toHaveBeenCalledTimes(1);
  });

  it("chama onClose ao pressionar a tecla Escape", () => {
    const handleClose = vi.fn();
    render(
      <AdminModal isOpen={true} onClose={handleClose} title="Modal Escape">
        <p>Conteúdo</p>
      </AdminModal>,
    );

    fireEvent.keyDown(window, { key: "Escape" });
    expect(handleClose).toHaveBeenCalledTimes(1);
  });

  it("bloqueia o overflow do body quando aberto e restaura ao desmontar", () => {
    const { unmount } = render(
      <AdminModal isOpen={true} onClose={vi.fn()} title="Modal Scroll">
        <p>Conteúdo</p>
      </AdminModal>,
    );

    expect(document.body.style.overflow).toBe("hidden");

    unmount();
    expect(document.body.style.overflow).toBe("");
  });
});
