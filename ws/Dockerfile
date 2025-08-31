FROM node:18-alpine

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

RUN npm run build

EXPOSE 7070

# Set default environment variables
ENV REDIS_URL=process.env.REDIS_URL

CMD ["npm", "start"]