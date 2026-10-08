// Dados FICTÍCIOS para as telas do admin de marmitas que a API local não implementa
// (CRM de pedidos, caixa, financeiro e LGPD).

const nomes = ["Ana Paula", "Bruno Lima", "Carla Dias", "Diego Reis", "Elisa Rocha", "Felipe Melo", "Gabriela Luz", "Hugo Prado", "Iara Campos", "João Pedro"];
const pratos = [
  "Frango grelhado ao molho de ervas, purê de abóbora",
  "Strogonoff de carne, arroz e legumes",
  "Patinho grelhado, macarrão ao pesto",
  "Filé de peixe ao molho de ervas, purê de banana",
  "Frango xadrez, arroz branco e legumes",
  "Parmegiana de carne, purê de aipim",
];
const status = ["enviado_whatsapp", "enviado_whatsapp", "confirmado", "em_preparo", "em_preparo", "saiu_entrega", "entregue", "entregue", "entregue", "entregue"];

const minutesAgo = (m: number) => new Date(Date.now() - m * 60_000).toISOString();
const daysAgo = (d: number) => new Date(Date.now() - d * 86_400_000).toISOString();

const pedidos = Array.from({ length: 14 }, (_, i) => {
  const qtd = 2 + (i % 4);
  return {
    id: `fx-pedido-${i + 1}`,
    nome_cliente: nomes[i % nomes.length],
    telefone_cliente: "(11) 90000-0000",
    status: status[i % status.length],
    valor_total: qtd * 24 + (i % 3) * 6,
    created_at: minutesAgo(12 + i * 23),
    itens_resumo: `${qtd}x ${pratos[i % pratos.length]}${i % 2 ? `, 1x ${pratos[(i + 2) % pratos.length]}` : ""}`,
    endereco_cliente: `Rua Exemplo, ${100 + i * 17}`,
    bairro_cliente: ["Centro", "Jardim América", "Vila Nova", "Boa Vista"][i % 4],
    complemento_cliente: null,
    observacoes_cliente: i % 3 ? null : "Sem cebola, por favor",
    observacoes_admin: null,
    itens: [{ id: "x", nome: pratos[i % pratos.length], preco: 24, quantidade: qtd }],
  };
});

const caixa = Array.from({ length: 12 }, (_, i) => ({
  id: `fx-caixa-${i}`,
  tipo: i % 4 === 3 ? "saida" : "entrada",
  descricao: i % 4 === 3 ? ["Compra de embalagens", "Hortifruti da semana", "Gás de cozinha"][i % 3] : `Pedido de ${nomes[i % nomes.length]}`,
  valor: i % 4 === 3 ? 80 + i * 9 : 48 + (i % 5) * 24,
  origem: i % 4 === 3 ? "manual" : "pedido",
  created_at: minutesAgo(30 + i * 95),
}));

const insumos = [
  ["Peito de frango", "kg", 21.9],
  ["Patinho bovino", "kg", 42.5],
  ["Filé de tilápia", "kg", 39.9],
  ["Arroz branco", "kg", 6.2],
  ["Abóbora cabotiá", "kg", 4.8],
  ["Batata inglesa", "kg", 5.5],
  ["Embalagem 750 ml", "un", 0.85],
  ["Azeite extra virgem", "l", 38],
].map(([nome, unidade, custo], i) => ({
  id: `fx-insumo-${i}`,
  nome,
  unidade,
  custo_unitario: custo,
  ativo: true,
  observacoes: null,
  created_at: daysAgo(40),
  updated_at: daysAgo(3),
}));

const despesas = [
  ["Aluguel da cozinha", 1800, "pago", 2],
  ["Energia elétrica", 412.37, "pago", 5],
  ["Embalagens (lote 500 un)", 425, "pago", 8],
  ["Fornecedor de carnes", 1290.5, "pendente", 1],
  ["Gás de cozinha", 135, "pendente", 0],
].map(([descricao, valor, st, d], i) => ({
  id: `fx-despesa-${i}`,
  categoria_id: null,
  descricao,
  fornecedor: null,
  valor,
  data_competencia: daysAgo(d as number).slice(0, 10),
  data_pagamento: st === "pago" ? daysAgo(d as number).slice(0, 10) : null,
  status: st,
  forma_pagamento: st === "pago" ? "pix" : null,
  observacoes: null,
  caixa_movimentacao_id: null,
  created_at: daysAgo(d as number),
}));

const series = Array.from({ length: 7 }, (_, i) => {
  const d = new Date(Date.now() - (6 - i) * 86_400_000);
  return { date_label: d.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" }), entradas: 380 + ((i * 137) % 420), saidas: 90 + ((i * 53) % 160) };
});

export const marmitasActions: Record<string, (body: any) => unknown> = {
  "pedidos.list": () => ({ data: pedidos, count: pedidos.length }),
  "pedidos.detail": (b) => pedidos.find((p) => p.id === b.id) ?? pedidos[0],
  "pedidos.resumo": () => ({ total_pedidos: 14, pendentes: 6, entregues: 8, faturamento: 1284 }),
  "caixa.list": () => ({ data: caixa, count: caixa.length }),
  "caixa.resumo": () => ({ totalEntradas: 3480, totalSaidas: 845, saldo: 2635 }),
  "caixa.series": () => series,
  "financeiro.insumos.list": () => insumos,
  "financeiro.despesas.list": () => despesas,
  "financeiro.resumo": () => ({
    faturamento: 14820,
    custo_estimado: 6930,
    despesas_pagas: 2637.37,
    despesas_pendentes: 1425.5,
    margem_bruta: 7890,
    resultado_operacional: 5252.63,
  }),
  "privacy.requests.list": () => [],
};
