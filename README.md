# Pilum Code — landing page

Portfólio por nicho (restaurantes, delivery, marmitas, clínicas, condomínios), com slideshow das telas de cada sistema.
React 18 + Vite 5 + Tailwind 3. Deploy estático (Vercel: `vercel.json` já incluso).

```bash
npm install
npm run dev        # http://localhost:5180
npm run build      # gera dist/
npm run check:anon # garante que nenhum nome de cliente vazou para src/, public/ e dist/
```

## Onde editar

| O quê | Arquivo |
|---|---|
| WhatsApp, e-mail, cidade, GitHub | `src/config.ts` (**preencha o WhatsApp antes de publicar**) |
| Textos dos projetos (problema, solução, benefícios), link de demo, vídeo | `src/data/projects.ts` |
| Prints de cada projeto (gerado automaticamente) | `src/data/shots.json` + `public/shots/<id>/` |
| Logo / símbolo | `src/components/Logo.tsx` (originais em `public/brand/`) |
| Cores e fontes | `tailwind.config.ts`, `src/index.css` |

Para mostrar um vídeo (YouTube/Loom) num projeto, preencha `videoUrl` com a URL de *embed*; ele vira o primeiro slide.
Para mostrar o botão "Ver demonstração", preencha `demoUrl` com um deploy **anonimizado** (nunca o site do cliente).

## Refazer os prints

`npm run capture` sobe cada sistema localmente, navega com Playwright e salva os prints em webp.
`npm run capture -- condominio clinica-odonto` captura só os alvos indicados; `CAPTURE_DEBUG=1` mostra os logs.

Os prints nunca usam dados reais:

- **Anonimização:** nomes de clientes viram nomes genéricos e logos são escondidos (`scripts/lib.ts`, `GLOBAL_REPLACE` e `replace`/`css` por alvo).
- **Rede de segurança:** qualquer chamada a backends de produção (n8n no easypanel, Supabase, Neon) é bloqueada.
- **Backends locais:**
  - psicólogo: mock embutido no próprio app
  - clínica odonto e condomínio: servidor de fixtures (`scripts/fixtures/`, porta 4999)
  - restaurante, massas e marmitas: API real do `restaurantemodelo` contra um Postgres local com dados fictícios
  - plataforma: Next.js + Prisma contra o mesmo Postgres

### Preparar o Postgres local (uma vez; precisa do Docker Desktop aberto)

```bash
docker network create shots-net
docker run -d --name shots-pg --network shots-net -e POSTGRES_PASSWORD=postgres -p 55432:5432 postgres:17
docker exec shots-pg psql -U postgres -c "create database restaurante;" -c "create database massas;" -c "create database marmitas;" -c "create database plataforma;"
# Proxies HTTP do driver Neon (um por banco)
for p in "restaurante 4444" "massas 4445" "marmitas 4446"; do set -- $p
  docker run -d --name shots-neon-$1 --network shots-net -e PG_CONNECTION_STRING=postgres://postgres:postgres@shots-pg:5432/$1 -p $2:4444 ghcr.io/timowilhelm/local-neon-http-proxy:main
done

# Restaurante / massas / marmitas: migrations + seed do restaurantemodelo, depois os dados fictícios
cd C:/get/restaurantemodelo
for db in restaurante massas marmitas; do
  ENV_FILE=C:/get/portfolio-landing/scripts/local/$db.env npx tsx scripts/db-migrate.ts
  ENV_FILE=C:/get/portfolio-landing/scripts/local/$db.env npx tsx scripts/db-seed.ts
done
cd C:/get/portfolio-landing/scripts/local
docker exec -i shots-pg psql -U postgres -d restaurante < restaurante-demo.sql
npx tsx seed-massas.ts   | docker exec -i shots-pg psql -U postgres -d massas
npx tsx seed-marmitas.ts | docker exec -i shots-pg psql -U postgres -d marmitas

# Plataforma: migrations + seeds do projeto, depois os pedidos fictícios
cd C:/get/plataforma-restaurantes
export DATABASE_URL=postgres://postgres:postgres@127.0.0.1:55432/plataforma DATABASE_URL_UNPOOLED=$DATABASE_URL
npx prisma migrate deploy && npx tsx prisma/seed.ts
docker exec -i shots-pg psql -U postgres -d plataforma < C:/get/portfolio-landing/scripts/local/plataforma-demo.sql
```

### Escritório de advocacia e reservas de passeios

```bash
# Advocacia (Vite): só instalar as dependências do projeto, sem alterar o package-lock
cd C:/get/advocia && npm ci

# Passeios (Next.js + Prisma): banco próprio e dados fictícios
docker exec shots-pg psql -U postgres -c "create database canoa;"
cd "C:/Users/cippa/OneDrive/Área de Trabalho/react-projects/canoa/na-kai-canoa"
export DATABASE_URL="postgresql://postgres:postgres@127.0.0.1:55432/canoa?schema=public" AUTH_SECRET=local-shots-auth-secret-0123456789abcdef   NEXTAUTH_URL=http://127.0.0.1:5208 ADMIN_EMAIL=admin@exemplo.com ADMIN_PASSWORD=demo12345 PAYMENT_PROVIDER=mock PAYMENT_WEBHOOK_SECRET=mock-local
npx prisma migrate deploy && npx prisma db seed
docker exec -i shots-pg psql -U postgres -d canoa < C:/get/portfolio-landing/scripts/local/canoa-demo.sql
```

Cuidados de anonimização desses dois: as fotos reais (advogada e pessoas nos passeios) saem **borradas** pelo CSS do alvo, e o capturador avisa com `⚠ possível dado de cliente` se algum nome, telefone ou endereço dos clientes sobrar no texto da página antes do print. Se aparecer o aviso, adicione a regra em `replace` do alvo e capture de novo.

Nota: o container `shots-neon-restaurante` foi criado originalmente como `shots-neon`. Os nomes não importam, só as portas.

Para remover tudo depois: `docker rm -f shots-pg shots-neon shots-neon-massas shots-neon-marmitas && docker network rm shots-net`.

Depois de capturar, **confira os prints visualmente** e rode `npm run check:anon`.
