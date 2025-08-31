# Simple Dockerfile for Batch_Uploader
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

RUN npm run build

# Set default environment variables
ENV REDIS_URL=process.env.REDIS_URL
ENV DB_USER=process.env.DB_USER
ENV DB_PASSWORD=process.env.DB_PASSWORD
ENV DB_HOST=process.env.DB_HOST
ENV DB_PORT=process.env.DB_PORT
ENV DB_NAME=process.env.DB_NAME

CMD ["npm", "start"]