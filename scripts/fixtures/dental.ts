import type { FxHandler } from "../fixture-server";

// Dados FICTÍCIOS para o sistema da clínica odontológica (contrato n8n "dental-aura").

const pacientes = ["Mariana Costa", "Rafael Torres", "Beatriz Nunes", "Lucas Ferreira", "Camila Rocha", "André Martins", "Juliana Prado", "Pedro Henrique", "Larissa Melo", "Thiago Alves"];
const profissionais = [
  { id: "prof-1", nome: "Dra. Helena Duarte", especialidade: "Ortodontia" },
  { id: "prof-2", nome: "Dr. Marcos Vieira", especialidade: "Clínica geral" },
  { id: "prof-3", nome: "Dra. Paula Reis", especialidade: "Estética dental" },
];
const servicos = [
  { id: "serv-1", nome: "Avaliação inicial", preco: 150 },
  { id: "serv-2", nome: "Limpeza e profilaxia", preco: 220 },
  { id: "serv-3", nome: "Manutenção de aparelho", preco: 180 },
  { id: "serv-4", nome: "Clareamento", preco: 890 },
  { id: "serv-5", nome: "Restauração em resina", preco: 320 },
];

const at = (dayOffset: number, hour: number, min = 0) => {
  const d = new Date();
  d.setDate(d.getDate() + dayOffset);
  d.setHours(hour, min, 0, 0);
  return d.toISOString();
};
const day = (offset: number) => at(offset, 12).slice(0, 10);
const initials = (n: string) => n.split(" ").map((p) => p[0]).slice(0, 2).join("");
const ok = (data: unknown) => ({ json: { success: true, data } });

const agendamentos = Array.from({ length: 22 }, (_, i) => {
  const offset = (i % 6) - 1;
  const p = profissionais[i % 3];
  const s = servicos[i % servicos.length];
  return {
    id: `ag-${i}`,
    created_at: at(-3, 10),
    updated_at: at(-1, 10),
    data_hora: at(offset, 8 + ((i * 2) % 10), i % 2 ? 30 : 0),
    duracao_minutos: i % 3 ? 60 : 30,
    observacoes: i % 4 ? null : "Paciente prefere lembrete pelo WhatsApp.",
    origem: i % 3 ? "whatsapp" : "manual",
    paciente_id: `pac-${i % pacientes.length}`,
    paciente_nome: pacientes[i % pacientes.length],
    profissional_id: p.id,
    profissional_nome: p.nome,
    servico_id: s.id,
    servico_nome: s.nome,
    status: offset < 0 ? (i % 5 ? "concluido" : "faltou") : i % 7 === 3 ? "remarcado" : "confirmado",
  };
});

const solicitacoesStatus = ["novo", "novo", "em_triagem", "aguardando_confirmacao", "aguardando_confirmacao", "remarcacao_solicitada", "agendado", "agendado"];
const queixas = ["Dor no dente do siso há dois dias", "Quero orçamento de clareamento", "Manutenção do aparelho atrasada", "Sangramento na gengiva ao escovar", "Avaliação para lentes de contato dental", "Restauração quebrou", null, null];
const solicitacoes = solicitacoesStatus.map((status, i) => ({
  id: `sol-${i}`,
  agendamento_id: status === "agendado" ? `ag-${i}` : null,
  canal_origem: "n8n",
  codigo_externo: `SOL-${day(0).replace(/-/g, "")}-${String(i + 1).padStart(6, "0")}`,
  created_at: at(0, 7 + i, 12),
  updated_at: at(0, 8 + i),
  data_hora_confirmada: status === "agendado" ? at(1 + (i % 3), 10) : null,
  dia_desejado: day(1 + (i % 4)),
  horario_desejado: ["09:00:00", "14:30:00", "16:00:00", "10:30:00"][i % 4],
  nome_cliente: pacientes[(i + 3) % pacientes.length],
  observacoes_admin: null,
  observacoes_cliente: queixas[i],
  origem: "whatsapp",
  paciente_id: i % 3 ? `pac-${i}` : null,
  payload_externo: null,
  procedimento_nome: servicos[i % servicos.length].nome,
  profissional_id: profissionais[i % 3].id,
  resumo_atendimento: null,
  servico_id: servicos[i % servicos.length].id,
  status,
  telefone_cliente: "(11) 90000-0000",
  tipo_atendimento: i % 2 ? "particular" : "convenio",
}));

const faturaStatus = ["paga", "paga", "parcialmente_paga", "emitida", "paga", "emitida", "paga", "cancelada"];
const faturas = faturaStatus.map((status, i) => {
  const total = [890, 220, 1780, 320, 150, 640, 450, 180][i];
  return {
    id: `fat-${i}`,
    numero_nf: `NF-${2041 + i}`,
    paciente_id: `pac-${i}`,
    paciente_nome: pacientes[i],
    data_emissao: day(-i * 3),
    data_vencimento: day(-i * 3 + 15),
    status,
    valor_total: total,
    valor_pago: status === "paga" ? total : status === "parcialmente_paga" ? total / 2 : 0,
  };
});

const orcamentos = ["enviado", "aceito", "rascunho", "aceito", "rejeitado", "convertido_em_fatura"].map((status, i) => ({
  id: `orc-${i}`,
  paciente_id: `pac-${i + 2}`,
  paciente_nome: pacientes[i + 2],
  data_emissao: day(-i * 2),
  data_validade: day(-i * 2 + 30),
  created_at: at(-i * 2, 11),
  status,
  valor_total: [2400, 890, 4300, 1250, 3600, 980][i],
}));

export const dentalHandler: FxHandler = (req) => {
  const p = req.path.replace(/^\/dental-aura\/clinic/, "");
  if (req.path.startsWith("/dental-aura/clinic/auth/login")) {
    return ok({
      clinic: { id: "clinic-1", name: "Clínica Sorriso", slug: "clinica-sorriso" },
      token: "fx-dental-token",
      user: { id: "user-1", clinic_id: "clinic-1", clinic_name: "Clínica Sorriso", clinic_slug: "clinica-sorriso", email: "admin@clinica.com", name: "Recepção", role: "clinic_admin" },
    });
  }
  if (p === "/auth/logout") return ok({ ok: true });
  if (p === "/overview/kpis") return ok({ total_pacientes: 1284, solicitacoes_hoje: 8, confirmacoes_ia_hoje: 6, pendencias_operacionais: 3 });
  if (p === "/overview/chart-week") return ok(["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"].map((d, i) => ({ day: d, value: [14, 18, 11, 21, 17, 7][i] })));
  if (p === "/overview/activities")
    return ok([
      { id: "a1", tipo: "agendamento_confirmado", titulo: "Agendamento confirmado pelo assistente", descricao: "Mariana Costa · Avaliação inicial amanhã às 9h", created_at: at(0, 9, 40) },
      { id: "a2", tipo: "solicitacao_criada", titulo: "Nova solicitação pelo WhatsApp", descricao: "Rafael Torres quer orçamento de clareamento", created_at: at(0, 9, 12) },
      { id: "a3", tipo: "pagamento_registrado", titulo: "Pagamento registrado", descricao: "Beatriz Nunes · R$ 890,00 via Pix", created_at: at(0, 8, 55) },
      { id: "a4", tipo: "agendamento_remarcado", titulo: "Consulta remarcada", descricao: "Lucas Ferreira · de terça para quinta", created_at: at(-1, 17, 20) },
    ]);
  if (p === "/overview/upcoming-appointments")
    return ok(
      agendamentos
        .filter((a) => a.status === "confirmado")
        .slice(0, 5)
        .map((a) => ({
          id: a.id,
          name: a.paciente_nome,
          initials: initials(a.paciente_nome),
          detail: `${a.servico_nome} · ${a.profissional_nome}`,
          time: new Date(a.data_hora).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit", timeZone: "America/Bahia" }),
        })),
    );
  if (p === "/appointments") return ok(agendamentos);
  if (p === "/requests") return ok({ items: solicitacoes, count: solicitacoes.length, page: 1, pageSize: 20 });
  if (p.startsWith("/requests/by-appointment/")) return ok(solicitacoes.find((s) => s.agendamento_id === p.split("/").pop()) ?? null);
  if (p.startsWith("/requests/")) return ok(solicitacoes.find((s) => s.id === p.split("/").pop()) ?? solicitacoes[0]);
  if (p === "/professionals/options") return ok(profissionais);
  if (p === "/services/options") return ok(servicos.map((s) => ({ id: s.id, nome: s.nome })));
  if (p === "/finance/services") return ok(servicos.map((s) => ({ ...s, preco_base: s.preco, ativo: true, categoria: "preventivo" })));
  if (p === "/finance/invoices") return ok({ items: faturas, count: faturas.length });
  if (p === "/finance/budgets") return ok({ items: orcamentos, count: orcamentos.length });
  if (p === "/finance/coupons") return ok([]);
  if (p === "/finance/debtors")
    return ok([
      { paciente_id: "pac-3", nome: "Lucas Ferreira", telefone: "(11) 90000-0000", total_devido: 890, dias_atraso: 12, quantidade_faturas_vencidas: 1 },
      { paciente_id: "pac-5", nome: "André Martins", telefone: "(11) 90000-0000", total_devido: 320, dias_atraso: 5, quantidade_faturas_vencidas: 1 },
    ]);
  if (p === "/finance/summary")
    return ok({
      total_faturado: 48650,
      total_recebido: 41230,
      total_pendente: 6210,
      total_vencido: 1210,
      total_desconto_aplicado: 1840,
      quantidade_faturas: 132,
      quantidade_faturas_pagas: 117,
      quantidade_faturas_pendentes: 15,
      taxa_recebimento: 84.7,
    });
  if (p === "/patients") return ok({ items: pacientes.map((nome, i) => ({ id: `pac-${i}`, nome, telefone: "(11) 90000-0000", email: null, ativo: true, created_at: at(-60 + i, 10) })), count: pacientes.length });
  return undefined;
};
