import { beforeAll, beforeEach, describe, expect, it, vi } from "vitest";

// Mock do prisma
vi.mock("@/lib/prisma", () => {
  const lead = {
    create: vi.fn(),
    update: vi.fn(),
    count: vi.fn(),
  };
  const configuracaoSite = {
    findUnique: vi.fn(),
  };
  const campoContato = {
    findMany: vi.fn(),
  };
  return {
    prisma: {
      lead,
      configuracaoSite,
      campoContato,
    },
  };
});

// Mock do headers do Next.js
vi.mock("next/headers", () => ({
  headers: vi.fn().mockResolvedValue({
    get: (header: string) => {
      if (header === "x-forwarded-for") return "127.0.0.1";
      return null;
    },
  }),
}));

// Mock do serviço de email
const mockSendContactNotification = vi.fn();
vi.mock("@/lib/email", () => ({
  sendContactNotification: (...args: unknown[]) =>
    mockSendContactNotification(...args),
}));

let route: typeof import("./route");

type PrismaMock = {
  prisma: {
    lead: {
      create: ReturnType<typeof vi.fn>;
      update: ReturnType<typeof vi.fn>;
      count: ReturnType<typeof vi.fn>;
    };
    configuracaoSite: {
      findUnique: ReturnType<typeof vi.fn>;
    };
    campoContato: {
      findMany: ReturnType<typeof vi.fn>;
    };
  };
};

let prismaMock: PrismaMock;

beforeAll(async () => {
  prismaMock = (await import("@/lib/prisma")) as unknown as PrismaMock;
  route = await import("./route");
});

beforeEach(() => {
  vi.clearAllMocks();
  // Padrão: 0 envios recentes do IP (dentro do limite)
  prismaMock.prisma.lead.count.mockResolvedValue(0);
  // Padrão: campos básicos ativos
  prismaMock.prisma.campoContato.findMany.mockResolvedValue([
    { name: "name", label: "Nome completo", type: "text", required: true, isActive: true },
    { name: "email", label: "E-mail", type: "email", required: true, isActive: true },
    { name: "phone", label: "Telefone", type: "tel", required: true, isActive: true },
    { name: "message", label: "Mensagem", type: "textarea", required: false, isActive: true },
  ]);
  // Padrão: contactEmail configurado
  prismaMock.prisma.configuracaoSite.findUnique.mockResolvedValue({
    contactEmail: "corretoraval@example.com",
    whatsapp: "5547974007391",
  });
});

describe("POST /api/leads", () => {
  it("salva o lead antes de enviar e atualiza para 'sent' quando Resend tem sucesso", async () => {
    const createdLead = {
      id: "lead_123",
      name: "João Silva",
      email: "joao@example.com",
      phone: "(47) 99999-0000",
      createdAt: new Date(),
    };
    prismaMock.prisma.lead.create.mockResolvedValue(createdLead);
    mockSendContactNotification.mockResolvedValue({ ok: true, messageId: "msg_abc" });
    prismaMock.prisma.lead.update.mockResolvedValue({ ...createdLead, emailStatus: "sent" });

    const response = await route.POST(
      new Request("http://localhost/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: "João Silva",
          email: "joao@example.com",
          phone: "(47) 99999-0000",
          message: "Tenho interesse no imóvel",
        }),
      }),
    );

    expect(response.status).toBe(201);
    const body = await response.json();
    expect(body.success).toBe(true);
    expect(body.leadId).toBe("lead_123");

    // Verifica que o lead foi criado primeiro com emailStatus = pending
    expect(prismaMock.prisma.lead.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          name: "João Silva",
          email: "joao@example.com",
          phone: "(47) 99999-0000",
          emailStatus: "pending",
        }),
      }),
    );

    // Verifica chamada ao Resend
    expect(mockSendContactNotification).toHaveBeenCalledWith(
      expect.objectContaining({
        to: "corretoraval@example.com",
        clientName: "João Silva",
        clientEmail: "joao@example.com",
      }),
    );

    // Verifica atualização para sent
    expect(prismaMock.prisma.lead.update).toHaveBeenCalledWith({
      where: { id: "lead_123" },
      data: { emailStatus: "sent" },
    });
  });

  it("salva o lead com emailStatus='no_config' e NÃO chama Resend quando contactEmail estiver ausente", async () => {
    prismaMock.prisma.configuracaoSite.findUnique.mockResolvedValue({
      contactEmail: null,
      whatsapp: "5547974007391",
    });

    const createdLead = {
      id: "lead_no_config",
      name: "Maria Souza",
      email: "maria@example.com",
      phone: "(47) 98888-1111",
      createdAt: new Date(),
    };
    prismaMock.prisma.lead.create.mockResolvedValue(createdLead);

    const response = await route.POST(
      new Request("http://localhost/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: "Maria Souza",
          email: "maria@example.com",
          phone: "(47) 98888-1111",
        }),
      }),
    );

    expect(response.status).toBe(201);
    const body = await response.json();
    expect(body.savedOnly).toBe(true);
    expect(body.whatsapp).toBe("5547974007391");
    expect(body.message).toBe(
      "Recebemos sua mensagem! A Corretora Val entrará em contato em breve. Se preferir atendimento imediato, fale pelo WhatsApp.",
    );

    // Verifica criação com no_config
    expect(prismaMock.prisma.lead.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          emailStatus: "no_config",
        }),
      }),
    );

    // Resend NUNCA deve ser chamado quando não há e-mail configurado
    expect(mockSendContactNotification).not.toHaveBeenCalled();
    expect(prismaMock.prisma.lead.update).not.toHaveBeenCalled();
  });

  it("preserva o lead e atualiza emailStatus='failed' com o erro do Resend se o envio falhar", async () => {
    const createdLead = {
      id: "lead_failed_resend",
      name: "Carlos Teste",
      email: "carlos@example.com",
      phone: "(47) 97777-2222",
      createdAt: new Date(),
    };
    prismaMock.prisma.lead.create.mockResolvedValue(createdLead);
    mockSendContactNotification.mockResolvedValue({
      ok: false,
      error: "Domain not verified on Resend",
    });

    const response = await route.POST(
      new Request("http://localhost/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: "Carlos Teste",
          email: "carlos@example.com",
          phone: "(47) 97777-2222",
        }),
      }),
    );

    expect(response.status).toBe(201);
    const body = await response.json();
    expect(body.emailFailed).toBe(true);
    expect(body.savedOnly).toBe(true);

    // Lead é mantido salvo no banco e atualizado com emailStatus = failed
    expect(prismaMock.prisma.lead.update).toHaveBeenCalledWith({
      where: { id: "lead_failed_resend" },
      data: {
        emailStatus: "failed",
        emailError: "Domain not verified on Resend",
      },
    });
  });

  it("rejeita com HTTP 400 se campo dinâmico obrigatório não for enviado pela página de contato", async () => {
    // Configura campo dinâmico "cidade" como obrigatório
    prismaMock.prisma.campoContato.findMany.mockResolvedValue([
      { name: "name", label: "Nome completo", type: "text", required: true, isActive: true },
      { name: "email", label: "E-mail", type: "email", required: true, isActive: true },
      { name: "phone", label: "Telefone", type: "tel", required: true, isActive: true },
      { name: "cidade", label: "Cidade de Interesse", type: "text", required: true, isActive: true },
    ]);

    const response = await route.POST(
      new Request("http://localhost/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          source: "contato-page",
          name: "Lucas Pereira",
          email: "lucas@example.com",
          phone: "(47) 96666-3333",
          // 'cidade' omitida
        }),
      }),
    );

    expect(response.status).toBe(400);
    const body = await response.json();
    expect(body.error).toContain("Cidade de Interesse");

    // Não deve salvar no banco nem chamar o Resend
    expect(prismaMock.prisma.lead.create).not.toHaveBeenCalled();
    expect(mockSendContactNotification).not.toHaveBeenCalled();
  });

  it("antispam honeypot: grava lead com emailStatus='spam' e isRead=true sem chamar Resend quando contact_security_token vier preenchido", async () => {
    const response = await route.POST(
      new Request("http://localhost/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: "Spam Bot",
          email: "spambot@example.com",
          phone: "(47) 99999-9999",
          contact_security_token: "http://spam-link.example.com", // honeypot disparado
        }),
      }),
    );

    expect(response.status).toBe(201);
    const body = await response.json();
    expect(body.success).toBe(true);

    // Bot grava no banco com status spam e isRead=true para não poluir mensagens não lidas
    expect(prismaMock.prisma.lead.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          emailStatus: "spam",
          isRead: true,
          emailError: "Tentativa de spam bloqueada via honeypot.",
        }),
      }),
    );

    // Resend NUNCA é chamado para spam
    expect(mockSendContactNotification).not.toHaveBeenCalled();
  });

  it("antispam rate-limit: retorna HTTP 429 se o IP ultrapassar 3 envios na janela", async () => {
    // Simula que o IP já enviou 3 leads recentes
    prismaMock.prisma.lead.count.mockResolvedValue(3);

    const response = await route.POST(
      new Request("http://localhost/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: "Abuser",
          email: "abuser@example.com",
          phone: "(47) 99999-9999",
        }),
      }),
    );

    expect(response.status).toBe(429);
    const body = await response.json();
    expect(body.error).toContain("Muitas mensagens enviadas");

    // Não salva nem chama Resend
    expect(prismaMock.prisma.lead.create).not.toHaveBeenCalled();
    expect(mockSendContactNotification).not.toHaveBeenCalled();
  });

  it("permite envio do property-lead-form (imóvel) sem exigir campos customizados do formulário de contato", async () => {
    // Campo customizado do formulário de contato exigido
    prismaMock.prisma.campoContato.findMany.mockResolvedValue([
      { name: "name", label: "Nome completo", type: "text", required: true, isActive: true },
      { name: "email", label: "E-mail", type: "email", required: true, isActive: true },
      { name: "phone", label: "Telefone", type: "tel", required: true, isActive: true },
      { name: "como_conheceu", label: "Como nos conheceu?", type: "text", required: true, isActive: true },
    ]);

    const createdLead = {
      id: "lead_prop_1",
      name: "Interessado Imóvel",
      email: "cliente@example.com",
      phone: "(47) 91111-2222",
      createdAt: new Date(),
    };
    prismaMock.prisma.lead.create.mockResolvedValue(createdLead);
    mockSendContactNotification.mockResolvedValue({ ok: true, messageId: "msg_prop" });
    prismaMock.prisma.lead.update.mockResolvedValue({ ...createdLead, emailStatus: "sent" });

    // Payload real enviado pelo property-lead-form.tsx (sem source: "contato-page")
    const response = await route.POST(
      new Request("http://localhost/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: "Interessado Imóvel",
          email: "cliente@example.com",
          phone: "(47) 91111-2222",
          type: "CONTATO",
          subject: "Interesse no imóvel VAL-001 - Cobertura Vista Panorâmica",
          message:
            "Olá! Tenho interesse no imóvel VAL-001 (Cobertura Vista Panorâmica) e gostaria de mais informações ou agendar uma visita.",
          propertyAddress: null,
          propertyType: null,
        }),
      }),
    );

    expect(response.status).toBe(201);
    const body = await response.json();
    expect(body.success).toBe(true);
    // Verifica que o lead foi criado mesmo sem o campo customizado 'como_conheceu'
    expect(prismaMock.prisma.lead.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          name: "Interessado Imóvel",
          email: "cliente@example.com",
          type: "CONTATO",
        }),
      }),
    );
  });

  it("permite envio do property-owner-form (proprietário/anunciar) sem exigir campos customizados do formulário de contato", async () => {
    prismaMock.prisma.campoContato.findMany.mockResolvedValue([
      { name: "name", label: "Nome completo", type: "text", required: true, isActive: true },
      { name: "email", label: "E-mail", type: "email", required: true, isActive: true },
      { name: "phone", label: "Telefone", type: "tel", required: true, isActive: true },
      { name: "bairro_preferido", label: "Bairro preferido", type: "text", required: true, isActive: true },
    ]);

    const createdLead = {
      id: "lead_owner_1",
      name: "Proprietário Silva",
      email: "proprietario@example.com",
      phone: "(47) 93333-4444",
      createdAt: new Date(),
    };
    prismaMock.prisma.lead.create.mockResolvedValue(createdLead);
    mockSendContactNotification.mockResolvedValue({ ok: true, messageId: "msg_owner" });
    prismaMock.prisma.lead.update.mockResolvedValue({ ...createdLead, emailStatus: "sent" });

    // Payload exato enviado pelo property-owner-form.tsx
    const response = await route.POST(
      new Request("http://localhost/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: "Proprietário Silva",
          email: "proprietario@example.com",
          phone: "(47) 93333-4444",
          propertyAddress: "Rua 1500, n 50",
          propertyType: "Apartamento",
          message: "Quero que administrem meu imóvel",
          type: "ANUNCIAR",
        }),
      }),
    );

    expect(response.status).toBe(201);
    const body = await response.json();
    expect(body.success).toBe(true);
    expect(prismaMock.prisma.lead.create).toHaveBeenCalled();
  });

  it("retorna mensagem amigável com WhatsApp e oculta detalhes técnicos do visitante em caso de falha de envio", async () => {
    const createdLead = {
      id: "lead_friendly_error",
      name: "Visitante",
      email: "visitante@example.com",
      phone: "(47) 95555-6666",
      createdAt: new Date(),
    };
    prismaMock.prisma.lead.create.mockResolvedValue(createdLead);
    mockSendContactNotification.mockResolvedValue({
      ok: false,
      error: "RESEND_API_KEY não configurada no servidor.",
    });

    const response = await route.POST(
      new Request("http://localhost/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: "Visitante",
          email: "visitante@example.com",
          phone: "(47) 95555-6666",
        }),
      }),
    );

    expect(response.status).toBe(201);
    const body = await response.json();
    // A resposta NÃO deve conter o erro técnico 'RESEND_API_KEY'
    expect(body.message).not.toContain("RESEND_API_KEY");
    expect(body.message).toBe(
      "Recebemos sua mensagem! A Corretora Val entrará em contato em breve. Se preferir atendimento imediato, fale pelo WhatsApp.",
    );
    expect(body.whatsapp).toBe("5547974007391");

    // Mas o banco de dados armazena o erro técnico exato para diagnóstico do admin
    expect(prismaMock.prisma.lead.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          emailStatus: "failed",
          emailError: "RESEND_API_KEY não configurada no servidor.",
        }),
      }),
    );
  });
});
