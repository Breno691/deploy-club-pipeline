FROM node:22-alpine
WORKDIR /app
COPY package.json ./
RUN npm install --omit=dev
COPY mobile-server/server.js ./server.js
COPY mobile-server/public ./public
EXPOSE 3200
CMD ["node", "server.js"]
