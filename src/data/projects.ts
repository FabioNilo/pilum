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
  /** Link para uma demonstração anonimizada. Sem link, o botão não aparece. */
  demoUrl?: string;
  /** URL de embed (YouTube/Loom). Quando existir, aparece como primeiro slide. */
  videoUrl?: string;
};

const base: Project[] = [
  {
    id: "restaurante-mesa",
    niche: "restaurantes",
    audience: "Cafés, bistrôs e restaurantes",
    title: "Cardápio digital com pedido na mesa por QR Code",
    problem: "Fila no caixa, comanda de papel e pedido anotado errado.",
    solution:
      "O cliente lê o QR da mesa, faz o pedido no celular e ele cai direto no caixa, com a conta da mesa somando sozinha.",
    benefits: [
      "Mapa das mesas ao vivo e fechamento de conta dividido em até 3 formas de pagamento",
      "Delivery com taxa por bairro e pedido enviado pelo WhatsApp",
      "Relatórios de vendas, ticket médio e produtos que mais vendem",
      "Alerta sonoro de pedido novo e etiqueta para impressora térmica",
    ],
  },
  {
    id: "delivery-proprio",
    niche: "restaurantes",
    audience: "Restaurantes com delivery",
    title: "Delivery próprio, sem comissão de aplicativo",
    problem: "Os apps de entrega ficam com até 27% de cada pedido.",
    solution:
      "Um site de pedidos com a sua marca: o cliente escolhe, paga por Pix ou cartão e acompanha o pedido. O valor fica todo com você.",
    benefits: [
      "Taxa de entrega calculada pelo bairro automaticamente",
      "Abrir e fechar a loja com um clique, com aviso de \"sem entrega hoje\"",
      "Página de acompanhamento do pedido para o cliente",
      "Impressão automática do pedido na cozinha",
    ],
  },
  {
    id: "plataforma-restaurantes",
    niche: "restaurantes",
    audience: "Redes e operações com entregadores",
    title: "Gestão completa: pedidos, motoboys, estoque e fidelidade",
    problem: "Entregador sem controle, bebida que acaba sem aviso e cliente que não volta.",
    solution:
      "Um painel único com quadro de pedidos em tempo real, app do entregador, baixa automática de estoque e programa de pontos.",
    benefits: [
      "Quadro de pedidos ao vivo com impressão automática",
      "Link próprio para cada motoboy atualizar a entrega pelo celular",
      "Estoque com alerta de reposição a cada venda",
      "Programa de fidelidade e pagamento online via Mercado Pago",
    ],
  },
  {
    id: "marmitas",
    niche: "alimentacao",
    audience: "Marmitas fit, congelados e cozinhas delivery",
    title: "Loja online com controle de pedidos e custo por prato",
    problem: "Pedido perdido no meio das conversas do WhatsApp e margem de lucro no chute.",
    solution:
      "Cardápio online com carrinho, pedidos organizados num painel e ficha técnica que mostra quanto custa cada marmita.",
    benefits: [
      "Catálogo com fotos e carrinho, o pedido chega pronto",
      "CRM de pedidos com contato direto pelo WhatsApp",
      "Caixa, despesas, estoque e ficha técnica de custo",
      "Relatórios em PDF e adequação à LGPD",
    ],
  },
  {
    id: "consultorio-psi",
    niche: "saude",
    audience: "Psicólogos e terapeutas",
    title: "Consultório organizado: agenda, prontuário e financeiro",
    problem: "Prontuário em papel, anotações espalhadas e sessão que ninguém cobrou.",
    solution:
      "Tudo do paciente num só lugar: agenda, evolução das sessões, anamnese, avaliações e cobranças.",
    benefits: [
      "Agenda de atendimentos com lembrete",
      "Perfil completo do paciente e histórico de sessões",
      "Anamnese e avaliações registradas com segurança",
      "Financeiro com faturas, pagamentos e recibos",
    ],
  },
  {
    id: "clinica-odonto",
    niche: "saude",
    audience: "Clínicas odontológicas e de saúde",
    title: "Site da clínica + gestão + agendamento pelo WhatsApp",
    problem: "Agenda bagunçada, orçamento esquecido na gaveta e paciente que some.",
    solution:
      "Um site que capta pacientes e um painel onde os pedidos de agendamento do WhatsApp viram consultas confirmadas.",
    benefits: [
      "Site profissional com botão de agendamento",
      "Fila de solicitações vindas do assistente de WhatsApp",
      "Prontuário, tratamentos e cadastro de profissionais",
      "Orçamentos, cupons, faturas e relatórios financeiros",
    ],
  },
  {
    id: "condominio",
    niche: "condominios",
    audience: "Síndicos e administradoras",
    title: "Gestão financeira do condomínio sem planilha",
    problem: "Planilha confusa, prestação de contas trabalhosa e inadimplência sem controle.",
    solution:
      "Receitas e despesas por unidade, recibos numerados e relatório mensal pronto para apresentar aos moradores.",
    benefits: [
      "Painel com gráficos de receitas e despesas",
      "Recibo individual com valor por extenso",
      "Lista de inadimplentes atualizada",
      "Relatório mensal em PDF e exportação em CSV",
    ],
  },
];

const shotMap = shots as Record<string, Slide[]>;

// Prints de desktop primeiro: a tela larga causa a primeira impressão no card.
const desktopFirst = (slides: Slide[]) => [...slides].sort((a, b) => Number(a.device === "mobile") - Number(b.device === "mobile"));

export const projects = base.map((p) => ({ ...p, slides: desktopFirst(shotMap[p.id] ?? []) }));
export type ProjectWithSlides = (typeof projects)[number];
