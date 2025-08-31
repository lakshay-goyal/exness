# Price Poller

A Node.js TypeScript application that connects to Binance WebSocket API to stream real-time cryptocurrency trade data and stores it in Redis.

## Features

- Real-time WebSocket connection to Binance API
- Streams BTCUSDT, ETHUSDT, and SOLUSDT trade data
- Stores trade data in Redis queue
- Computes bid/ask prices
- Redis pub/sub for real-time price updates

## Docker Setup

### Prerequisites

- Docker
- Docker Compose

### Quick Start

1. **Build and run with Docker Compose:**
   ```bash
   docker-compose up --build
   ```

2. **Run in background:**
   ```bash
   docker-compose up -d --build
   ```

3. **View logs:**
   ```bash
   docker-compose logs -f price_poller
   ```

4. **Stop the services:**
   ```bash
   docker-compose down
   ```

### Manual Docker Build

1. **Build the image:**
   ```bash
   docker build -t price-poller .
   ```

2. **Run with Redis:**
   ```bash
   # Start Redis
   docker run -d --name redis -p 6379:6379 redis:7-alpine
   
   # Run the application
   docker run --name price-poller --link redis -e REDIS_URL=redis://redis:6379 price-poller
   ```

## Environment Variables

- `REDIS_URL`: Redis connection URL (default: `redis://localhost:6379`)
- `NODE_ENV`: Node environment (default: `production`)

## Architecture

The application consists of:

1. **WebSocket Client**: Connects to Binance WebSocket API
2. **Redis Client**: Stores trade data and handles pub/sub
3. **Data Processing**: Computes bid/ask prices from trade data
4. **Queue Management**: Uses Redis lists for data persistence

## Redis Data Structure

- **Queue**: `binance:trades` - Raw trade data from Binance
- **Pub/Sub**: `binance:pubsub` - Real-time bid/ask price updates

## Development

### Local Development

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Start Redis:**
   ```bash
   docker run -d --name redis -p 6379:6379 redis:7-alpine
   ```

3. **Run in development mode:**
   ```bash
   npm run dev
   ```

### Building

```bash
npm run build
```

## Monitoring

- **Health Check**: The Docker container includes a health check that runs every 30 seconds
- **Logs**: Application logs are available via `docker-compose logs`
- **Redis Monitoring**: Redis is accessible on port 6379 for monitoring

## Troubleshooting

1. **Redis Connection Issues:**
   - Ensure Redis container is running: `docker-compose ps`
   - Check Redis logs: `docker-compose logs redis`

2. **WebSocket Connection Issues:**
   - Check network connectivity
   - Verify Binance API status

3. **Build Issues:**
   - Clear Docker cache: `docker system prune -a`
   - Rebuild without cache: `docker-compose build --no-cache`
