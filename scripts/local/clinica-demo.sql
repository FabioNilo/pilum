-- Prepara a CÓPIA do banco de desenvolvimento da clínica (clinica_shots) para os prints do portfólio.
-- Nunca rodar no banco original nem em produção: troca marca, unidades e leads por dados fictícios.
-- Uso (ver README, seção "Clínica odontológica"):
--   docker compose -f docker-compose.dev.yml exec -T db psql -U clinica -d clinica_shots < clinica-demo.sql

-- Leads usam o default de tenantId pela configuração da sessão (RLS).
set app.tenant_id = '00000000-0000-4000-8000-000000000001';

-- Marca e contatos da clínica real saem da cópia (o capturador ainda troca o que sobrar no texto).
update "Tenant" set name = 'Clínica Exemplo Odontologia';
update "Settings" set "clinicName" = 'Clínica Exemplo Odontologia', "logoUrl" = null, instagram = null;
update "Unit" set name = 'Unidade Centro', city = 'Cidade A', address = 'Rua Exemplo, 100, Sala 1 - Centro, Cidade A - UF',
  whatsapp = '5500900000000', phone = '(00) 90000-0000', "mapsUrl" = null, "mapsEmbed" = null
  where position = (select min(position) from "Unit");
update "Unit" set name = 'Unidade Norte', city = 'Cidade B', address = 'Av. Exemplo, 200, 1º andar - Bairro Norte, Cidade B - UF',
  whatsapp = '5500900000001', phone = '(00) 90000-0001', "mapsUrl" = null, "mapsEmbed" = null
  where name <> 'Unidade Centro';

-- Leads de teste (E2E) viram um quadro fictício com as 4 colunas preenchidas.
delete from "Lead";
with u as (select id, row_number() over (order by position) n from "Unit"),
s as (select id, title from "Service"),
d(name, phone, un, svc, st, hrs, contact_min) as (values
  ('Renata Oliveira', '5500900001001', 1, 'Clareamento dental', 'NOVO', 1, null),
  ('Marcos Vinícius Prado', '5500900001002', 2, 'Implantes dentários', 'NOVO', 3, null),
  ('Sônia Mendes', '5500900001003', 1, 'Avaliação e diagnóstico', 'NOVO', 5, null),
  ('Diego Nascimento', '5500900001004', 2, 'Ortodontia', 'CONTATADO', 20, 12),
  ('Larissa Cunha', '5500900001005', 1, 'Limpeza e prevenção', 'CONTATADO', 26, 8),
  ('Paulo Henrique Dias', '5500900001006', 1, 'Tratamento de canal', 'AGENDADO', 30, 15),
  ('Fernanda Lopes', '5500900001007', 2, 'Próteses e coroas', 'AGENDADO', 48, 20),
  ('Ricardo Moura', '5500900001008', 1, 'Restaurações', 'AGENDADO', 52, 6),
  ('Tatiane Freitas', '5500900001009', 2, 'Clareamento dental', 'PERDIDO', 96, 40))
insert into "Lead" (id, name, phone, "unitId", "serviceId", reason, "consentAt", status, "firstContactAt", "createdAt", "preferredAt")
select gen_random_uuid()::text, d.name, d.phone, u.id, s.id, null, now() - make_interval(hours => d.hrs), d.st::"LeadStatus",
  case when d.contact_min is null then null else now() - make_interval(hours => d.hrs) + make_interval(mins => d.contact_min) end,
  now() - make_interval(hours => d.hrs),
  -- Preferência em horário de atendimento (o banco guarda UTC; a clínica está em UTC-3).
  date_trunc('day', now()) + interval '3 days' + make_interval(hours => 12 + (d.hrs % 8))
from d join u on u.n = d.un join s on s.title = d.svc;
