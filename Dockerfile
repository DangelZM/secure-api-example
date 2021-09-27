FROM node:16.3.0-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

FROM node:16.3.0-alpine AS server
WORKDIR /app
COPY package* ./
RUN npm install --production
COPY --from=builder ./app/build ./build
EXPOSE 9080
CMD ["node", "./build/server.js"]
