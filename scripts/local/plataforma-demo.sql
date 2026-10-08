-- Dados FICTÍCIOS para os prints da plataforma de restaurantes (banco local do Docker).
-- Rode depois de `prisma migrate deploy` + `tsx prisma/seed*.ts`. Idempotente.
begin;

delete from "OrderItemOption";
delete from "OrderItem";
delete from "OrderStatusHistory";
delete from "Order";

update "Tenant" set name = 'Sabor da Casa' where slug = 'demo';

-- Mais pratos no cardápio, na mesma categoria dos lanches do seed.
insert into "Product" (id, "tenantId", "categoryId", name, description, price, featured, active)
select gen_random_uuid()::text, p."tenantId", p."categoryId", v.name, v.descr, v.price, v.featured, true
  from (select "tenantId", "categoryId" from "Product" where name = 'X-Burguer') p
 cross join (values
   ('X-Bacon', 'Pão brioche, blend 160 g, bacon crocante e cheddar', 32.90, true),
   ('Smash duplo', 'Dois smash de 90 g, queijo prato e molho da casa', 34.90, true),
   ('Frango crispy', 'Sobrecoxa empanada, alface, tomate e maionese verde', 29.90, false),
   ('Combo família', '4 lanches, 2 batatas grandes e refrigerante 2 L', 119.90, true)
 ) as v(name, descr, price, featured)
 where not exists (select 1 from "Product" where name = v.name);

do $$
declare
  t text; moto text; d int; k int; n int := 0; o text; st "OrderStatus"; quando timestamptz; tot numeric; fee numeric;
  nomes text[] := array['Ana Paula', 'Bruno Lima', 'Carla Dias', 'Diego Reis', 'Elisa Rocha', 'Felipe Melo', 'Gabriela Luz', 'Hugo Prado', 'Iara Campos', 'João Pedro'];
  bairros text[] := array['Centro', 'Jardim América', 'Vila Nova', 'Boa Vista', 'Cidade Nova'];
  pays "PaymentMethod"[] := array['PIX', 'PIX', 'CARTAO', 'DINHEIRO', 'ONLINE'];
  hoje "OrderStatus"[] := array['RECEBIDO', 'RECEBIDO', 'CONFIRMADO', 'EM_PREPARO', 'EM_PREPARO', 'EM_PREPARO', 'SAIU_PARA_ENTREGA', 'SAIU_PARA_ENTREGA', 'ENTREGUE', 'ENTREGUE'];
  prod record;
begin
  select id into t from "Tenant" where slug = 'demo';
  select id into moto from "Motoboy" where "tenantId" = t limit 1;

  for d in reverse 30..0 loop
    for k in 1..(case when d = 0 then 10 else 5 + floor(random() * 9)::int end) loop
      n := n + 1;
      o := gen_random_uuid()::text;
      st := case when d = 0 then hoje[k] else 'ENTREGUE' end;
      quando := case when d = 0 then now() - make_interval(mins => (11 - k) * 7)
                     else date_trunc('day', now()) - make_interval(days => d) + make_interval(hours => 11 + floor(random() * 11)::int, mins => floor(random() * 60)::int) end;
      fee := (array[5, 6, 7, 8])[1 + floor(random() * 4)::int];
      insert into "Order" (id, "tenantId", number, origin, type, "customerName", "customerPhone", "deliveryAddress", neighborhood, "deliveryFee", "paymentMethod", status, "motoboyId", total, "createdAt", "updatedAt")
        values (o, t, n, 'PROPRIO', 'DELIVERY', nomes[1 + floor(random() * 10)::int], '5511900000000',
                'Rua Exemplo, ' || (10 + floor(random() * 900)::int), bairros[1 + floor(random() * 5)::int], fee,
                pays[1 + floor(random() * 5)::int], st, case when st in ('SAIU_PARA_ENTREGA', 'ENTREGUE') then moto end, 0, quando, quando);
      tot := 0;
      for prod in select id, name, price from "Product" where "tenantId" = t and active order by random() limit (1 + floor(random() * 3)::int) loop
        insert into "OrderItem" (id, "orderId", "productId", name, quantity, "unitPrice")
          values (gen_random_uuid()::text, o, prod.id, prod.name, 1 + floor(random() * 2)::int, prod.price);
      end loop;
      select coalesce(sum(quantity * "unitPrice"), 0) into tot from "OrderItem" where "orderId" = o;
      update "Order" set total = tot + fee where id = o;
    end loop;
  end loop;
end $$;

commit;
