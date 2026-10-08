// Gera o SQL do cardápio de marmitas a partir das fotos/nome do próprio projeto
// (data/n8n-catalog-images/manifest.json). Preços são fictícios.
// Uso: npx tsx seed-marmitas.ts | docker exec -i shots-pg psql -U postgres -d marmitas
import { readFileSync } from "node:fs";

const DIR = "C:/Users/cippa/OneDrive/Documentos/neide/marmitas-fit-express/data/n8n-catalog-images";
const items = JSON.parse(readFileSync(`${DIR}/manifest.json`, "utf8")) as { id: string; nome: string; arquivo: string }[];
const q = (v: unknown) => (v === null || v === undefined ? "null" : `'${String(v).replace(/'/g, "''")}'`);
const cat = (n: string) => (/peixe/i.test(n) ? "peixes" : /frango|frnago/i.test(n) ? "frango" : "carnes");
const fix = (n: string) => n.replace(/frnago/i, "Frango").replace(/,(\S)/g, ", $1");

const out = [
  "begin;",
  "truncate pagamentos, pedidos_mesa, contas_mesa, pedidos_delivery restart identity cascade;",
  "delete from produtos; delete from categorias; delete from bairros;",
  "insert into categorias (id, nome, ordem, ativo) values ('frango', 'Frango', 1, true), ('carnes', 'Carnes', 2, true), ('peixes', 'Peixes', 3, true);",
];
items.forEach((it, i) => {
  const preco = 22 + (i % 4) * 2;
  const file = it.arquivo.split("/").pop();
  out.push(
    `insert into produtos (id, categoria_id, nome, descricao, preco, estoque, disponivel, imagem_url, tamanhos) values (${q(it.id)}, ${q(cat(it.nome))}, ${q(fix(it.nome))}, ${q("Marmita congelada de 350 g, pronta em 5 minutos no micro-ondas.")}, ${preco}, ${8 + (i % 5) * 6}, true, ${q(`http://127.0.0.1:5205/__fx/marmitas/${file}`)}, '[]'::jsonb);`,
  );
});
out.push("insert into bairros (nome, taxa) values ('Centro', 5), ('Jardim América', 7), ('Vila Nova', 6), ('Boa Vista', 8);");
out.push("update configuracoes_site set whatsapp_numero = '5511900000000', hora_abertura = '00:00', hora_fechamento = '23:59';");
out.push("commit;");
console.log(out.join("\n"));
