# Stage 1: Build the application
FROM node:20-slim AS build

WORKDIR /app

# Copia APENAS os arquivos de dependência primeiro (otimiza o cache de camadas do Docker)
COPY package*.json ./

# Usa 'npm ci' em vez de 'npm install'. É mais rápido, limpo e consome menos memória.
RUN npm ci

# Copia o resto do código fonte
COPY . .

# LIMITA a memória RAM do Node.js durante o build (evita travar instâncias pequenas)
# O valor 768 significa 768MB, deixando um pouco de RAM para o sistema operacional respirar.
#ENV NODE_OPTIONS="--max_old_space_size=768" teste

# Executa o build
RUN npm run build

# Stage 2: Run the application (Imagem final super leve)
FROM node:20-slim

WORKDIR /app

# Copia estritamente os artefatos compilados do Stage 1
COPY --from=build /app/dist/app ./dist/app

# Expõe a porta
EXPOSE 3000

# Variáveis de ambiente de produção
ENV PORT=3000
ENV HOST=0.0.0.0
ENV NODE_ENV=production

# Inicia o servidor SSR
CMD ["node", "dist/app/server/server.mjs"]
