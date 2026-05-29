FROM node:22-alpine
WORKDIR /app
COPY package.json ./
RUN npm install --omit=dev
COPY server.js ./server.js
COPY public ./public
EXPOSE 3200
CMD ["node", "server.js"]
