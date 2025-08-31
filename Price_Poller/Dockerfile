FROM node:18-alpine

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

RUN npm run build

EXPOSE 3000

# Set default environment variables
ENV BINANCE_WS_URL=process.env.BINANCE_WS_URL
ENV REDIS_URL=process.env.REDIS_URL

CMD ["npm", "start"]