-- Dados FICTÍCIOS para os prints do sistema de restaurante (banco local do Docker).
-- Idempotente: limpa pedidos/contas/mesas/bairros e recria.
begin;

truncate pagamentos, pedidos_mesa, contas_mesa, pedidos_delivery restart identity cascade;
delete from mesas;
delete from bairros;

insert into bairros (nome, taxa) values
  ('Centro', 5.00), ('Jardim América', 7.00), ('Vila Nova', 6.00),
  ('Boa Vista', 8.00), ('Cidade Nova', 7.50), ('Parque das Flores', 9.00);

insert into mesas (numero, nome, token)
select n, 'Mesa ' || n, 'demo-mesa-' || n from generate_series(1, 10) n;

-- Função auxiliar: monta N itens aleatórios do cardápio em JSON.
create or replace function pg_temp.itens_aleatorios(qtd int)
returns jsonb language sql as $$
  select jsonb_agg(jsonb_build_object(
    'produto_id', p.id, 'nome', p.nome, 'tamanho_codigo', null, 'tamanho_nome', null,
    'tamanho_serve', null, 'preco', p.preco, 'quantidade', 1 + floor(random() * 2)::int))
  from (select id, nome, preco from produtos
         where disponivel and preco >= 4 and categoria_id not in ('bomboniere')
         order by random() limit qtd) p
$$;

create or replace function pg_temp.total(itens jsonb)
returns numeric language sql as $$
  select coalesce(sum((i->>'preco')::numeric * (i->>'quantidade')::int), 0) from jsonb_array_elements(itens) i
$$;

do $$
declare
  d int; k int; conta uuid; mesa int; it jsonb; tot numeric; quando timestamptz; metodo text;
  metodos text[] := array['pix', 'pix', 'cartao_credito', 'cartao_debito'];
  nomes text[] := array['Ana', 'Bruno', 'Carla', 'Diego', 'Elisa', 'Felipe', 'Gabi', 'Hugo', 'Iara', 'João', 'Lara', 'Marcos'];
  bairros text[] := array['Centro', 'Jardim América', 'Vila Nova', 'Boa Vista', 'Cidade Nova', 'Parque das Flores'];
  b text; v_taxa numeric; pedido uuid;
begin
  -- Histórico de 30 dias: contas de mesa fechadas e deliveries entregues.
  for d in 1..30 loop
    for k in 1..(6 + floor(random() * 8)::int) loop
      mesa := 1 + floor(random() * 10)::int;
      quando := date_trunc('day', now()) - make_interval(days => d) + make_interval(hours => 8 + floor(random() * 11)::int, mins => floor(random() * 60)::int);
      it := pg_temp.itens_aleatorios(2 + floor(random() * 3)::int);
      tot := pg_temp.total(it);
      metodo := metodos[1 + floor(random() * 4)::int];
      insert into contas_mesa (mesa_id, status, aberta_em, fechada_em, forma_pagamento, valor_total)
        values ((select id from mesas where numero = mesa), 'fechada', quando - interval '50 minutes', quando, metodo, tot)
        returning id into conta;
      insert into pedidos_mesa (conta_id, mesa_id, nome_cliente, itens, valor_total, status, created_at, updated_at)
        values (conta, (select id from mesas where numero = mesa), nomes[1 + floor(random() * 12)::int], it, tot, 'entregue', quando - interval '45 minutes', quando);
      insert into pagamentos (canal, conta_id, metodo, valor, created_at) values ('mesa', conta, metodo, tot, quando);
    end loop;

    for k in 1..(3 + floor(random() * 5)::int) loop
      quando := date_trunc('day', now()) - make_interval(days => d) + make_interval(hours => 11 + floor(random() * 9)::int, mins => floor(random() * 60)::int);
      it := pg_temp.itens_aleatorios(2 + floor(random() * 3)::int);
      b := bairros[1 + floor(random() * 6)::int];
      select taxa into v_taxa from bairros where nome = b;
      tot := pg_temp.total(it);
      metodo := metodos[1 + floor(random() * 4)::int];
      insert into pedidos_delivery (tracking_token, nome, telefone, endereco, bairro, bairro_id, itens, subtotal, taxa_entrega, valor_total, forma_pagamento, status, created_at, updated_at, entregue_em)
        values (md5(random()::text), nomes[1 + floor(random() * 12)::int] || ' Silva', '(11) 90000-0000', 'Rua Exemplo, ' || (10 + floor(random() * 900)::int), b,
                (select id from bairros where nome = b), it, tot, v_taxa, tot + v_taxa, metodo, 'entregue', quando, quando + interval '40 minutes', quando + interval '40 minutes')
        returning id into pedido;
      insert into pagamentos (canal, pedido_delivery_id, metodo, valor, created_at) values ('delivery', pedido, metodo, tot + v_taxa, quando + interval '40 minutes');
    end loop;
  end loop;

  -- Hoje: 5 mesas ocupadas com pedidos em vários status.
  for mesa in 1..10 loop
    continue when mesa not in (1, 3, 4, 7, 9);
    insert into contas_mesa (mesa_id, status, aberta_em)
      values ((select id from mesas where numero = mesa), 'aberta', now() - make_interval(mins => 15 + mesa * 6))
      returning id into conta;
    for k in 1..(1 + (mesa % 3)) loop
      it := pg_temp.itens_aleatorios(1 + floor(random() * 3)::int);
      insert into pedidos_mesa (conta_id, mesa_id, nome_cliente, itens, valor_total, status, created_at, updated_at)
        values (conta, (select id from mesas where numero = mesa), nomes[1 + ((mesa + k) % 12)], it, pg_temp.total(it),
                (array['pendente', 'novo', 'em_preparo', 'entregue'])[1 + ((mesa + k) % 4)], now() - make_interval(mins => k * 9), now());
    end loop;
  end loop;

  -- Hoje: deliveries em andamento.
  for k in 1..5 loop
    it := pg_temp.itens_aleatorios(2 + (k % 3));
    b := bairros[1 + (k % 6)];
    select taxa into v_taxa from bairros where nome = b;
    tot := pg_temp.total(it);
    insert into pedidos_delivery (tracking_token, nome, telefone, endereco, bairro, bairro_id, itens, subtotal, taxa_entrega, valor_total, forma_pagamento, status, created_at, updated_at)
      values ('demo-tracking-' || k, nomes[k + 3] || ' Souza', '(11) 90000-0000', 'Rua das Palmeiras, ' || (100 + k * 37), b, (select id from bairros where nome = b),
              it, tot, v_taxa, tot + v_taxa, metodos[1 + (k % 4)], (array['recebido', 'em_preparo', 'saiu_entrega', 'recebido', 'em_preparo'])[k],
              now() - make_interval(mins => k * 11), now());
  end loop;
end $$;

commit;

-- Loja sempre aberta nos prints e WhatsApp fictício.
update configuracoes_site set whatsapp_numero = '5511900000000', hora_abertura = '00:00', hora_fechamento = '23:59',
  mensagem_fechado = 'Estamos fechados agora. Volte em breve!';
