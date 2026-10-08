// Dados FICTÍCIOS do condomínio (tabelas units, residents, revenues, expenses do schema do projeto).

const nomes = [
  "Ana Ribeiro", "Bruno Carvalho", "Cecília Mota", "Daniel Freitas", "Eduarda Lins", "Fábio Antunes", "Gisele Paiva", "Henrique Sá",
  "Isabela Goes", "Jorge Teles", "Karina Braga", "Leonardo Cruz", "Marta Siqueira", "Nelson Quintas", "Olívia Barros", "Paulo Rezende",
];

export const units = nomes.map((proprietario, i) => ({
  id: `unit-${i}`,
  bloco: i < 8 ? "A" : "B",
  numero: String(101 + (i % 4) + Math.floor((i % 8) / 4) * 100),
  proprietario,
  status: i === 13 ? "vaga" : "ocupada",
  created_at: "2025-01-10T12:00:00Z",
  updated_at: "2026-09-01T12:00:00Z",
}));

export const residents = units
  .filter((u) => u.status === "ocupada")
  .map((u, i) => ({
    id: `res-${i}`,
    unit_id: u.id,
    nome: u.proprietario,
    email: `${u.proprietario.split(" ")[0].toLowerCase()}@exemplo.com`,
    telefone: "(11) 90000-0000",
    tipo: i % 5 === 2 ? "inquilino" : "proprietario",
    avatar_url: null,
    created_at: "2025-01-10T12:00:00Z",
    updated_at: "2026-09-01T12:00:00Z",
  }));

const months = (() => {
  const out: string[] = [];
  const d = new Date();
  d.setDate(1);
  for (let i = 5; i >= 0; i--) {
    const m = new Date(d.getFullYear(), d.getMonth() - i, 1);
    out.push(`${m.getFullYear()}-${String(m.getMonth() + 1).padStart(2, "0")}`);
  }
  return out;
})();
const current = months[months.length - 1];
const unitRef = (u: (typeof units)[number]) => ({ bloco: u.bloco, numero: u.numero, proprietario: u.proprietario });

let receipt = 1040;
export const revenues = months.flatMap((comp, mi) =>
  units
    .filter((u) => u.status === "ocupada")
    .map((u, ui) => {
      const isCurrent = comp === current;
      const atrasado = (ui === 3 || ui === 9) && mi >= months.length - 3;
      const status = atrasado ? "atrasado" : isCurrent && ui % 3 === 0 ? "pendente" : "pago";
      const pago = status === "pago";
      return {
        id: `rev-${comp}-${u.id}`,
        descricao: "Taxa condominial",
        categoria: "taxa_condominio",
        unit_id: u.id,
        units: unitRef(u),
        valor: 480,
        data_vencimento: `${comp}-10`,
        data_pagamento: pago ? `${comp}-${String(5 + (ui % 5)).padStart(2, "0")}` : null,
        competencia: comp,
        receipt_number: pago ? String(receipt++) : null,
        data_pagamento_informada: null,
        observacao: null,
        revisao_necessaria: false,
        status,
        created_at: `${comp}-01T12:00:00Z`,
        updated_at: `${comp}-12T12:00:00Z`,
      };
    }),
);

const despesasBase: [string, string, string, number][] = [
  ["Conta de energia das áreas comuns", "luz", "Companhia de Energia", 980],
  ["Conta de água", "agua", "Companhia de Saneamento", 1240],
  ["Serviço de limpeza", "limpeza", "Limpa Bem Serviços", 1900],
  ["Manutenção do elevador", "manutencao", "Elevadores Sobe e Desce", 650],
  ["Portaria remota", "seguranca", "Vigia Total", 900],
  ["Jardinagem", "outros", "Verde Vivo", 320],
];
export const expenses = months.flatMap((comp, mi) =>
  despesasBase.map(([descricao, categoria, fornecedor, valor], i) => ({
    id: `exp-${comp}-${i}`,
    descricao,
    categoria,
    fornecedor,
    valor: Math.round(valor * (0.92 + ((mi * 7 + i * 3) % 15) / 100)),
    data_vencimento: `${comp}-${String(8 + i * 3).padStart(2, "0")}`,
    data_pagamento: comp === current && i > 3 ? null : `${comp}-${String(7 + i * 3).padStart(2, "0")}`,
    competencia: comp,
    status: comp === current && i > 3 ? "pendente" : "pago",
    created_at: `${comp}-01T12:00:00Z`,
    updated_at: `${comp}-12T12:00:00Z`,
  })),
);

export const condoTables = { units, residents, revenues, expenses };
export const firstPaidRevenueId = revenues.find((r) => r.status === "pago" && r.competencia === months[months.length - 2])!.id;
