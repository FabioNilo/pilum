// Gera o SQL do cardápio de massas (a partir do cardapio.ts do próprio projeto)
// para o banco local "massas". Uso: npx tsx seed-massas.ts | docker exec -i shots-pg psql -U postgres -d massas
import { categoriasCardapio, produtosCardapio } from "../../../../Users/cippa/OneDrive/Documentos/neide/massas-italianas-express/src/data/cardapio";

const q = (v: unknown) => (v === null || v === undefined ? "null" : `'${String(v).replace(/'/g, "''")}'`);
const out: string[] = ["begin;", "truncate pagamentos, pedidos_mesa, contas_mesa, pedidos_delivery restart identity cascade;", "delete from produtos; delete from categorias; delete from bairros;"];
for (const c of categoriasCardapio) out.push(`insert into categorias (id, nome, ordem, ativo) values (${q(c.id)}, ${q(c.nome)}, ${c.ordem}, true);`);
for (const p of produtosCardapio as any[]) {
  out.push(
    `insert into produtos (id, categoria_id, nome, descricao, preco, estoque, disponivel, imagem_url, tamanhos) values (${q(p.id)}, ${q(p.categoria_id)}, ${q(p.nome)}, ${q(p.descricao)}, ${p.preco}, ${p.estoque ?? 50}, true, ${q(p.imagem_url)}, ${q(JSON.stringify(p.tamanhos ?? []))}::jsonb);`,
  );
}
out.push("insert into bairros (nome, taxa) values ('Centro', 6), ('Jardim América', 8), ('Vila Nova', 7), ('Boa Vista', 9), ('Cidade Nova', 8.5);");
out.push("update produtos set imagem_url = null; -- as fotos reais mostram a embalagem com a marca do cliente");
out.push("commit;");
console.log(out.join("\n"));
