-- Dados FICTÍCIOS para os prints do sistema de reservas de passeios (banco local "canoa" no Docker).
-- Rode depois de `prisma migrate deploy` + `prisma db seed` do projeto. Idempotente.
begin;

delete from "QuotaTransaction";
delete from "MembershipPayment";
delete from "Payment";
delete from "ReservationParticipant";
delete from "Reservation";
delete from "Membership";
delete from "Customer";
delete from "ScheduleSlot" where date < to_char(current_date, 'YYYY-MM-DD') or id like 'slot_today_%';

do $$
declare
  nomes text[] := array['Ana Ribeiro', 'Bruno Carvalho', 'Carla Mota', 'Daniel Freitas', 'Eduarda Lins', 'Fábio Antunes', 'Gisele Paiva', 'Henrique Sá', 'Isabela Goes', 'Jorge Teles'];
  exps text[] := array['exp_nascer_sol', 'exp_remada_avulsa', 'exp_por_do_sol', 'exp_lua_cheia', 'exp_comemoracoes'];
  horas text[] := array['04:30', '07:30', '16:30', '18:30', '09:00'];
  precos int[] := array[5000, 3500, 3500, 3500, 5000];
  i int; k int; cid text; rid text; sid text; ex int; d date; n int; tot int; st "ReservationStatus"; pst "PaymentStatus";
  mid text; plano text; seq int := 100;
begin
  -- Clientes
  for i in 1..15 loop
    insert into "Customer" (id, name, email, phone, city, state, "createdAt", "updatedAt")
      values ('cus_demo_' || i, nomes[1 + (i - 1) % 10], lower(split_part(nomes[1 + (i - 1) % 10], ' ', 1)) || i || '@exemplo.com', '(11) 9' || lpad((1000 + i * 137)::text, 4, '0') || '-0000', 'Sua Cidade', 'BA', now() - make_interval(days => 40 - i), now());
  end loop;

  -- Associados: 3 em dia (planos diferentes) e 1 em atraso
  for i in 1..4 loop
    select id into plano from "MembershipPlan" where slug = case when i % 2 = 0 then 'kai' else 'aloha' end;
    mid := 'mem_demo_' || i;
    insert into "Membership" (id, "customerId", "planId", status, "startedAt", "currentPeriodStart", "currentPeriodEnd", "nextDueAt", "createdAt", "updatedAt")
      values (mid, 'cus_demo_' || i, plano, case when i = 4 then 'PAST_DUE' else 'ACTIVE' end::"MembershipStatus",
              now() - interval '60 days', date_trunc('week', now()), date_trunc('week', now()) + interval '7 days',
              case when i = 4 then now() - interval '6 days' else now() + make_interval(days => 9 + i) end, now(), now());
    insert into "QuotaTransaction" (id, "membershipId", type, amount, reason, "periodStart", "periodEnd", "idempotencyKey", "createdAt")
      values ('qt_demo_g' || i, mid, 'GRANT', case when i % 2 = 0 then 6 else 3 end, 'Cotas da semana', date_trunc('week', now()), date_trunc('week', now()) + interval '7 days', 'grant-demo-' || i, now() - interval '2 days');
    insert into "MembershipPayment" (id, "membershipId", "amountCents", status, "periodStart", "periodEnd", "dueAt", "paidAt", provider, method, "providerPaymentId", "createdAt", "updatedAt")
      values ('mp_demo_' || i, mid, case when i % 2 = 0 then 24000 else 15000 end, case when i = 4 then 'PENDING' else 'PAID' end::"PaymentStatus",
              now() - interval '30 days', now(), case when i = 4 then now() - interval '6 days' else now() - interval '25 days' end,
              case when i = 4 then null else now() - interval '26 days' end, 'mock', 'pix', 'mp-demo-' || i, now(), now());
  end loop;

  -- Passeios passados (3 semanas) com reservas pagas
  for k in 1..18 loop
    ex := 1 + ((k - 1) % 5);
    d := current_date - ((k * 3) % 21 + 1);
    insert into "ScheduleSlot" (id, "experienceId", date, "time", "startsAt", "capacityTotal", "bookedCount", status, "createdAt", "updatedAt")
      values ('slot_demo_' || k, exps[ex], to_char(d, 'YYYY-MM-DD'), horas[ex], (d + horas[ex]::time)::timestamp, 10, 0, 'OPEN', now(), now())
      on conflict do nothing;
    select id into sid from "ScheduleSlot" where "experienceId" = exps[ex] and date = to_char(d, 'YYYY-MM-DD') and "time" = horas[ex];
    n := 1 + (k % 4);
    tot := n * precos[ex];
    rid := 'res_demo_' || k;
    seq := seq + 1;
    insert into "Reservation" (id, code, "experienceId", "scheduleSlotId", "customerId", "membershipId", date, "time", "participantsCount", "unitPriceCents", "totalCents", "quotaCost", status, "acceptedTermsVersion", "createdAt", "updatedAt")
      values (rid, 'PV-' || seq, exps[ex], sid, 'cus_demo_' || (1 + (2 * ((k - 1) % 5) + (k - 1) / 5) % 10), case when k % 5 = 0 then 'mem_demo_' || (1 + k % 3) end, to_char(d, 'YYYY-MM-DD'), horas[ex], n, precos[ex], tot, case when k % 5 = 0 then n else 0 end, 'CONFIRMED', 'v1', d - 3, now());
    for i in 1..n loop
      insert into "ReservationParticipant" (id, "reservationId", name, "isMinor", "createdAt") values (rid || '_p' || i, rid, nomes[1 + (k + i) % 10], false, now());
    end loop;
    insert into "Payment" (id, "reservationId", provider, method, "providerPaymentId", "amountCents", status, "paidAt", "createdAt", "updatedAt")
      values ('pay_demo_' || k, rid, 'mock', 'pix', 'pp-demo-' || k, tot, 'PAID', d - 3, d - 3, now());
    update "ScheduleSlot" set "bookedCount" = "bookedCount" + n where id = sid;
  end loop;

end $$;

-- Reservas futuras nos passeios do seed: uma por passeio, algumas aguardando pagamento.
insert into "Reservation" (id, code, "experienceId", "scheduleSlotId", "customerId", date, "time", "participantsCount", "unitPriceCents", "totalCents", "quotaCost", status, "acceptedTermsVersion", "createdAt", "updatedAt")
select 'res_fut_' || row_number() over (order by s.date, s."time"), 'PV-' || (200 + row_number() over (order by s.date, s."time")), s."experienceId", s.id,
       'cus_demo_' || (10 + (row_number() over (order by s.date, s."time"))::int), s.date, s."time", 2, e."priceCents", 2 * e."priceCents", 0,
       case when row_number() over (order by s.date, s."time") % 3 = 0 then 'WAITING_PAYMENT' else 'CONFIRMED' end::"ReservationStatus", 'v1', now() - interval '1 day', now()
  from "ScheduleSlot" s join "Experience" e on e.id = s."experienceId"
 where s.date >= to_char(current_date, 'YYYY-MM-DD') and s.id not like 'slot_demo_%'
 limit 5;

insert into "ReservationParticipant" (id, "reservationId", name, "isMinor", "createdAt")
select r.id || '_p' || g, r.id, (array['Lara Moura', 'Otávio Reis', 'Paula Nunes', 'Rui Barros'])[1 + (g + length(r.id)) % 4], false, now()
  from "Reservation" r, generate_series(1, 2) g where r.id like 'res_fut_%';

insert into "Payment" (id, "reservationId", provider, method, "providerPaymentId", "amountCents", status, "paidAt", "createdAt", "updatedAt")
select 'pay_' || r.id, r.id, 'mock', 'pix', 'pp-' || r.id, r."totalCents", case when r.status = 'CONFIRMED' then 'PAID' else 'PENDING' end::"PaymentStatus",
       case when r.status = 'CONFIRMED' then now() - interval '1 day' end, now() - interval '1 day', now()
  from "Reservation" r where r.id like 'res_fut_%';

-- Saídas de hoje (para o painel do dia e a lista de participantes). Pares cliente/passeio escolhidos sem conflito.
insert into "ScheduleSlot" (id, "experienceId", date, "time", "startsAt", "capacityTotal", "bookedCount", status, "createdAt", "updatedAt") values
  ('slot_today_1', 'exp_nascer_sol', to_char(current_date, 'YYYY-MM-DD'), '04:30', (current_date + time '04:30')::timestamp, 10, 5, 'OPEN', now(), now()),
  ('slot_today_2', 'exp_remada_avulsa', to_char(current_date, 'YYYY-MM-DD'), '07:30', (current_date + time '07:30')::timestamp, 10, 3, 'OPEN', now(), now()),
  ('slot_today_3', 'exp_por_do_sol', to_char(current_date, 'YYYY-MM-DD'), '16:30', (current_date + time '16:30')::timestamp, 10, 4, 'OPEN', now(), now());

insert into "Reservation" (id, code, "experienceId", "scheduleSlotId", "customerId", date, "time", "participantsCount", "unitPriceCents", "totalCents", "quotaCost", status, "acceptedTermsVersion", "createdAt", "updatedAt") values
  ('res_today_1', 'PV-301', 'exp_nascer_sol', 'slot_today_1', 'cus_demo_8', to_char(current_date, 'YYYY-MM-DD'), '04:30', 3, 5000, 15000, 0, 'CONFIRMED', 'v1', now() - interval '2 days', now()),
  ('res_today_2', 'PV-302', 'exp_remada_avulsa', 'slot_today_2', 'cus_demo_9', to_char(current_date, 'YYYY-MM-DD'), '07:30', 2, 3500, 7000, 0, 'WAITING_PAYMENT', 'v1', now() - interval '3 hours', now()),
  ('res_today_3', 'PV-303', 'exp_por_do_sol', 'slot_today_3', 'cus_demo_10', to_char(current_date, 'YYYY-MM-DD'), '16:30', 4, 3500, 14000, 0, 'CONFIRMED', 'v1', now() - interval '1 day', now());

insert into "ReservationParticipant" (id, "reservationId", name, "isMinor", "createdAt")
select r.id || '_p' || g, r.id, (array['Lara Moura', 'Otávio Reis', 'Paula Nunes', 'Rui Barros', 'Sara Lopes'])[1 + (g + length(r.id)) % 5], false, now()
  from "Reservation" r, generate_series(1, 4) g where r.id like 'res_today_%' and g <= r."participantsCount";

insert into "Payment" (id, "reservationId", provider, method, "providerPaymentId", "amountCents", status, "paidAt", "createdAt", "updatedAt")
select 'pay_' || r.id, r.id, 'mock', 'pix', 'pp-' || r.id, r."totalCents", case when r.status = 'CONFIRMED' then 'PAID' else 'PENDING' end::"PaymentStatus",
       case when r.status = 'CONFIRMED' then now() - interval '1 day' end, now() - interval '1 day', now()
  from "Reservation" r where r.id like 'res_today_%';

commit;
