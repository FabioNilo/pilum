import shots from "./shots.json";

export type NicheId = "restaurantes" | "saude" | "condominios" | "alimentacao" | "turismo" | "advocacia";

export const niches: { id: NicheId; label: string }[] = [
  { id: "restaurantes", label: "Restaurantes e delivery" },
  { id: "alimentacao", label: "Marmitas e congelados" },
  { id: "saude", label: "Clínicas e consultórios" },
  { id: "condominios", label: "Condomínios" },
  { id: "turismo", label: "Passeios e turismo" },
  { id: "advocacia", label: "Advocacia" },
];

export type Slide = {
  src: string;
  caption: string;
  device: "desktop" | "mobile";
};

/** Opção de restaurante, para o dono entender por onde começar. São sistemas independentes, não degraus de um mesmo produto. */
export type Tier = {
  name: string;
  level: 1 | 2 | 3;
};

/** Quando a solução não serve: o texto e, se houver, o id da solução que serve melhor. */
export type NotFor = { text: string; seeId?: string };

export type Project = {
  id: string;
  niche: NicheId;
  audience: string;
  title: string;
  /** Uma frase simples: o que é isto, sem jargão. */
  whatIs: string;
  problem: string;
  solution: string;
  benefits: string[];
  /** Situações em que esta solução faz sentido (linguagem do dia a dia). */
  forWho?: string[];
  /** Quando NÃO é a melhor opção. Honestidade filtra e gera confiança. */
  notForWho?: NotFor[];
  /** O que o cliente recebe, de forma concreta. */
  includes?: string[];
  /** O que o cliente precisa me entregar para começar. */
  needsFromYou?: string[];
  /** Prazo estimado para a primeira versão. Só preencher com prazo real. */
  timeline?: string;
  /** Como é cobrado (sem valores, se preferir). */
  pricingModel?: string;
  /** Degrau da solução (usado nas soluções de restaurante). */
  tier?: Tier;
  /** Funções técnicas, em texto menor, depois dos benefícios. */
  extras?: string[];
  /** Link para uma demonstração anonimizada. Sem link, o botão não aparece. */
  demoUrl?: string;
  /** Rótulo discreto sobre os prints (todos usam dados fictícios). */
  demoLabel: string;
  /** URL de embed (YouTube/Loom). Quando existir, aparece como primeiro slide. */
  videoUrl?: string;
};

// TODO(fabio): confirmar o que está incluso na implantação e na mensalidade antes de publicar.
export const PRICING = "Sem taxa de implantação, apenas mensalidade. Não há comissão sobre suas vendas.";

// TODO(fabio): confirmar que 24 horas é um prazo que você cumpre sempre (considere fins de semana e feriados).
export const TIMELINE = "Primeira versão em menos de 24 horas. Ajustes e novas funções são combinados numa reunião para refinamento.";

const base: Omit<Project, "demoLabel">[] = [
  {
    id: "delivery-proprio",
    niche: "restaurantes",
    audience: "Restaurantes com delivery",
    title: "Delivery próprio, sem comissão de aplicativo",
    whatIs:
      "Um site de pedidos com a sua marca, mais uma tela de controle onde você recebe e acompanha cada pedido pelo celular ou computador.",
    problem: "Os apps de entrega ficam com uma parte de cada pedido.",
    solution: "Um site de pedidos com a sua marca: o cliente escolhe, faz o pedido e acompanha a entrega. Você vende direto.",
    benefits: [
      "O cliente escolhe sozinho e o pedido chega organizado, sem se perder na conversa.",
      "A taxa de entrega sai calculada pelo bairro, sem você conferir um por um.",
      "Fechou a cozinha ou acabou a entrega do dia? Feche a loja com um clique e o cliente é avisado.",
      "O cliente acompanha o pedido sozinho e não precisa te chamar para perguntar.",
    ],
    forWho: [
      "Você já vende por delivery e quer deixar de pagar parte de cada pedido para aplicativos.",
      "Seus clientes já pedem pelo WhatsApp e os pedidos se perdem nas conversas.",
    ],
    notForWho: [
      { text: "Você tem salão com mesas e quer que o cliente peça pelo celular na mesa.", seeId: "restaurante-mesa" },
      { text: "Você precisa controlar entregadores e estoque.", seeId: "plataforma-restaurantes" },
    ],
    includes: [
      "Site de pedidos com o seu nome, cores e cardápio",
      "Tela de controle para receber, acompanhar e finalizar os pedidos",
      "Treinamento da sua equipe e acompanhamento nos primeiros dias de uso",
      // TODO(fabio): incluir suporte por WhatsApp somente com prazo de resposta que você consegue cumprir.
    ],
    needsFromYou: ["Cardápio com preços (e fotos, se tiver)", "Bairros atendidos e valor da entrega de cada um", "Logo e cores, se tiver"],
    timeline: TIMELINE,
    pricingModel: PRICING,
    tier: { name: "Essencial: pedidos online", level: 1 },
    // TODO(fabio): diferenciar pagamento feito dentro do site (online) de pagamento combinado na entrega.
    // TODO(fabio): concluir a configuração da impressão na cozinha (agente de impressão e rede do restaurante) antes de prometer.
    extras: ["Aceita Pix, cartão e dinheiro", "Página de acompanhamento do pedido", "Impressão do pedido na cozinha"],
  },
  {
    id: "restaurante-mesa",
    niche: "restaurantes",
    audience: "Cafés, bistrôs e restaurantes",
    title: "Cardápio digital e pedido na mesa pelo QR Code",
    whatIs:
      "Um cardápio no celular que o cliente abre apontando a câmera para o QR Code da mesa (aquele quadradinho de código). O pedido vai direto para o caixa e a conta de cada mesa soma sozinha.",
    problem: "Fila no caixa, comanda de papel e pedido anotado errado.",
    solution: "O cliente lê o QR da mesa, pede pelo celular e o pedido chega no caixa, sem ninguém precisar anotar.",
    benefits: [
      "Saiba, de relance, quais mesas estão ocupadas e quanto cada uma já consumiu.",
      "Feche a conta da mesa dividida em até 3 formas de pagamento, sem calculadora.",
      "Veja no celular o que mais vende e como foi o dia de vendas.",
      "Receba mesa e delivery no mesmo lugar, com aviso sonoro quando chega pedido novo.",
    ],
    forWho: [
      "Você tem mesas e hoje anota o pedido em papel ou comanda.",
      "Quer reduzir a fila no caixa e os erros de anotação.",
      "Também faz delivery e quer ver mesa e entrega num lugar só.",
    ],
    notForWho: [{ text: "Você só trabalha com entrega e não tem salão.", seeId: "delivery-proprio" }],
    includes: [
      "Cardápio digital com a sua marca",
      "QR Code de cada mesa, pronto para imprimir",
      "Tela com o mapa das mesas e a conta de cada uma",
      "Treinamento da sua equipe e acompanhamento nos primeiros dias de uso",
    ],
    needsFromYou: ["Cardápio com preços (e fotos, se tiver)", "Número de mesas", "Logo e cores, se tiver"],
    timeline: TIMELINE,
    pricingModel: PRICING,
    tier: { name: "Salão e delivery", level: 2 },
    extras: [
      "Mapa de mesas ao vivo",
      "Taxa de entrega configurada por bairro",
      "Valor médio de cada pedido e lista dos produtos mais vendidos",
      "Impressão automática do pedido para o caixa e a cozinha",
    ],
  },
  {
    id: "plataforma-restaurantes",
    niche: "restaurantes",
    audience: "Operações com motoboys e estoque",
    title: "Gestão completa: pedidos, motoboys, estoque e fidelidade",
    whatIs:
      "Uma tela de controle única para o seu restaurante: pedidos chegando em tempo real, entregadores, estoque que diminui a cada venda e pontos para o cliente voltar.",
    problem: "Entregador sem controle, bebida que acaba sem aviso e cliente que não volta.",
    solution: "Uma tela única: pedidos em tempo real, entregadores com link próprio, estoque que baixa a cada venda e pontos para o cliente voltar.",
    benefits: [
      "Chega de descobrir que a bebida acabou na hora do pico: o estoque avisa antes.",
      "Cada motoboy atualiza a entrega pelo próprio celular, e você acompanha sem ligar.",
      "Veja os pedidos chegando e andando pela cozinha, sem papel.",
      "Dê um motivo para o cliente voltar, com pontos e recompensas.",
    ],
    forWho: [
      "Você tem entregadores e perde o controle de quem está com qual pedido.",
      "Já teve bebida ou insumo acabando sem você saber.",
      "Quer fazer o cliente voltar com pontos e recompensas.",
    ],
    notForWho: [{ text: "Você está começando e só precisa receber pedidos organizados.", seeId: "delivery-proprio" }],
    includes: [
      "Pedidos de delivery e de mesa, com comanda e QR Code em cada mesa",
      "Cadastro de entregadores, cada um com seu link para atualizar a entrega",
      "Estoque com aviso de reposição",
      "Programa de pontos para o cliente voltar",
      "Treinamento da sua equipe e acompanhamento nos primeiros dias de uso",
    ],
    needsFromYou: [
      "Cardápio com preços (e fotos, se tiver)",
      "Lista de produtos que quer controlar no estoque, com as quantidades atuais",
      "Nome e celular dos entregadores",
    ],
    timeline: TIMELINE,
    pricingModel: PRICING,
    tier: { name: "Completo", level: 3 },
    extras: [
      "Impressão automática do pedido em impressora de cupom (80 mm)",
      "Pagamento online pelo Mercado Pago (o cliente paga pelo site)",
      "Caixa diário (o que entrou e o que saiu no dia)",
    ],
  },
  {
    id: "marmitas",
    niche: "alimentacao",
    audience: "Marmitas fit, congelados e cozinhas delivery",
    title: "Loja online com controle de pedidos e do custo de cada prato",
    whatIs:
      "Uma loja online onde o cliente monta o pedido de marmitas no carrinho, mais uma tela de controle para você ver os pedidos e saber quanto custa e quanto sobra em cada prato.",
    problem: "Pedido perdido no meio das conversas do WhatsApp e margem de lucro no chute.",
    solution: "Cardápio online com carrinho: o pedido chega pronto numa tela de controle, e a ficha de custo mostra quanto custa e quanto sobra em cada marmita.",
    benefits: [
      "O cliente monta a marmita no carrinho e o pedido chega pronto para você preparar.",
      "Saiba quanto custa cada marmita e quanto sobra de lucro, em vez de chutar a margem.",
      "Veja no caixa o que entrou, o que saiu e o saldo do período.",
      "Fale com o cliente direto pelo WhatsApp, a partir do próprio pedido.",
    ],
    forWho: [
      "Você vende marmitas, congelados ou comida por encomenda e recebe os pedidos pelo WhatsApp.",
      "Hoje não sabe ao certo quanto sobra de lucro em cada prato.",
    ],
    notForWho: [{ text: "Você tem salão com mesas e precisa de comanda.", seeId: "restaurante-mesa" }],
    includes: [
      "Loja online com catálogo, fotos e carrinho",
      "Tela de controle com os pedidos e contato direto com o cliente pelo WhatsApp",
      "Controle de caixa, despesas e estoque",
      "Ficha de custo de cada prato (o custo de cada ingrediente, para saber quanto sobra)",
      "Relatórios em PDF",
      "Treinamento e acompanhamento nos primeiros dias de uso",
    ],
    needsFromYou: [
      "Lista de pratos com preços e fotos",
      "Ingredientes e custo de cada prato, para calcular o lucro",
      "Logo e cores, se tiver",
    ],
    timeline: TIMELINE,
    pricingModel: PRICING,
    extras: [
      "Catálogo com fotos e controle de estoque",
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
    whatIs: "Um sistema para o consultório: agenda, ficha de cada paciente, registro das sessões e cobranças, tudo num lugar só.",
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
    whatIs:
      "Um site para a clínica e uma tela de controle para organizar agenda, pacientes, orçamentos e cobranças. Os pedidos de agendamento feitos pelo WhatsApp chegam nessa tela para você confirmar.",
    problem: "Agenda bagunçada, orçamento esquecido na gaveta e paciente que some.",
    solution: "Um site que capta pacientes e uma tela onde os pedidos de agendamento do WhatsApp viram consultas confirmadas.",
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
    whatIs:
      "Um sistema para registrar o que o condomínio recebe e gasta, com recibo de cada morador e relatório mensal em PDF para apresentar na assembleia.",
    problem: "Planilha confusa, prestação de contas trabalhosa e inadimplência sem controle.",
    solution: "Receitas e despesas por unidade, recibos numerados e relatório mensal pronto para apresentar aos moradores.",
    benefits: [
      "Veja receitas, despesas e saldo do mês num painel só.",
      "Emita o recibo de cada morador, com o valor por extenso.",
      "Saiba na hora quem está em atraso.",
      "Entregue a prestação de contas em PDF, pronta para a assembleia.",
    ],
  },
  {
    id: "reservas-passeios",
    niche: "turismo",
    audience: "Passeios, turismo e experiências com hora marcada",
    title: "Reserva online de passeios, com agenda e controle de vagas",
    whatIs:
      "Um site onde o cliente escolhe o passeio, a data e faz a reserva, mais uma tela de controle onde você vê as saídas do dia, quem vai em cada uma e o que já foi pago.",
    problem: "Reserva por mensagem, lista de passageiros anotada à mão e vaga que ninguém sabe quantas restam.",
    solution: "O cliente reserva sozinho, em etapas, e a equipe confere a agenda e a lista de participantes de cada saída.",
    benefits: [
      "O cliente escolhe o passeio, a data e reserva sem precisar te chamar.",
      "Veja quantas vagas restam em cada saída e quem está confirmado ou aguardando pagamento.",
      "Tenha a lista de participantes de cada saída pronta para conferir no dia.",
      "Fidelize quem volta sempre com planos de associado e cotas por semana.",
    ],
    // TODO(fabio): o pagamento está em modo de teste (PAYMENT_PROVIDER=mock). Não prometer cobrança online (Pix/cartão) antes de integrar um meio de pagamento real.
  },
  {
    id: "escritorio-advocacia",
    niche: "advocacia",
    audience: "Escritórios de advocacia",
    title: "Site de captação com formulário que envia o caso pelo WhatsApp",
    whatIs:
      "Um site para o escritório se apresentar, tirar as dúvidas mais comuns e receber o pedido de análise: o cliente preenche o formulário e o caso chega pronto no WhatsApp do advogado.",
    problem: "Cliente que chega sem contexto e as mesmas dúvidas respondidas uma a uma.",
    solution: "Um site que explica as áreas de atuação, responde as perguntas mais comuns e leva o cliente a descrever o caso antes de chamar.",
    benefits: [
      "O caso chega no WhatsApp com nome, contato e descrição, sem troca de mensagens para descobrir o básico.",
      "As dúvidas mais comuns ficam respondidas no próprio site, antes do primeiro contato.",
      "Áreas de atuação, formação e contato reunidos, e a página abre bem no celular.",
    ],
    // TODO(fabio): conteúdo jurídico segue as regras de publicidade da OAB. Revisar com o cliente antes de divulgar (ex.: depoimentos e promessa de resultado são vedados).
  },
];

const shotMap = shots as Record<string, Slide[]>;

// Prints de desktop primeiro: a tela larga causa a primeira impressão no card.
const desktopFirst = (slides: Slide[]) => [...slides].sort((a, b) => Number(a.device === "mobile") - Number(b.device === "mobile"));

// Todos os prints usam dados fictícios. Clínicas, psicólogos e condomínios são soluções prontas para implantar,
// ainda sem clientes autorizados para citar, então levam o rótulo de demonstração.
const demoLabel = (niche: NicheId) => (primaryNiches.includes(niche) ? "Dados fictícios" : "Demonstração · dados fictícios");

/** Nichos em destaque; os demais aparecem na seção "Também desenvolvo para". */
export const primaryNiches: NicheId[] = ["restaurantes", "alimentacao"];

/**
 * Guia "qual é o seu caso?" para as soluções de restaurante.
 * `projectId` aponta para o id do projeto, para a tela poder rolar até o card.
 */
export const tierChooser: { ifYou: string; projectId: string; tierName: string }[] = [
  { ifYou: "Quer receber pedidos online de forma organizada, sem se perder no WhatsApp.", projectId: "delivery-proprio", tierName: "Essencial: pedidos online" },
  { ifYou: "Tem mesas e quer que o cliente peça pelo celular, lendo o QR Code.", projectId: "restaurante-mesa", tierName: "Salão e delivery" },
  { ifYou: "Tem entregadores, quer controlar o estoque e fazer o cliente voltar.", projectId: "plataforma-restaurantes", tierName: "Completo" },
];

// Ordem na página: opções dos restaurantes (Essencial, Salão e delivery, Completo), marmitas; depois clínicas, psicólogos, condomínios.
const ORDER = ["delivery-proprio", "restaurante-mesa", "plataforma-restaurantes", "marmitas", "clinica-odonto", "consultorio-psi", "condominio", "reservas-passeios", "escritorio-advocacia"];

export const projects = base.map((p) => ({ ...p, demoLabel: demoLabel(p.niche), slides: desktopFirst(shotMap[p.id] ?? []) })).sort((a, b) => ORDER.indexOf(a.id) - ORDER.indexOf(b.id));
export type ProjectWithSlides = (typeof projects)[number];
