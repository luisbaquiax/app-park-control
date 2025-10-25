# Etapa 1: construir Angular
FROM node:22-alpine AS build

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

# Construye Angular en modo producción
RUN npm run build -- --configuration production

# Etapa 2: servir con Nginx
FROM nginx:1.28-alpine

# Copia el build de Angular al directorio que Nginx sirve por defecto
COPY --from=build /app/dist/app-park-control/browser /usr/share/nginx/html

# Exponer puerto 80
EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
