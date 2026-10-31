# Etapa 1: build do Vite (saída em dist/).
FROM node:20-alpine AS build
WORKDIR /app
# O Playwright é usado só nos scripts de captura; não baixa navegadores no build.
ENV PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD=1
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
RUN npm run build

# Etapa 2: Nginx servindo os arquivos estáticos. O SSL fica com o Traefik do Easypanel.
FROM nginx:1.27-alpine
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
