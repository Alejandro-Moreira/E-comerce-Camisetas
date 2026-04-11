FROM node:18-alpine

# Set the active profile
ENV NODE_ENV=production

WORKDIR /app

# Archivos de caché
COPY package*.json ./

# Carga limpia de librerías para Node Alpine (producción tier)
RUN npm install --omit=dev

# Move source code
COPY . .

# Exposure del puerto de backend
EXPOSE 5000

# Script boot
CMD ["node", "server.js"]
