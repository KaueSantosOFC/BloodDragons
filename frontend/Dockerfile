# Stage 1: Build the Angular application
FROM node:20-slim AS build

WORKDIR /app

# Copia apenas os arquivos de dependência primeiro (otimiza cache)
COPY package*.json ./

# Instala dependências
RUN npm ci

# Copia o resto do código fonte
COPY . .

# Executa o build
RUN npm run build

# Stage 2: Serve com Nginx
FROM nginx:alpine

# Remove config default
RUN rm /etc/nginx/conf.d/default.conf

# Copia configuração Nginx customizada
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copia artefatos compilados do Angular
COPY --from=build /app/dist/app/browser /usr/share/nginx/html

EXPOSE 3000

CMD ["nginx", "-g", "daemon off;"]
