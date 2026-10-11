import {
  BadgeCheck,
  Banknote,
  Bell,
  Bike,
  Building2,
  CalendarCheck,
  CalendarClock,
  CalendarX,
  Calculator,
  ChartLine,
  ChefHat,
  CircleHelp,
  ClipboardList,
  ClipboardX,
  Clock,
  CookingPot,
  FileSpreadsheet,
  FileText,
  Globe,
  HandCoins,
  ListChecks,
  MessageCircle,
  MessageCircleQuestion,
  MessagesSquare,
  NotebookPen,
  Percent,
  QrCode,
  Receipt,
  Repeat,
  Sailboat,
  Sandwich,
  Scale,
  ShoppingBag,
  Smartphone,
  Stethoscope,
  UserX,
  Users,
  UtensilsCrossed,
  Wallet,
  type LucideIcon,
} from "lucide-react";
import { tierChooser } from "./projects";

/**
 * Os públicos da landing: 3 de alimentação (em destaque) e 4 em "Outro negócio".
 * Cada um vê as próprias dores, o antes e depois, a jornada animada, o app no celular, as soluções e o CTA.
 * Os textos são rascunhos: revise à vontade, o layout se ajusta.
 * TODO(fabio): revisar todos os textos deste arquivo antes de publicar.
 */
export type SegmentId = "restaurantes" | "lanchonetes" | "marmitas" | "clinicas" | "condominios" | "turismo" | "advocacia";

/** "food" aparece nos 3 cartões principais; "other" fica dentro de "Outro negócio". */
export type SegmentGroup = "food" | "other";

export type Pain = { icon: LucideIcon; scene: string; relief: string; projectId: string; ref: string };

export type ChatMessage = { text: string; time: string; mine?: boolean };
export type PanelOrder = { id: string; who: string; items: string; col: 0 | 1 | 2 };
export type AgendaSlot = { time: string; text: string; state?: "riscado" | "duvida" };
export type SheetRow = { cells: string[]; bad?: number[] };

export type PayStatus = "pago" | "pendente" | "atraso";
export type WeekSession = { day: number; hour: number; who: string; kind: string; status: "confirmado" | "pendente" | "pago" | "falta" };
export type Tour = { name: string; schedule: string; price: string; booked: number; total: number };

/**
 * O "depois" de cada categoria, no estilo do sistema real:
 * painel de pedidos (alimentação), agenda semanal (clínica), vagas por passeio (turismo),
 * financeiro do condomínio e página pessoal do profissional (advocacia).
 */
export type After =
  | { kind: "board"; title: string; columns: [string, string, string]; orders: PanelOrder[] }
  | { kind: "week"; title: string; days: string[]; hours: string[]; sessions: WeekSession[] }
  | { kind: "spots"; brand: string; title: string; date: string; tours: Tour[] }
  | {
      kind: "finance";
      brand: string;
      kpis: { label: string; value: string; bad?: boolean }[];
      revenues: { unit: string; ref: string; value: string; status: PayStatus }[];
      expenses: { desc: string; due: string; value: string; status: PayStatus }[];
    }
  | { kind: "profile"; name: string; role: string; headline: string; bio: string; services: string[]; cta: string };

/** O cenário de bagunça do "antes": conversa de WhatsApp, agenda de papel ou planilha. */
export type Before =
  | { kind: "chat"; title: string; unread: number; messages: ChatMessage[] }
  | { kind: "agenda"; title: string; slots: AgendaSlot[]; notes: string[] }
  | { kind: "sheet"; title: string; headers: string[]; rows: SheetRow[] };

export type FlowStep = { icon: LucideIcon; actor: string; title: string; text: string; status: string };

export type Segment = {
  id: SegmentId;
  group: SegmentGroup;
  icon: LucideIcon;
  /** Nome no cartão do seletor. */
  label: string;
  /** Nome curto, para a barra fixa. */
  short: string;
  /** Uma linha de quem é esse público. */
  desc: string;
  pains: Pain[];
  beforeAfter: {
    heading: string;
    /** Contador da dor que cai enquanto a pessoa arrasta para o "depois" (ex.: 32 mensagens sem resposta → 0). */
    meter: { from: number; bad: string; good: string };
    before: Before;
    after: After;
    beforeCaption: string;
    afterCaption: string;
  };
  flow: {
    title: string;
    /** O "ticket" que acompanha a jornada (ex.: pedido #128). */
    ticket: { code: string; label: string };
    steps: FlowStep[];
  };
  /** Demonstração do app instalado na tela inicial. `audience` completa "Seus ___ abrem com um toque". */
  pwa: { appName: string; url: string; audience: string };
  solutions: {
    title: string;
    intro: string;
    projectIds: string[];
    /** Frase que adapta um sistema existente a este público (aparece no topo do card). */
    notes?: Record<string, string>;
    /** Guia "qual é o seu caso?" (só onde há mais de um plano). */
    chooser?: { ifYou: string; projectId: string; tierName: string }[];
    /** Texto do botão de WhatsApp em cada card. */
    cardCta: string;
  };
  cta: { title: string; text: string; message: string };
};

export const segments: Segment[] = [
  {
    id: "restaurantes",
    group: "food",
    icon: UtensilsCrossed,
    label: "Restaurantes, bares e food",
    short: "Restaurantes",
    desc: "Salão com mesas, com ou sem delivery",
    pains: [
      {
        icon: ClipboardX,
        scene: "O garçom anotou errado e o prato voltou para a cozinha",
        relief: "O pedido sai da mesa direto para a cozinha, sem anotação.",
        projectId: "restaurante-mesa",
        ref: "dor-anotacao",
      },
      {
        icon: Receipt,
        scene: "Fechar a conta dividida da mesa vira conta de cabeça",
        relief: "A conta de cada mesa soma sozinha e divide no pagamento.",
        projectId: "restaurante-mesa",
        ref: "dor-conta",
      },
      {
        icon: Percent,
        scene: "Uma parte de cada venda do delivery fica com o aplicativo",
        relief: "Venda direto, no seu próprio site.",
        projectId: "delivery-proprio",
        ref: "dor-comissao",
      },
      {
        icon: Bike,
        scene: "O motoboy saiu e ninguém sabe se o pedido chegou",
        relief: "Cada entrega com status, no painel.",
        projectId: "plataforma-restaurantes",
        ref: "dor-motoboy",
      },
    ],
    beforeAfter: {
      heading: "Do WhatsApp lotado ao painel organizado",
      meter: { from: 32, bad: "mensagens sem resposta", good: "Todos os pedidos no painel" },
      before: {
        kind: "chat",
        title: "Pedidos do restaurante",
        unread: 32,
        messages: [
          { text: "Boa noite! Ainda dá pra pedir entrega?", time: "19:42" },
          { text: "Quero 2 parmegianas, uma sem cebola", time: "19:43" },
          { text: "Qual a taxa pro Pontal?", time: "19:44" },
          { text: "Já respondo! Um momento 🙏", time: "19:51", mine: true },
          { text: "Manda o cardápio de novo por favor", time: "19:52" },
          { text: "Cadê meu pedido? Já faz 50 min", time: "20:31" },
          { text: "A mesa 4 tá pedindo a conta", time: "20:33" },
        ],
      },
      after: {
        kind: "board",
        title: "Painel de pedidos",
        columns: ["Novos", "Na cozinha", "Pronto / saiu"],
        orders: [
          { id: "#128", who: "Mesa 4", items: "2x Parmegiana · 1x Suco", col: 0 },
          { id: "#129", who: "Delivery · Pontal", items: "1x Picanha · 2x Refri", col: 0 },
          { id: "#125", who: "Mesa 7", items: "1x Moqueca", col: 1 },
          { id: "#126", who: "Delivery · Centro", items: "3x Hambúrguer", col: 1 },
          { id: "#122", who: "Mesa 2", items: "2x Feijoada", col: 2 },
        ],
      },
      beforeCaption: "Mesa e delivery misturados nas conversas e na comanda de papel.",
      afterCaption: "Mesa e delivery na mesma tela, cada pedido com status.",
    },
    flow: {
      title: "Um pedido, do começo ao fim",
      ticket: { code: "#128", label: "Status do pedido" },
      steps: [
        {
          icon: QrCode,
          actor: "Cliente",
          title: "Pede pela mesa ou pelo site",
          text: "Na mesa, lendo o QR Code. Em casa, pelo seu site de delivery.",
          status: "Novo pedido",
        },
        {
          icon: Bell,
          actor: "Caixa",
          title: "O pedido chega com aviso sonoro",
          text: "Mesa e delivery na mesma tela, sem ninguém anotar nada.",
          status: "Recebido",
        },
        {
          icon: ChefHat,
          actor: "Cozinha",
          title: "A cozinha recebe o pedido impresso",
          text: "Sai a comanda legível, na hora, sem ir e voltar.",
          status: "Em preparo",
        },
        {
          icon: Bike,
          actor: "Entrega",
          title: "O garçom serve ou o motoboy sai",
          text: "No delivery, o cliente acompanha o status sozinho.",
          status: "Saiu / servido",
        },
        {
          icon: Banknote,
          actor: "Você",
          title: "Conta fechada sem calculadora",
          text: "Divida em até 3 formas de pagamento e veja o dia no celular.",
          status: "Pago",
        },
      ],
    },
    pwa: { appName: "Sua Cantina", url: "suacantina.com.br", audience: "clientes" },
    solutions: {
      title: "Soluções para restaurantes e bares",
      intro: "Três sistemas independentes: comece pelo que resolve a sua maior dor hoje.",
      projectIds: ["delivery-proprio", "restaurante-mesa", "plataforma-restaurantes"],
      chooser: tierChooser,
      cardCta: "Ver como ficaria no meu restaurante",
    },
    cta: {
      title: "Vamos organizar o salão e o delivery do seu restaurante?",
      text: "Me chame no WhatsApp, conte como funciona hoje e eu mostro como a solução ficaria para você. Sem compromisso.",
      message: "Olá, Fabio! Tenho um restaurante/bar e quero ver como o sistema ficaria no meu negócio.",
    },
  },
  {
    id: "lanchonetes",
    group: "food",
    icon: Sandwich,
    label: "Lanchonetes e bistrôs",
    short: "Lanchonetes",
    desc: "Balcão e mesas, com ou sem entrega",
    pains: [
      {
        icon: Users,
        scene: "Fila no balcão bem na hora do pico",
        relief: "O cliente pede pelo QR Code enquanto espera.",
        projectId: "restaurante-mesa",
        ref: "dor-fila",
      },
      {
        icon: NotebookPen,
        scene: "Comanda de papel que some ou ninguém entende a letra",
        relief: "Cada pedido chega legível no caixa e na cozinha.",
        projectId: "restaurante-mesa",
        ref: "dor-comanda",
      },
      {
        icon: MessagesSquare,
        scene: "Pedido de entrega perdido no meio das conversas do WhatsApp",
        relief: "Pedidos num painel só, nada se perde.",
        projectId: "delivery-proprio",
        ref: "dor-pedido-perdido",
      },
      {
        icon: Calculator,
        scene: "No fim do dia, ninguém sabe o que mais vendeu",
        relief: "Veja no celular o que mais vende e como foi o dia.",
        projectId: "restaurante-mesa",
        ref: "dor-relatorio",
      },
    ],
    beforeAfter: {
      heading: "Do WhatsApp lotado ao painel organizado",
      meter: { from: 18, bad: "pedidos para conferir", good: "Cada pedido do jeito que o cliente pediu" },
      before: {
        kind: "chat",
        title: "Pedidos da lanchonete",
        unread: 18,
        messages: [
          { text: "Oi! Vocês entregam no Malhado?", time: "12:05" },
          { text: "1 X-tudo e 1 suco de laranja", time: "12:06" },
          { text: "Pode tirar o tomate?", time: "12:06" },
          { text: "Anotado! 👍", time: "12:14", mine: true },
          { text: "Moço, o meu era sem tomate 😕", time: "12:47" },
          { text: "Tem açaí hoje?", time: "12:48" },
          { text: "Já paguei no Pix, cadê?", time: "12:52" },
        ],
      },
      after: {
        kind: "board",
        title: "Painel de pedidos",
        columns: ["Novos", "Preparando", "Pronto"],
        orders: [
          { id: "#311", who: "Balcão · QR", items: "1x X-tudo (sem tomate)", col: 0 },
          { id: "#312", who: "Mesa 3", items: "2x Misto · 2x Café", col: 0 },
          { id: "#309", who: "Entrega · Malhado", items: "1x Açaí 500ml", col: 1 },
          { id: "#307", who: "Balcão · QR", items: "1x Tapioca · 1x Suco", col: 2 },
          { id: "#306", who: "Mesa 1", items: "1x Croissant · 1x Capuccino", col: 2 },
        ],
      },
      beforeCaption: "Fila no balcão, comanda de papel e pedido de entrega no WhatsApp.",
      afterCaption: "Balcão, mesa e entrega na mesma tela, do jeito que o cliente pediu.",
    },
    flow: {
      title: "Um pedido, do começo ao fim",
      ticket: { code: "#311", label: "Status do pedido" },
      steps: [
        {
          icon: QrCode,
          actor: "Cliente",
          title: "Pede pelo QR, sem fila",
          text: "O QR Code fica no balcão e nas mesas: o cliente escolhe pelo celular.",
          status: "Novo pedido",
        },
        {
          icon: Bell,
          actor: "Caixa",
          title: "O pedido aparece no caixa",
          text: "Com aviso sonoro e tudo escrito, do jeito que o cliente pediu.",
          status: "Recebido",
        },
        {
          icon: ChefHat,
          actor: "Cozinha",
          title: "Preparo com o pedido impresso",
          text: "Sem letra ilegível, sem “era sem tomate”.",
          status: "Preparando",
        },
        {
          icon: ShoppingBag,
          actor: "Atendimento",
          title: "Retirada no balcão ou entrega",
          text: "Se você também entrega, o pedido de casa cai na mesma tela.",
          status: "Pronto",
        },
        {
          icon: Smartphone,
          actor: "Você",
          title: "Você vê como foi o dia no celular",
          text: "O que mais vendeu e o valor médio de cada pedido.",
          status: "Fechado",
        },
      ],
    },
    pwa: { appName: "Lanche do Bairro", url: "lanchedobairro.com.br", audience: "clientes" },
    solutions: {
      title: "Soluções para lanchonetes e bistrôs",
      intro: "Comece pelo cardápio com QR Code. Se também entrega, some o pedido online, sem comissão de aplicativo.",
      projectIds: ["restaurante-mesa", "delivery-proprio"],
      notes: {
        "restaurante-mesa": "Na lanchonete: o QR Code pode ficar no balcão e nas mesas. O cliente pede pelo celular, sem fila.",
        "delivery-proprio": "Se você também entrega: o mesmo cardápio vira o seu site de pedidos, sem comissão de aplicativo.",
      },
      cardCta: "Ver como ficaria na minha lanchonete",
    },
    cta: {
      title: "Vamos acabar com a fila e a comanda de papel?",
      text: "Me chame no WhatsApp, conte como funciona hoje e eu mostro como ficaria na sua lanchonete. Sem compromisso.",
      message: "Olá, Fabio! Tenho uma lanchonete/bistrô e quero ver como o sistema ficaria no meu negócio.",
    },
  },
  {
    id: "marmitas",
    group: "food",
    icon: CookingPot,
    label: "Marmitas e pratos prontos",
    short: "Marmitas",
    desc: "Quentinhas e encomendas, só delivery",
    pains: [
      {
        icon: MessagesSquare,
        scene: "O pedido chegou no meio de 30 conversas do WhatsApp",
        relief: "Pedidos num painel só, nada se perde.",
        projectId: "marmitas",
        ref: "dor-pedido-perdido",
      },
      {
        icon: Clock,
        scene: "Você só descobre quantas marmitas fazer quando o WhatsApp para de tocar",
        relief: "Os pedidos do dia num lugar só, antes de produzir.",
        projectId: "marmitas",
        ref: "dor-producao",
      },
      {
        icon: Calculator,
        scene: "A margem de cada marmita é no chute",
        relief: "A ficha de custo mostra quanto sobra em cada prato.",
        projectId: "marmitas",
        ref: "dor-margem",
      },
      {
        icon: Percent,
        scene: "Uma parte de cada venda fica com o aplicativo de entrega",
        relief: "Venda direto, no seu próprio site.",
        projectId: "delivery-proprio",
        ref: "dor-comissao",
      },
    ],
    beforeAfter: {
      heading: "Do WhatsApp lotado ao painel organizado",
      meter: { from: 41, bad: "encomendas soltas no WhatsApp", good: "Encomendas prontas para produzir" },
      before: {
        kind: "chat",
        title: "Encomendas de marmita",
        unread: 41,
        messages: [
          { text: "Bom dia! Qual o cardápio de hoje?", time: "08:12" },
          { text: "Quero 5 fit de frango pra semana", time: "08:15" },
          { text: "Tem sem lactose?", time: "08:20" },
          { text: "Só um instante que já confirmo 😅", time: "09:02", mine: true },
          { text: "Ainda dá pra encomendar pra amanhã?", time: "10:41" },
          { text: "Mudei de ideia, troca 2 por carne", time: "10:43" },
          { text: "Quanto fica com a entrega?", time: "10:44" },
        ],
      },
      after: {
        kind: "board",
        title: "Painel de pedidos",
        columns: ["Novos", "Produzindo", "Saiu p/ entrega"],
        orders: [
          { id: "#540", who: "Ana · Centro", items: "5x Fit frango", col: 0 },
          { id: "#541", who: "Carlos · Pontal", items: "3x Fit carne · 2x Frango", col: 0 },
          { id: "#537", who: "Bia · Zona Sul", items: "4x Low carb", col: 1 },
          { id: "#538", who: "Rui · Centro", items: "2x Vegana", col: 1 },
          { id: "#534", who: "Lia · Malhado", items: "7x Kit semanal", col: 2 },
        ],
      },
      beforeCaption: "Encomenda, troca e pagamento espalhados em dezenas de conversas.",
      afterCaption: "Cada encomenda pronta para produzir, com o cliente a um toque no WhatsApp.",
    },
    flow: {
      title: "Uma encomenda, do começo ao fim",
      ticket: { code: "#540", label: "Status da encomenda" },
      steps: [
        {
          icon: ShoppingBag,
          actor: "Cliente",
          title: "Monta a marmita no carrinho",
          text: "Escolhe os pratos no seu cardápio online, sem precisar te chamar.",
          status: "Novo pedido",
        },
        {
          icon: ClipboardList,
          actor: "Você",
          title: "O pedido chega pronto no painel",
          text: "Itens, endereço e contato, tudo no mesmo lugar.",
          status: "Recebido",
        },
        {
          icon: CookingPot,
          actor: "Cozinha",
          title: "Produção com tudo à vista",
          text: "Veja os pedidos do dia num lugar só e produza o que foi pedido.",
          status: "Produzindo",
        },
        { icon: Bike, actor: "Entrega", title: "Saiu para entrega", text: "Fale com o cliente pelo WhatsApp direto do pedido.", status: "Saiu" },
        {
          icon: Calculator,
          actor: "Você",
          title: "O lucro de cada prato, sem chute",
          text: "Ficha de custo e caixa com o que entrou, saiu e o saldo.",
          status: "Entregue",
        },
      ],
    },
    pwa: { appName: "Sua Marmitaria", url: "suamarmitaria.com.br", audience: "clientes" },
    solutions: {
      title: "Soluções para marmitas e pratos prontos",
      intro: "Loja online com carrinho e controle do custo de cada prato. Para vender direto, sem comissão.",
      projectIds: ["marmitas", "delivery-proprio"],
      notes: {
        "delivery-proprio": "Alternativa mais simples: só o site de pedidos com a sua marca, se você ainda não precisa da ficha de custo.",
      },
      cardCta: "Ver como ficaria no meu delivery",
    },
    cta: {
      title: "Vamos organizar seus pedidos e o lucro de cada marmita?",
      text: "Me chame no WhatsApp, conte como funciona hoje e eu mostro como ficaria no seu delivery. Sem compromisso.",
      message: "Olá, Fabio! Vendo marmitas/pratos prontos por delivery e quero ver como o sistema ficaria no meu negócio.",
    },
  },
  {
    id: "clinicas",
    group: "other",
    icon: Stethoscope,
    label: "Clínicas e consultórios",
    short: "Clínicas",
    desc: "Saúde, terapia e atendimento com hora marcada",
    pains: [
      {
        icon: CalendarX,
        scene: "O paciente marcou pelo WhatsApp e ninguém passou para a agenda",
        relief: "Os pedidos de agendamento chegam organizados, prontos para confirmar.",
        projectId: "clinica-odonto",
        ref: "dor-agenda",
      },
      {
        icon: NotebookPen,
        scene: "O histórico do paciente está num caderno, que ficou no consultório",
        relief: "Evolução das sessões e anamnese à mão, na hora do atendimento.",
        projectId: "consultorio-psi",
        ref: "dor-prontuario",
      },
      {
        icon: FileText,
        scene: "O orçamento ficou esquecido na gaveta",
        relief: "Acompanhe orçamentos e faturas para nada ficar esquecido.",
        projectId: "clinica-odonto",
        ref: "dor-orcamento",
      },
      {
        icon: HandCoins,
        scene: "A sessão aconteceu e ninguém cobrou",
        relief: "Saiba quem já pagou e quem está em aberto.",
        projectId: "consultorio-psi",
        ref: "dor-cobranca",
      },
    ],
    beforeAfter: {
      heading: "Da agenda de papel à agenda organizada",
      meter: { from: 4, bad: "horários em dúvida", good: "Agenda da semana confirmada" },
      before: {
        kind: "agenda",
        title: "Agenda · terça-feira",
        slots: [
          { time: "08:00", text: "Maria (limpeza)" },
          { time: "08:30", text: "João", state: "riscado" },
          { time: "09:00", text: "Ana?? ou Pedro", state: "duvida" },
          { time: "09:30", text: "Carla · ligar p/ confirmar" },
          { time: "10:00", text: "Paulo", state: "riscado" },
          { time: "10:30", text: "Rosa · orçamento??", state: "duvida" },
        ],
        notes: ["Ligar p/ Dona Rosa!!", "Quem pagou ontem?"],
      },
      after: {
        kind: "week",
        title: "Agenda semanal",
        days: ["Seg 05", "Ter 06", "Qua 07", "Qui 08", "Sex 09"],
        hours: ["08:00", "09:00", "10:00", "11:00", "14:00", "15:00"],
        sessions: [
          { day: 0, hour: 0, who: "Maria Alves", kind: "Limpeza", status: "pago" },
          { day: 0, hour: 2, who: "João Reis", kind: "Retorno", status: "confirmado" },
          { day: 1, hour: 1, who: "Ana Souza", kind: "Avaliação", status: "pendente" },
          { day: 1, hour: 4, who: "Davi Rocha", kind: "Sessão", status: "falta" },
          { day: 2, hour: 0, who: "Carla Lima", kind: "Sessão", status: "confirmado" },
          { day: 2, hour: 3, who: "Rosa Lima", kind: "Orçamento", status: "pendente" },
          { day: 3, hour: 1, who: "Pedro Melo", kind: "Sessão", status: "pago" },
          { day: 3, hour: 5, who: "Bruno Costa", kind: "Retorno", status: "confirmado" },
          { day: 4, hour: 2, who: "Elisa Porto", kind: "Avaliação", status: "confirmado" },
          { day: 4, hour: 4, who: "Lucas Dias", kind: "Sessão", status: "pendente" },
        ],
      },
      beforeCaption: "Horário riscado, paciente em dúvida e cobrança de memória.",
      afterCaption: "Cada pedido de horário confirmado com um toque, e cada sessão com o pagamento registrado.",
    },
    flow: {
      title: "Um atendimento, do começo ao fim",
      ticket: { code: "09:00", label: "Status do horário" },
      steps: [
        {
          icon: CalendarClock,
          actor: "Paciente",
          title: "Pede um horário",
          text: "Pelo site ou pelo WhatsApp: o pedido cai na tela da clínica.",
          status: "Pedido",
        },
        {
          icon: CalendarCheck,
          actor: "Recepção",
          title: "Horário confirmado com um toque",
          text: "Nada de copiar mensagem para o caderno.",
          status: "Confirmado",
        },
        {
          icon: ClipboardList,
          actor: "Profissional",
          title: "Histórico à mão na sessão",
          text: "Anamnese, evolução e avaliações do paciente num lugar só.",
          status: "Em atendimento",
        },
        { icon: HandCoins, actor: "Você", title: "Cobrança registrada", text: "Saiba quem já pagou e quem está em aberto.", status: "Pago" },
        {
          icon: ChartLine,
          actor: "Você",
          title: "O mês no painel",
          text: "Quanto entrou, quanto falta receber e quem está em atraso.",
          status: "Fechado",
        },
      ],
    },
    pwa: { appName: "Clínica Sorriso", url: "clinicasorriso.com.br", audience: "pacientes" },
    solutions: {
      title: "Soluções para clínicas e consultórios",
      intro: "Agenda, pacientes e cobranças num lugar só. Para clínicas com recepção e para quem atende sozinho.",
      projectIds: ["clinica-odonto", "consultorio-psi"],
      cardCta: "Ver como ficaria na minha clínica",
    },
    cta: {
      title: "Vamos organizar a agenda e as cobranças da sua clínica?",
      text: "Me chame no WhatsApp, conte como funciona hoje e eu mostro como ficaria no seu atendimento. Sem compromisso.",
      message: "Olá, Fabio! Tenho uma clínica/consultório e quero ver como o sistema ficaria no meu atendimento.",
    },
  },
  {
    id: "condominios",
    group: "other",
    icon: Building2,
    label: "Condomínios",
    short: "Condomínios",
    desc: "Síndicos e administradoras",
    pains: [
      {
        icon: FileSpreadsheet,
        scene: "A planilha do condomínio só você entende",
        relief: "Receitas, despesas e saldo do mês num painel só.",
        projectId: "condominio",
        ref: "dor-planilha-condominio",
      },
      {
        icon: Receipt,
        scene: "Recibo feito à mão, um por um",
        relief: "Emita o recibo de cada morador, com o valor por extenso.",
        projectId: "condominio",
        ref: "dor-recibo",
      },
      {
        icon: UserX,
        scene: "Ninguém sabe ao certo quem está em atraso",
        relief: "Saiba na hora quem está em atraso.",
        projectId: "condominio",
        ref: "dor-inadimplencia",
      },
      {
        icon: FileText,
        scene: "A prestação de contas toma o seu fim de semana",
        relief: "Relatório mensal em PDF, pronto para a assembleia.",
        projectId: "condominio",
        ref: "dor-prestacao",
      },
    ],
    beforeAfter: {
      heading: "Da planilha quebrada ao painel do condomínio",
      meter: { from: 10, bad: "células com erro", good: "Contas fechando, sem fórmula" },
      before: {
        kind: "sheet",
        title: "condominio_FINAL_v3 (2).xlsx",
        // Os meses com erro ficam nas primeiras colunas: é a parte que aparece com o divisor no meio.
        headers: ["Unid.", "Mar", "Fev", "Jan", "Morador"],
        rows: [
          { cells: ["101", "?", "350", "350", "Silva"], bad: [1] },
          { cells: ["102", "—", "—", "350", "Costa"], bad: [1, 2] },
          { cells: ["201", "#REF!", "350", "350", "Souza"], bad: [1] },
          { cells: ["202", "350", "350 (pix?)", "350", "Lima"], bad: [2] },
          { cells: ["301", "#VALOR!", "", "", "Rocha"], bad: [1, 2, 3] },
          { cells: ["Total", "1.050", "???", "#REF!", ""], bad: [2, 3] },
        ],
      },
      after: {
        kind: "finance",
        brand: "CondoGestão",
        kpis: [
          { label: "Receitas", value: "R$ 43.200,00" },
          { label: "Despesas", value: "R$ 35.661,00", bad: true },
          { label: "Saldo", value: "R$ 7.539,00" },
        ],
        revenues: [
          { unit: "Bloco A · 201", ref: "Out/2026", value: "R$ 480,00", status: "pago" },
          { unit: "Bloco B · 204", ref: "Out/2026", value: "R$ 480,00", status: "pago" },
          { unit: "Bloco B · 102", ref: "Out/2026", value: "R$ 480,00", status: "atraso" },
          { unit: "Bloco A · 301", ref: "Out/2026", value: "R$ 480,00", status: "pendente" },
        ],
        expenses: [
          { desc: "Jardinagem", due: "23/10", value: "R$ 310,00", status: "pendente" },
          { desc: "Manutenção do elevador", due: "17/10", value: "R$ 689,00", status: "pago" },
          { desc: "Conta de água", due: "11/10", value: "R$ 1.240,00", status: "pago" },
        ],
      },
      beforeCaption: "Fórmula quebrada, pagamento em dúvida e total que não fecha.",
      afterCaption: "Quem pagou, quem deve e o recibo de cada morador, sem fórmula.",
    },
    flow: {
      title: "Um mês do condomínio, do começo ao fim",
      ticket: { code: "Março", label: "Status do mês" },
      steps: [
        { icon: Wallet, actor: "Síndico", title: "Lança receitas e despesas", text: "Por unidade, sem fórmula para quebrar.", status: "Lançado" },
        {
          icon: Receipt,
          actor: "Morador",
          title: "Recebe o recibo numerado",
          text: "Com o valor por extenso, pronto para enviar.",
          status: "Recibo emitido",
        },
        { icon: UserX, actor: "Síndico", title: "Vê quem está em atraso", text: "Na hora, sem conferir linha por linha.", status: "Conferido" },
        {
          icon: FileText,
          actor: "Assembleia",
          title: "Prestação de contas em PDF",
          text: "O relatório do mês sai pronto para apresentar aos moradores.",
          status: "Relatório pronto",
        },
      ],
    },
    pwa: { appName: "Cond. Jardins", url: "condjardins.com.br", audience: "moradores" },
    solutions: {
      title: "Solução para condomínios",
      intro: "Gestão financeira sem planilha, com a prestação de contas pronta para a assembleia.",
      projectIds: ["condominio"],
      cardCta: "Ver como ficaria no meu condomínio",
    },
    cta: {
      title: "Vamos acabar com a planilha do condomínio?",
      text: "Me chame no WhatsApp, conte como funciona hoje e eu mostro como ficaria no seu condomínio. Sem compromisso.",
      message: "Olá, Fabio! Sou síndico(a)/administro condomínio e quero ver como o sistema ficaria para nós.",
    },
  },
  {
    id: "turismo",
    group: "other",
    icon: Sailboat,
    label: "Passeios e turismo",
    short: "Turismo",
    desc: "Passeios e experiências com data marcada",
    pains: [
      {
        icon: MessagesSquare,
        scene: "“Ainda tem vaga sábado?” respondido o dia inteiro",
        relief: "O cliente escolhe o passeio, a data e reserva sozinho.",
        projectId: "reservas-passeios",
        ref: "dor-tem-vaga",
      },
      {
        icon: ListChecks,
        scene: "A lista de passageiros anotada à mão",
        relief: "A lista de participantes de cada saída, pronta para conferir.",
        projectId: "reservas-passeios",
        ref: "dor-lista",
      },
      {
        icon: Users,
        scene: "Ninguém sabe quantas vagas ainda restam",
        relief: "Veja quantas vagas restam em cada saída.",
        projectId: "reservas-passeios",
        ref: "dor-vagas",
      },
      {
        icon: Repeat,
        scene: "O cliente que gostou não tem motivo para voltar",
        relief: "Planos de associado e cotas por semana para quem volta sempre.",
        projectId: "reservas-passeios",
        ref: "dor-fidelidade",
      },
    ],
    beforeAfter: {
      heading: "Do “tem vaga?” à reserva organizada",
      meter: { from: 27, bad: "“tem vaga?” sem resposta", good: "Vagas à vista, o cliente reserva sozinho" },
      before: {
        kind: "chat",
        title: "Reservas · Passeios",
        unread: 27,
        messages: [
          { text: "Oi! Tem vaga pro passeio de sábado?", time: "07:58" },
          { text: "Somos 4 adultos e 2 crianças", time: "08:01" },
          { text: "Qual o horário de saída?", time: "08:03" },
          { text: "Vou conferir e já te aviso! 🙏", time: "08:40", mine: true },
          { text: "E aí, conseguiu ver?", time: "09:15" },
          { text: "Poxa, sábado lotou 😕", time: "09:20", mine: true },
          { text: "Mas eu pedi primeiro!", time: "09:21" },
        ],
      },
      after: {
        kind: "spots",
        brand: "Passeios Ilhéus",
        title: "Escolha seu passeio",
        date: "Sábado, 14/03",
        tours: [
          { name: "Escuna pela baía", schedule: "08:00 às 12:00", price: "R$ 90", booked: 14, total: 20 },
          { name: "Remada ao nascer do sol", schedule: "05:00 às 07:00", price: "R$ 50", booked: 11, total: 12 },
          { name: "Trilha da cachoeira", schedule: "09:00 às 13:00", price: "R$ 70", booked: 12, total: 12 },
          { name: "Pôr do sol de canoa", schedule: "16:30 às 18:00", price: "R$ 35", booked: 3, total: 10 },
        ],
      },
      beforeCaption: "Vaga combinada na conversa e passeio lotado sem ninguém saber.",
      afterCaption: "O cliente vê as vagas de cada passeio e reserva sozinho, sem perguntar.",
    },
    flow: {
      title: "Uma reserva, do começo ao fim",
      ticket: { code: "#R81", label: "Status da reserva" },
      steps: [
        {
          icon: CalendarClock,
          actor: "Cliente",
          title: "Escolhe o passeio e a data",
          text: "Vê as vagas e reserva sozinho, em etapas.",
          status: "Reserva",
        },
        {
          icon: Users,
          actor: "Equipe",
          title: "As vagas ficam atualizadas",
          text: "Você vê quantas vagas restam em cada saída.",
          status: "Vaga reservada",
        },
        {
          icon: BadgeCheck,
          actor: "Equipe",
          title: "Confere quem já pagou",
          text: "Quem está confirmado e quem está aguardando pagamento.",
          status: "Confirmado",
        },
        {
          icon: ListChecks,
          actor: "Guia",
          title: "Lista pronta no dia da saída",
          text: "Os participantes de cada saída, prontos para conferir no embarque.",
          status: "Embarque",
        },
      ],
    },
    pwa: { appName: "Passeios Ilhéus", url: "passeiosilheus.com.br", audience: "clientes" },
    solutions: {
      title: "Solução para passeios e turismo",
      intro: "Reserva online com agenda e controle de vagas: o cliente reserva sozinho e a equipe confere a lista de cada saída.",
      projectIds: ["reservas-passeios"],
      cardCta: "Ver como ficaria nos meus passeios",
    },
    cta: {
      title: "Vamos parar de responder “ainda tem vaga?” o dia todo?",
      text: "Me chame no WhatsApp, conte como funciona hoje e eu mostro como ficariam as suas reservas. Sem compromisso.",
      message: "Olá, Fabio! Trabalho com passeios/turismo e quero ver como o sistema de reservas ficaria para mim.",
    },
  },
  {
    // TODO(fabio): publicidade de advocacia segue as regras da OAB. Os textos falam com o advogado (quem contrata) e não prometem resultado.
    id: "advocacia",
    group: "other",
    icon: Scale,
    label: "Advogados e advogadas",
    short: "Advocacia",
    desc: "Página pessoal com seus serviços e contato",
    pains: [
      {
        icon: Globe,
        scene: "Quem te procura só encontra um perfil solto nas redes",
        relief: "Uma página sua, com apresentação, serviços e contato.",
        projectId: "escritorio-advocacia",
        ref: "dor-sem-pagina",
      },
      {
        icon: ListChecks,
        scene: "O cliente não sabe em quais áreas você atua",
        relief: "Seus serviços explicados numa tela só.",
        projectId: "escritorio-advocacia",
        ref: "dor-areas",
      },
      {
        icon: MessageCircleQuestion,
        scene: "O cliente chama com “oi, doutor(a)” e mais nada",
        relief: "O botão de contato já abre a conversa com o assunto certo.",
        projectId: "escritorio-advocacia",
        ref: "dor-sem-contexto",
      },
      {
        icon: Smartphone,
        scene: "Seu site antigo não abre bem no celular",
        relief: "Uma página leve, pensada para o celular.",
        projectId: "escritorio-advocacia",
        ref: "dor-site",
      },
    ],
    beforeAfter: {
      heading: "Do “oi, doutor(a)” à sua página profissional",
      meter: { from: 15, bad: "perguntas repetidas", good: "Apresentação, serviços e contato numa tela" },
      before: {
        kind: "chat",
        title: "WhatsApp profissional",
        unread: 15,
        messages: [
          { text: "Oi doutora", time: "21:12" },
          { text: "Vi seu perfil, a senhora é advogada?", time: "21:12" },
          { text: "Atende aposentadoria?", time: "21:30" },
          { text: "Boa noite! Atendo sim. Pode me contar o caso?", time: "08:05", mine: true },
          { text: "E trabalhista também?", time: "08:40" },
          { text: "Tem algum site pra eu ver?", time: "08:41" },
          { text: "Quanto custa uma consulta?", time: "08:41" },
        ],
      },
      after: {
        kind: "profile",
        name: "Dra. Marina Silva",
        role: "Advogada · OAB/BA 00.000",
        headline: "Direito Previdenciário e do Trabalho",
        bio: "Atendimento próximo, do primeiro contato ao fim do processo.",
        services: ["Aposentadoria e INSS", "Direito do trabalho", "Planejamento previdenciário"],
        cta: "Falar comigo no WhatsApp",
      },
      beforeCaption: "O cliente pergunta quem você é e o que faz, uma mensagem de cada vez.",
      afterCaption: "Sua apresentação, seus serviços e o botão de contato numa tela só.",
    },
    flow: {
      title: "Um contato, do começo ao fim",
      ticket: { code: "Visita", label: "Status do contato" },
      steps: [
        { icon: Globe, actor: "Cliente", title: "Encontra a sua página", text: "Pelo link no Instagram, no cartão ou no Google.", status: "Visita" },
        {
          icon: BadgeCheck,
          actor: "Cliente",
          title: "Conhece você",
          text: "Foto, formação e registro na OAB, numa apresentação curta.",
          status: "Confiança",
        },
        {
          icon: CircleHelp,
          actor: "Cliente",
          title: "Vê como você pode ajudar",
          text: "Seus serviços explicados em linguagem simples.",
          status: "Informado",
        },
        {
          icon: MessageCircle,
          actor: "Você",
          title: "Ele toca no botão e fala com você",
          text: "A conversa no WhatsApp já começa com o assunto certo.",
          status: "Contato",
        },
      ],
    },
    pwa: { appName: "Marina Silva Adv.", url: "marinasilva.adv.br", audience: "clientes" },
    solutions: {
      title: "Solução para advogados e advogadas",
      intro: "Uma página pessoal com a sua apresentação, os seus serviços e o botão de contato. Para quem atende sozinho ou em escritório.",
      projectIds: ["escritorio-advocacia"],
      notes: {
        "escritorio-advocacia": "Também em versão de uma tela só: sua apresentação, seus serviços e o botão de WhatsApp.",
      },
      cardCta: "Ver como ficaria a minha página",
    },
    cta: {
      title: "Vamos criar a sua página profissional?",
      text: "Me chame no WhatsApp, conte como você atende hoje e eu mostro como ficaria a sua página. Sem compromisso.",
      message: "Olá, Fabio! Sou advogado(a) e quero ver como ficaria a minha página profissional.",
    },
  },
];

export const DEFAULT_SEGMENT: SegmentId = "restaurantes";

export const foodSegments = segments.filter((s) => s.group === "food");
export const otherSegments = segments.filter((s) => s.group === "other");

export const getSegment = (id: SegmentId) => segments.find((s) => s.id === id) ?? segments[0];

const isSegmentId = (v: string | null): v is SegmentId => !!v && segments.some((s) => s.id === v);

/** Lê ?nicho= da URL (links de anúncio e Instagram). */
export function readSegmentFromUrl(): SegmentId | null {
  try {
    const v = new URLSearchParams(window.location.search).get("nicho");
    return isSegmentId(v) ? v : null;
  } catch {
    return null;
  }
}

/** Grava ?nicho= sem recarregar nem rolar a página. */
export function writeSegmentToUrl(id: SegmentId) {
  try {
    const url = new URL(window.location.href);
    url.searchParams.set("nicho", id);
    window.history.replaceState(null, "", url);
  } catch {
    // URL é só conveniência
  }
}
