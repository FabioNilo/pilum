import { execSync } from "node:child_process";
import type { Page } from "playwright";
import { FX, type Target } from "./lib";
import { firstPaidRevenueId } from "./fixtures/condo";
import { marmitasActions } from "./fixtures/marmitas";

const EDLA = "C:/Users/cippa/Desktop/Edla";
const NEIDE = "C:/Users/cippa/OneDrive/Documentos/neide";
const CANOA = "C:/Users/cippa/OneDrive/Área de Trabalho/react-projects/canoa/na-kai-canoa";
const VITE = "npx vite --port {port} --strictPort --host 127.0.0.1";

async function fillLogin(page: Page, user: string, pass: string, userSel = 'input[type="email"], input[name="username"], input#username, input#email', passSel = 'input[type="password"]') {
  await page.locator(userSel).first().fill(user);
  await page.locator(passSel).first().fill(pass);
  await page.locator(passSel).first().press("Enter");
}

const LOCAL = "C:/get/portfolio-landing/scripts/local";

async function scrollTo(page: Page, selector: string, offset = 0) {
  await page.evaluate(
    ([sel, off]) => {
      const el = document.querySelector(sel as string);
      if (el) window.scrollTo(0, el.getBoundingClientRect().top + window.scrollY + (off as number));
    },
    [selector, offset],
  );
  await page.waitForTimeout(500);
}

/** Consulta um valor no Postgres local (docker shots-pg). */
function pg(db: string, sql: string) {
  return execSync(`docker exec shots-pg psql -U postgres -d ${db} -t -A -c "${sql.replace(/"/g, '\\"')}"`, { encoding: "utf8" }).trim();
}

const PLATAFORMA_DB = "postgres://postgres:postgres@127.0.0.1:55432/plataforma";

export const targets: Target[] = [
  {
    // Backend real (Hono) contra Postgres local no Docker com dados fictícios
    // (scripts/local/restaurante-demo.sql). Veja scripts/local/README.md.
    id: "restaurante-mesa",
    cwd: "C:/get/restaurantemodelo",
    cmd: [`npx tsx --import file:///${LOCAL}/neon-local.mjs server/node.ts`, VITE],
    port: 5202,
    env: {
      ENV_FILE: `${LOCAL}/restaurante.env`,
      DATABASE_URL: "postgres://postgres:postgres@127.0.0.1:55432/restaurante",
      SESSION_SECRET: "local-shots-secret-0123456789abcdef0123456789",
      PORT: "8787",
      VITE_API_BASE_URL: "/api",
    },
    // Wordmark do cliente ("Nosso" + "BISTRÔ · CAFÉ") vira marca genérica.
    replace: [
      [/^\s*Nosso\s*$/, "Seu"],
      [/BISTR[ÔO]\s*·\s*CAF[ÉE]/gi, "RESTAURANTE"],
      [/Bistr[ôo]\s*·\s*Caf[ée]/g, "Restaurante"],
      [/Ilh[ée]us\s*-\s*BA/g, "Sua Cidade"],
    ],
    async run({ page, goto, shot }) {
      const m = await page("mobile");
      await goto(m, "/");
      await shot(m, "inicio-mobile", "Site com a marca do restaurante, pronto para o celular");
      await scrollTo(m, "#cardapio", 0);
      await shot(m, "cardapio-mobile", "Cardápio com busca, categorias e opções de sabor e tamanho");
      await goto(m, "/mesa/demo-mesa-3");
      await shot(m, "mesa-qr", "Pedido na mesa pelo QR Code: vai direto para o caixa");

      const d = await page("desktop");
      await goto(d, "/auth");
      await fillLogin(d, "admin", "demo12345", "#username", "#password");
      await d.waitForURL((u) => u.pathname.startsWith("/admin"));
      await goto(d, "/admin/mesas");
      await shot(d, "mesas", "Mapa das mesas ao vivo, com a conta de cada uma");
      await goto(d, "/admin/delivery");
      await shot(d, "delivery", "Pedidos de delivery em andamento, do preparo à entrega");
      await goto(d, "/admin/metricas");
      await shot(d, "metricas", "Métricas: vendas, ticket médio e vendas por canal");
      await goto(d, "/admin/desempenho");
      await shot(d, "desempenho", "Produtos que mais vendem e os que estão parados");
    },
  },
  {
    // O front de massas segue o mesmo contrato da API do restaurante: roda contra ela,
    // com o banco local "massas" (cardápio do próprio projeto, gerado por scripts/local/seed-massas.ts).
    id: "delivery-proprio",
    cwd: `${NEIDE}/massas-italianas-express`,
    cmd: [`cd /d C:\\get\\restaurantemodelo && npx tsx --import file:///${LOCAL}/neon-local.mjs server/node.ts`, VITE],
    port: 5204,
    env: {
      ENV_FILE: `${LOCAL}/massas.env`,
      DATABASE_URL: "postgres://postgres:postgres@127.0.0.1:55432/massas",
      NEON_LOCAL_ENDPOINT: "http://127.0.0.1:4445/sql",
      SESSION_SECRET: "local-shots-secret-0123456789abcdef0123456789",
      PORT: "8788",
      VITE_CHIPTRACK_WEBHOOK_BASE_URL: "/api",
      VITE_CHIPTRACK_WEBHOOK_KEY: "local",
    },
    runtimeConfig: {
      VITE_CHIPTRACK_WEBHOOK_BASE_URL: "/api",
      VITE_CHIPTRACK_WEBHOOK_KEY: "local",
      VITE_MARMITAS_PUBLIC_API: "n8n",
      VITE_MARMITAS_AUTH_API: "n8n",
      VITE_MARMITAS_ADMIN_API: "n8n",
    },
    proxy: { prefix: "/api", to: "http://127.0.0.1:8788" },
    replace: [
      [/^\s*Pasta\s*$/, "Sua"],
      [/^\s*Brasiliana\s*$/, "Cantina"],
    ],
    // Logo do cliente (pasta.jpg) vira um ícone neutro; fotos de pratos com a embalagem da marca ficam fora.
    css: `img[src*="pasta.jpg"], img[src*="pasta."] { content: url("data:image/svg+xml,${encodeURIComponent(
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" fill="#7a1f1f"/><path d="M22 18v12a4 4 0 0 0 4 4v12M26 18v10M30 18v12a4 4 0 0 1-4 4M40 18c-4 0-5 6-5 12h5v16" stroke="#f3c969" stroke-width="3" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    )}"); object-fit: contain; }
    img[src*="/menu/"], img[src*="risoto-"], img[src*="nhoque-"], img[src*="talharim-"] { visibility: hidden !important; }`,
    async run({ page, goto, shot }) {
      const d = await page("desktop");
      await goto(d, "/");
      await shot(d, "inicio", "Site de pedidos com a marca do restaurante, sem app de terceiros");
      await scrollTo(d, "#cardapio", -20);
      await shot(d, "cardapio", "Cardápio por categoria, com fotos e tamanhos");

      const m = await page("mobile");
      await goto(m, "/");
      await scrollTo(m, "#cardapio", 0);
      await shot(m, "cardapio-mobile", "No celular, o cliente escolhe e adiciona em poucos toques");
      const add = m.getByRole("button", { name: /Adicionar/i });
      await add.nth(0).click();
      await m.waitForTimeout(400);
      await add.nth(2).click();
      await m.waitForTimeout(400);
      await m.locator("header button:has(svg.lucide-shopping-cart)").first().click();
      await m.waitForTimeout(1200);
      await shot(m, "carrinho", "Carrinho com taxa de entrega calculada pelo bairro");

      const pedido = pg("massas", "select id from pedidos_delivery where tracking_token = 'demo-tracking-massas'");
      await goto(m, `/pedido/${pedido}?token=demo-tracking-massas`);
      await shot(m, "acompanhamento", "O cliente acompanha o pedido em tempo real");
    },
  },
  {
    // Front de marmitas no modo n8n, contra a API local (banco "marmitas", fotos e nomes
    // do próprio projeto, preços fictícios). Login pelo Supabase simulado (scripts/fixtures/supabase.ts);
    // CRM de pedidos, caixa e financeiro respondem com scripts/fixtures/marmitas.ts.
    id: "marmitas",
    cwd: `${NEIDE}/marmitas-fit-express`,
    cmd: [`cd /d C:\\get\\restaurantemodelo && npx tsx --import file:///${LOCAL}/neon-local.mjs server/node.ts`, VITE],
    port: 5205,
    env: {
      ENV_FILE: `${LOCAL}/marmitas.env`,
      DATABASE_URL: "postgres://postgres:postgres@127.0.0.1:55432/marmitas",
      NEON_LOCAL_ENDPOINT: "http://127.0.0.1:4446/sql",
      SESSION_SECRET: "local-shots-secret-0123456789abcdef0123456789",
      PORT: "8789",
      VITE_SUPABASE_URL: `${FX}/marmitas-sb`,
      VITE_SUPABASE_PUBLISHABLE_KEY: "fx-anon-key",
      VITE_SUPABASE_PROJECT_ID: "fx",
      VITE_CHIPTRACK_WEBHOOK_BASE_URL: "/api",
      VITE_CHIPTRACK_WEBHOOK_KEY: "local",
      VITE_MARMITAS_PUBLIC_API: "n8n",
      VITE_MARMITAS_AUTH_API: "n8n",
      VITE_MARMITAS_ADMIN_API: "n8n",
    },
    runtimeConfig: {
      VITE_SUPABASE_URL: `${FX}/marmitas-sb`,
      VITE_SUPABASE_PUBLISHABLE_KEY: "fx-anon-key",
      VITE_SUPABASE_PROJECT_ID: "fx",
      VITE_CHIPTRACK_WEBHOOK_BASE_URL: "/api",
      VITE_CHIPTRACK_WEBHOOK_KEY: "local",
      VITE_MARMITAS_PUBLIC_API: "n8n",
      VITE_MARMITAS_AUTH_API: "n8n",
      VITE_MARMITAS_ADMIN_API: "n8n",
    },
    proxy: { prefix: "/api", to: "http://127.0.0.1:8789", rewrite: [/^\/api\/marmitas\//, "/api/massas/"],
      actions: marmitasActions,
      // Na API local "mostrar_aviso_fechado" é sempre true; aqui só deve aparecer com a loja fechada.
      transform: (path, json) =>
        path.endsWith("/site-status") && json?.data ? { ...json, data: { ...json.data, mostrar_aviso_fechado: !json.data.entregas_abertas_agora } } : json,
    },
    files: { prefix: "/__fx/marmitas", dir: `${NEIDE}/marmitas-fit-express/data/n8n-catalog-images` },
    async init(context) {
      await context.addInitScript(() => localStorage.setItem("lead_modal_dismissed", String(Date.now())));
    },
    async run({ page, goto, shot }) {
      const m = await page("mobile");
      await goto(m, "/");
      await shot(m, "inicio-mobile", "Loja online com a sua marca, pronta para o celular");
      await scrollTo(m, "#cardapio", 0);
      await shot(m, "cardapio-mobile", "Cardápio com fotos reais dos pratos e carrinho");

      const d = await page("desktop");
      await goto(d, "/");
      await scrollTo(d, "#cardapio", -20);
      await shot(d, "cardapio", "Catálogo organizado por categoria, com estoque controlado");
      await goto(d, "/auth");
      await fillLogin(d, "admin@exemplo.com", "demo12345", "#email", "#password");
      await d.waitForURL((u) => u.pathname.startsWith("/admin"), { timeout: 30_000 });
      await goto(d, "/admin");
      for (const [tab, name, caption] of [
        ["Pedidos", "pedidos", "CRM de pedidos: status, cliente e contato direto pelo WhatsApp"],
        ["Caixa", "caixa", "Caixa com entradas, saídas e saldo do período"],
        ["Financeiro", "financeiro", "Financeiro: faturamento, custos, despesas e margem"],
      ] as const) {
        await d.getByRole("tab", { name: new RegExp(tab, "i") }).first().click();
        await d.waitForTimeout(2500);
        const box = await d.getByRole("tablist").first().boundingBox();
        await d.mouse.move(720, 450);
        if (box) await d.mouse.wheel(0, box.y - 16);
        await d.waitForTimeout(600);
        await shot(d, name, caption);
      }
    },
  },
  {
    // Front da clínica contra o servidor de fixtures (scripts/fixtures/dental.ts), nada de n8n/Supabase reais.
    id: "clinica-odonto",
    cwd: `${NEIDE}/dental-aura-clinic`,
    cmd: VITE,
    port: 5206,
    env: {
      VITE_DENTAL_AURA_API_BASE_URL: `${FX}/dental`,
      VITE_SUPABASE_URL: `${FX}/dental-sb`,
      VITE_SUPABASE_PUBLISHABLE_KEY: "fx-anon-key",
      VITE_SUPABASE_PROJECT_ID: "fx",
    },
    async run({ page, goto, shot }) {
      const d = await page("desktop");
      await goto(d, "/");
      await shot(d, "site", "Site da clínica com botão de agendamento");

      const m = await page("mobile");
      await goto(m, "/");
      await shot(m, "site-mobile", "Site pensado para o paciente que chega pelo celular");

      await goto(d, "/admin/login");
      await fillLogin(d, "admin@clinica.com", "demo12345");
      await d.waitForURL((u) => u.pathname.startsWith("/admin") && !u.pathname.includes("login"), { timeout: 30_000 });
      await goto(d, "/admin");
      await shot(d, "visao-geral", "Visão geral do dia: solicitações, confirmações e próximos pacientes");
      await goto(d, "/admin/solicitacoes");
      await shot(d, "solicitacoes", "Pedidos de agendamento vindos do assistente de WhatsApp");
      await goto(d, "/admin/agenda");
      await shot(d, "agenda", "Agenda por profissional, com status de cada consulta");
      await goto(d, "/admin/financeiro");
      await shot(d, "financeiro", "Financeiro: faturamento, recebimentos, orçamentos e inadimplentes");
    },
  },
  {
    // Login e dados pelo Supabase simulado (scripts/fixtures/condo.ts); chaves do .env.local sobrescritas.
    id: "condominio",
    cwd: `${EDLA}/condominio/blok5gestao`,
    cmd: "npx vite dev --port {port} --strictPort --host 127.0.0.1",
    port: 5207,
    keepLogos: true,
    env: {
      VITE_SUPABASE_URL: `${FX}/condo`,
      VITE_SUPABASE_ANON_KEY: "fx-anon-key-0123456789abcdef",
      SUPABASE_SERVICE_ROLE_KEY: "disabled-local",
      SUPABASE_JWT_SECRET: "local-shots-jwt-secret-0123456789",
    },
    async run({ page, goto, shot }) {
      const d = await page("desktop");
      await goto(d, "/");
      await shot(d, "inicio", "Receitas, despesas e comprovantes do condomínio em um só lugar");
      await goto(d, "/login");
      await fillLogin(d, "sindico@exemplo.com", "demo12345", "#login-email", "#login-password");
      await d.waitForURL((u) => u.pathname.startsWith("/painel"), { timeout: 30_000 });
      await goto(d, "/painel");
      await d.waitForTimeout(2500);
      await shot(d, "painel", "Painel com receitas, despesas e saldo do mês");
      await goto(d, "/receitas");
      await shot(d, "receitas", "Receitas por unidade e competência, com status de pagamento");
      await goto(d, "/inadimplencia");
      await shot(d, "inadimplencia", "Lista de inadimplentes sempre atualizada");
      await goto(d, "/relatorio");
      await shot(d, "relatorio", "Relatório mensal pronto para prestar contas, em PDF");
      await goto(d, `/comprovante/${firstPaidRevenueId}`);
      await shot(d, "comprovante", "Recibo numerado com valor por extenso");
    },
  },
  {
    // Site de captação de um escritório (Vite + React). O formulário só é preenchido, nunca enviado
    // (o envio abre o WhatsApp do escritório). Dados pessoais e fotos da advogada são trocados/borrados.
    id: "escritorio-advocacia",
    cwd: "C:/get/advocia",
    cmd: VITE,
    port: 5209,
    replace: [
      [/(?:Dra?\.\s*)?Mileide\s+Cordeiro\s+Advocacia/gi, "Escritório Exemplo Advocacia"],
      [/(?:Dra?\.\s*)?Mileide\s+Cordeiro/gi, "Dra. Exemplo"],
      [/OAB\s*\/?\s*BA\s*:?\s*59\.?899/gi, "OAB/XX 00000"],
      [/\(73\)\s*98859-9019/g, "(00) 90000-0000"],
      [/mileideadvogada@gmail\.com/gi, "contato@exemplo.com"],
      [/Faculdade de Ilh[ée]us/gi, "Faculdade de Direito"],
      [/Edif[íi]cio Comercial Fraga Center,?\s*\d*/gi, "Edifício Comercial Exemplo, 123"],
    ],
    css: `img[src*="mileide"], img[src*="cordeiro"] { filter: blur(22px) saturate(1.05) !important; transform: scale(1.12) !important; }`,
    async run({ page, goto, shot }) {
      const fill = async (p: Page) => {
        await p.locator('input[name="nome"]').first().fill("Maria Exemplo");
        await p.locator('input[name="contato"]').first().fill("(00) 90000-0000");
        await p.locator('textarea[name="caso"]').first().fill("Tenho 62 anos e quero saber se já posso me aposentar.");
      };
      const toSection = async (p: Page, text: string) => {
        await p.locator("section", { has: p.getByText(text, { exact: false }) }).first().evaluate((el) => el.scrollIntoView({ block: "start" }));
        await p.waitForTimeout(500);
      };

      const d = await page("desktop");
      await goto(d, "/");
      await fill(d);
      await shot(d, "hero", "Formulário de análise: o caso do cliente chega pronto no WhatsApp do escritório");
      await toSection(d, "Nossos Serviços");
      await shot(d, "areas", "Áreas de atuação apresentadas com clareza, com o que está incluso em cada uma");
      await toSection(d, "Dúvidas Frequentes");
      await d.getByRole("button", { name: /Quanto tempo de contribuição/i }).first().click();
      await d.waitForTimeout(500);
      await shot(d, "duvidas", "Perguntas frequentes que respondem as dúvidas antes do primeiro contato");
      await toSection(d, "Entre em Contato");
      await shot(d, "contato", "Contato, endereço e horário de atendimento num só lugar");

      const m = await page("mobile");
      await goto(m, "/");
      await shot(m, "hero-mobile", "No celular, o cliente descreve o caso e envia em poucos toques");
      await toSection(m, "Nossos Serviços");
      await shot(m, "areas-mobile", "Áreas de atuação no celular");
    },
  },
  {
    // Sistema de reservas de passeios (Next.js + Prisma) contra o Postgres local "canoa"
    // (seed do projeto + scripts/local/canoa-demo.sql). Variáveis do .env do projeto sobrescritas.
    id: "reservas-passeios",
    cwd: CANOA,
    cmd: "npx next dev -p {port} -H 127.0.0.1",
    port: 5208,
    env: {
      DATABASE_URL: "postgresql://postgres:postgres@127.0.0.1:55432/canoa?schema=public",
      AUTH_SECRET: "local-shots-auth-secret-0123456789abcdef",
      NEXTAUTH_URL: "http://127.0.0.1:5208",
      ADMIN_EMAIL: "admin@exemplo.com",
      ADMIN_PASSWORD: "demo12345",
      PAYMENT_PROVIDER: "mock",
      PAYMENT_WEBHOOK_SECRET: "mock-local",
    },
    replace: [
      [/ILH[ÉE]US\s+CANOE\s+VA['’]?A/gi, "SUA MARCA"],
      [/Pontal\s+V[Aa]['’]?[Aa]/gi, "Sua Marca"],
      [/Na[\s-]*Kai/gi, "Sua Marca"],
    ],
    // Fotos do cliente mostram pessoas reais: ficam borradas (só a cor do mar aparece). O fundo da home vira um degradê.
    css: `img[src*="experiences"] { filter: blur(18px) saturate(1.1); transform: scale(1.15); }
      .hero-ocean, .canoe-sunrise { background-image: linear-gradient(180deg, #0b4f7a 0%, #0a6f9a 45%, #031b3a 100%) !important; }`,
    async run({ page, goto, shot }) {
      const m = await page("mobile");
      await goto(m, "/");
      await shot(m, "inicio-mobile", "Site de passeios com a sua marca, pronto para o celular");
      await goto(m, "/experiencias/por-do-sol");
      await shot(m, "passeio-mobile", "Página de cada passeio, com preço, regras e botão de reservar");

      const d = await page("desktop");
      await goto(d, "/experiencias");
      await shot(d, "catalogo", "Catálogo de passeios com foto, preço e descrição");
      await goto(d, "/reserva");
      await shot(d, "reserva", "Reserva em etapas: passeio, data, dados, pagamento e revisão");

      await goto(d, "/associado/login");
      await fillLogin(d, "admin@exemplo.com", "demo12345", 'input[type="email"]', 'input[type="password"]');
      await d.waitForURL((u) => !u.pathname.includes("/login"), { timeout: 60_000 });
      await goto(d, "/admin");
      await shot(d, "painel", "Painel do dia: reservas, vagas e faturamento");
      await goto(d, "/admin/passeios");
      await shot(d, "agenda", "Agenda de saídas, com vagas ocupadas e canoas de cada passeio");
      await goto(d, "/admin/participantes");
      await shot(d, "participantes", "Lista de participantes de cada saída, para a equipe conferir no dia");
      await goto(d, "/admin/associados");
      await shot(d, "associados", "Associados com plano, cotas da semana e mensalidade em dia ou em atraso");
      await goto(d, "/admin/caixa");
      await shot(d, "caixa", "Caixa com os pagamentos recebidos");
    },
  },
  {
    // Next.js + Prisma contra Postgres local (seed do projeto + scripts/local/plataforma-demo.sql).
    // Todas as variáveis sensíveis do .env do projeto são sobrescritas por valores locais/inertes.
    id: "plataforma-restaurantes",
    cwd: "C:/get/plataforma-restaurantes",
    cmd: "npx next dev -p {port} -H 127.0.0.1",
    port: 5203,
    env: {
      DATABASE_URL: PLATAFORMA_DB,
      DATABASE_URL_UNPOOLED: PLATAFORMA_DB,
      AUTH_SECRET: "local-shots-auth-secret-0123456789abcdef",
      AUTH_TRUST_HOST: "true",
      AUTH_URL: "http://127.0.0.1:5203",
      DATA_ENCRYPTION_KEY: "local-shots-encryption-key-0123456789",
      DEFAULT_TENANT_SLUG: "demo",
      MERCADOPAGO_ACCESS_TOKEN: "disabled-local",
      MERCADOPAGO_WEBHOOK_URL: "http://127.0.0.1:1/disabled",
      MERCADOPAGO_API_URL: "http://127.0.0.1:1/disabled",
      AWS_ACCESS_KEY_ID: "disabled-local",
      AWS_SECRET_ACCESS_KEY: "disabled-local",
      CRON_SECRET: "disabled-local",
    },
    async run({ page, goto, shot }) {
      const motoboyToken = pg("plataforma", 'select "accessToken" from "Motoboy" limit 1');
      const mesaToken = pg("plataforma", 'select "qrToken" from "Table" order by name limit 1');

      const m = await page("mobile");
      await goto(m, "/demo");
      await shot(m, "loja-mobile", "Loja online com cardápio, destaques e carrinho");
      await goto(m, `/demo/mesa/${mesaToken}`);
      await shot(m, "mesa-mobile", "Comanda da mesa pelo QR Code, com pagamento online");
      await goto(m, `/entregador/${motoboyToken}`);
      await m.locator('input[name="pin"]').fill("1234");
      await m.locator('input[name="pin"]').press("Enter");
      await m.waitForTimeout(3000);
      await goto(m, `/entregador/${motoboyToken}`);
      await shot(m, "entregador", "App do motoboy: ele atualiza a entrega pelo celular");

      const d = await page("desktop");
      await goto(d, "/login");
      await fillLogin(d, "dono@demo.com", "senha123", 'input[name="email"]', 'input[name="password"]');
      await d.waitForURL((u) => u.pathname.startsWith("/painel"), { timeout: 60_000 });
      await goto(d, "/painel");
      await shot(d, "pedidos", "Quadro de pedidos em tempo real, com impressão automática");
      await goto(d, "/painel/metricas");
      await shot(d, "metricas", "Métricas de vendas e desempenho do restaurante");
      await goto(d, "/painel/estoque");
      await shot(d, "estoque", "Estoque de bebidas com baixa automática e alerta de reposição");
      await goto(d, "/painel/fidelidade");
      await shot(d, "fidelidade", "Programa de fidelidade: pontos e recompensas");
    },
  },
  {
    id: "consultorio-psi",
    cwd: `${EDLA}/psynote`,
    cmd: VITE,
    port: 5201,
    env: { VITE_PSYNOTE_DATA_SOURCE: "mock" },
    keepLogos: true,
    async run({ page, goto, shot }) {
      const d = await page("desktop");
      await goto(d, "/login");
      await fillLogin(d, "demo@psynote.com", "demo123");
      await d.waitForURL((u) => !u.pathname.startsWith("/login"));
      await goto(d, "/");
      await shot(d, "dashboard", "Painel do dia: sessões, pacientes ativos e pendências financeiras");
      await goto(d, "/agenda");
      await shot(d, "agenda", "Agenda de atendimentos da semana");
      await goto(d, "/pacientes");
      await shot(d, "pacientes", "Cadastro de pacientes com status, contatos e próxima sessão");
      await goto(d, "/anamnese");
      await shot(d, "anamnese", "Anamnese e documentação clínica organizadas");
      await goto(d, "/financeiro");
      await shot(d, "financeiro", "Financeiro: faturas, pagamentos e valores em aberto");

      const m = await page("mobile");
      await goto(m, "/login");
      await fillLogin(m, "demo@psynote.com", "demo123");
      await m.waitForURL((u) => !u.pathname.startsWith("/login"));
      await goto(m, "/agenda");
      await shot(m, "agenda-mobile", "Tudo funciona no celular, entre um atendimento e outro");
    },
  },
];
