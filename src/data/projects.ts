import shots from "./shots.json";

export type NicheId = "restaurantes" | "saude" | "condominios" | "alimentacao";

export const niches: { id: NicheId; label: string }[] = [
  { id: "restaurantes", label: "Restaurantes e delivery" },
  { id: "alimentacao", label: "Marmitas e congelados" },
  { id: "saude", label: "Clínicas e consultórios" },
  { id: "condominios", label: "Condomínios" },
];

export type Slide = {
  src: string;
  caption: string;
  device: "desktop" | "mobile";
};

export type Project = {
  id: string;
  niche: NicheId;
  audience: string;
  title: string;
  problem: string;
  solution: string;
  benefits: string[];
  /** Funções técnicas, em texto menor, depois dos benefícios. */
  extras?: string[];
  /** Link para uma demonstração anonimizada. Sem link, o botão não aparece. */
  demoUrl?: string;
  /** Rótulo discreto sobre os prints (todos usam dados fictícios). */
  demoLabel: string;
  /** URL de embed (YouTube/Loom). Quando existir, aparece como primeiro slide. */
  videoUrl?: string;
};

const base: Omit<Project, "demoLabel">[] = [
  {
    id: "restaurante-mesa",
    niche: "restaurantes",
    audience: "Cafés, bistrôs e restaurantes",
    title: "Cardápio digital e pedido na mesa pelo QR Code",
    problem: "Fila no caixa, comanda de papel e pedido anotado errado.",
    solution: "O cliente lê o QR da mesa, pede pelo celular e o pedido chega no caixa, sem ninguém precisar anotar.",
    benefits: [
      "Saiba, de relance, quais mesas estão ocupadas e quanto cada uma já consumiu.",
      "Feche a conta da mesa dividida em até 3 formas de pagamento, sem calculadora.",
      "Veja no celular o que mais vende e como foi o dia de vendas.",
      "Receba mesa e delivery no mesmo lugar, com aviso sonoro quando chega pedido novo.",
    ],
    extras: ["Mapa de mesas ao vivo", "Taxa de entrega por bairro", "Ticket médio e ranking de produtos", "Etiqueta para impressora térmica"],
  },
  {
    id: "delivery-proprio",
    niche: "restaurantes",
    audience: "Restaurantes com delivery",
    title: "Delivery próprio, sem comissão de aplicativo",
    problem: "Os apps de entrega ficam com uma parte de cada pedido.",
    solution: "Um site de pedidos com a sua marca: o cliente escolhe, faz o pedido e acompanha a entrega. Você vende direto.",
    benefits: [
      "O cliente escolhe sozinho e o pedido chega organizado, sem se perder na conversa.",
      "A taxa de entrega sai calculada pelo bairro, sem você conferir um por um.",
      "Fechou a cozinha ou acabou a entrega do dia? Feche a loja com um clique e o cliente é avisado.",
      "O cliente acompanha o pedido sozinho e não precisa te chamar para perguntar.",
    ],
    extras: ["Pagamento por Pix, cartão ou dinheiro", "Página de acompanhamento do pedido", "Impressão do pedido na cozinha"],
  },
  {
    id: "plataforma-restaurantes",
    niche: "restaurantes",
    audience: "Operações com motoboys e estoque",
    title: "Gestão completa: pedidos, motoboys, estoque e fidelidade",
    problem: "Entregador sem controle, bebida que acaba sem aviso e cliente que não volta.",
    solution: "Um painel único: pedidos em tempo real, entregadores com link próprio, estoque que baixa a cada venda e pontos para o cliente voltar.",
    benefits: [
      "Chega de descobrir que a bebida acabou na hora do pico: o estoque avisa antes.",
      "Cada motoboy atualiza a entrega pelo próprio celular, e você acompanha sem ligar.",
      "Veja os pedidos chegando e andando pela cozinha, sem papel.",
      "Dê um motivo para o cliente voltar, com pontos e recompensas.",
    ],
    extras: ["Impressão automática em 80 mm", "Pagamento online via Mercado Pago", "Caixa diário", "Mesas com comanda e QR Code"],
  },
  {
    id: "marmitas",
    niche: "alimentacao",
    audience: "Marmitas fit, congelados e cozinhas delivery",
    title: "Loja online com controle de pedidos e do custo de cada prato",
    problem: "Pedido perdido no meio das conversas do WhatsApp e margem de lucro no chute.",
    solution: "Cardápio online com carrinho: o pedido chega pronto num painel, e a ficha técnica mostra quanto custa e quanto sobra em cada marmita.",
    benefits: [
      "O cliente escolhe sozinho e o pedido chega organizado, sem se perder na conversa.",
      "Saiba quanto custa cada marmita e quanto sobra de lucro, em vez de chutar a margem.",
      "Veja no caixa o que entrou, o que saiu e o saldo do período.",
      "Fale com o cliente direto pelo WhatsApp, a partir do próprio pedido.",
    ],
    extras: [
      "Catálogo com fotos e estoque",
      "Despesas e relatórios em PDF",
      // TODO(fabio): confirmar que a adequação à LGPD está realmente implementada antes de manter este item.
      "Consentimento e pedidos de dados do cliente (LGPD)",
    ],
  },
  {
    id: "consultorio-psi",
    niche: "saude",
    audience: "Psicólogos e terapeutas",
    title: "Consultório organizado: agenda, prontuário e financeiro",
    problem: "Prontuário em papel, anotações espalhadas e sessão que ninguém cobrou.",
    solution: "Tudo do paciente num só lugar: agenda, evolução das sessões, anamnese, avaliações e cobranças.",
    benefits: [
      "Veja o dia e a semana de atendimentos sem abrir caderno ou planilha.",
      "O histórico de cada paciente fica à mão, na hora da sessão.",
      "Saiba quem já pagou e quem está em aberto.",
    ],
  },
  {
    id: "clinica-odonto",
    niche: "saude",
    audience: "Clínicas odontológicas e de saúde",
    title: "Site da clínica, gestão e agendamento pelo WhatsApp",
    problem: "Agenda bagunçada, orçamento esquecido na gaveta e paciente que some.",
    solution: "Um site que capta pacientes e um painel onde os pedidos de agendamento do WhatsApp viram consultas confirmadas.",
    benefits: [
      "Os pedidos de agendamento chegam organizados, prontos para confirmar.",
      "Acompanhe orçamentos e faturas para nada ficar esquecido.",
      "Veja quanto entrou, quanto falta receber e quem está em atraso.",
    ],
  },
  {
    id: "condominio",
    niche: "condominios",
    audience: "Síndicos e administradoras",
    title: "Gestão financeira do condomínio sem planilha",
    problem: "Planilha confusa, prestação de contas trabalhosa e inadimplência sem controle.",
    solution: "Receitas e despesas por unidade, recibos numerados e relatório mensal pronto para apresentar aos moradores.",
    benefits: [
      "Veja receitas, despesas e saldo do mês num painel só.",
      "Emita o recibo de cada morador, com o valor por extenso.",
      "Saiba na hora quem está em atraso.",
      "Entregue a prestação de contas em PDF, pronta para a assembleia.",
    ],
  },
];

const shotMap = shots as Record<string, Slide[]>;

// Prints de desktop primeiro: a tela larga causa a primeira impressão no card.
const desktopFirst = (slides: Slide[]) => [...slides].sort((a, b) => Number(a.device === "mobile") - Number(b.device === "mobile"));

// Todos os prints usam dados fictícios. Clínicas, psicólogos e condomínios são soluções prontas para implantar,
// ainda sem clientes autorizados para citar, então levam o rótulo de demonstração.
const demoLabel = (niche: NicheId) => (niche === "saude" || niche === "condominios" ? "Demonstração · dados fictícios" : "Dados fictícios");

/** Nichos em destaque; os demais aparecem na seção "Também desenvolvo para". */
export const primaryNiches: NicheId[] = ["restaurantes", "alimentacao"];

// Ordem na página: restaurantes/bistrôs, delivery, gestão com motoboys e estoque, marmitas; depois clínicas, psicólogos, condomínios.
const ORDER = ["restaurante-mesa", "delivery-proprio", "plataforma-restaurantes", "marmitas", "clinica-odonto", "consultorio-psi", "condominio"];

export const projects = base.map((p) => ({ ...p, demoLabel: demoLabel(p.niche), slides: desktopFirst(shotMap[p.id] ?? []) })).sort((a, b) => ORDER.indexOf(a.id) - ORDER.indexOf(b.id));
export type ProjectWithSlides = (typeof projects)[number];
