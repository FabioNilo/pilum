import { Globe, LayoutDashboard, LifeBuoy, Workflow, type LucideIcon } from "lucide-react";

/** Os tipos de projeto que filtram o portfólio. O suporte vale para todos, então não filtra. */
export type ServiceId = "sistemas" | "sites" | "integracoes";

export type Service = {
  id: ServiceId | "suporte";
  icon: LucideIcon;
  title: string;
  text: string;
  /** Exemplos concretos, em texto menor. */
  examples: string[];
};

// TODO(fabio): revisar os textos dos serviços antes de publicar.
export const services: Service[] = [
  {
    id: "sistemas",
    icon: LayoutDashboard,
    title: "Sistemas sob medida",
    text: "Painéis de gestão feitos para o seu processo: pedidos, agenda, financeiro, estoque e o que mais a operação pedir.",
    examples: ["Gestão de pedidos e entregas", "Agenda e prontuário", "Financeiro e relatórios"],
  },
  {
    id: "sites",
    icon: Globe,
    title: "Sites e páginas de captação",
    text: "Sites rápidos, pensados para o celular, que apresentam a empresa e levam o cliente a pedir, reservar ou chamar.",
    examples: ["Cardápio e loja online", "Reserva online", "Site institucional"],
  },
  {
    id: "integracoes",
    icon: Workflow,
    title: "Automação e integrações",
    text: "Conectamos o sistema ao que a empresa já usa, para tirar tarefa repetida das mãos da equipe.",
    examples: ["WhatsApp", "Pagamento online", "Impressão automática de pedidos"],
  },
  {
    // TODO(fabio): confirmar o que entra no suporte mensal e o prazo de resposta que vocês conseguem cumprir sempre.
    id: "suporte",
    icon: LifeBuoy,
    title: "Suporte e evolução",
    text: "Hospedagem, ajustes e novas funções depois que o sistema está no ar, com quem o desenvolveu.",
    examples: ["Hospedagem e atualizações", "Ajustes do dia a dia", "Novas funções sob demanda"],
  },
];

export const serviceLabel = (id: ServiceId) => services.find((s) => s.id === id)?.title ?? id;
