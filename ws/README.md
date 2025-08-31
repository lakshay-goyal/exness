# WebSocket Server

A Node.js TypeScript WebSocket server that acts as a bridge between Redis pub/sub and WebSocket clients, forwarding real-time cryptocurrency price data.

## Features

- WebSocket server on port 7070
- Redis pub/sub subscriber for real-time data
- Forwards messages from Redis to connected WebSocket clients
- Handles client connections and disconnections
- Real-time cryptocurrency price streaming

## Architecture

The application consists of:

1. **WebSocket Server**: Listens on port 7070 for client connections
2. **Redis Subscriber**: Subscribes to "binance:pubsub" channel
3. **Message Bridge**: Forwards Redis pub/sub messages to WebSocket clients
4. **Connection Management**: Handles client connections and disconnections

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
   docker-compose logs -f ws_server
   ```

4. **Stop the services:**
   ```bash
   docker-compose down
   ```

### Manual Docker Build

1. **Build the image:**
   ```bash
   docker build -t ws-server .
   ```

2. **Run with Redis:**
   ```bash
   # Start Redis
   docker run -d --name redis -p 6379:6379 redis:7-alpine
   
   # Run the WebSocket server
   docker run --name ws-server -p 7070:7070 --link redis -e REDIS_URL=redis://redis:6379 ws-server
   ```

## Environment Variables

- `REDIS_URL`: Redis connection URL (default: `redis://localhost:6379`)
- `NODE_ENV`: Node environment (default: `production`)

## WebSocket API

### Connection
- **URL**: `ws://localhost:7070`
- **Protocol**: WebSocket

### Message Format
The server forwards JSON messages from Redis pub/sub channel "binance:pubsub":

```json
{
  "symbol": "BTCUSDT",
  "bid": 45000.0,
  "ask": 45002.0
}
```

### Usage Example

```javascript
// Connect to WebSocket server
const ws = new WebSocket('ws://localhost:7070');

ws.onopen = () => {
  console.log('Connected to WebSocket server');
};

ws.onmessage = (event) => {
  const data = JSON.parse(event.data);
  console.log('Received price data:', data);
};

ws.onclose = () => {
  console.log('Disconnected from WebSocket server');
};
```

## Redis Integration

The server subscribes to the Redis pub/sub channel:
- **Channel**: `binance:pubsub`
- **Message Format**: JSON string containing cryptocurrency price data

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

- **WebSocket Server**: Accessible on port 7070
- **Redis**: Accessible on port 6379
- **Logs**: Application logs show client connections and message forwarding

## Troubleshooting

1. **Redis Connection Issues:**
   - Ensure Redis container is running: `docker-compose ps`
   - Check Redis logs: `docker-compose logs redis`

2. **WebSocket Connection Issues:**
   - Verify server is running on port 7070
   - Check firewall settings
   - Ensure Redis pub/sub channel has data

3. **Build Issues:**
   - Clear Docker cache: `docker system prune -a`
   - Rebuild without cache: `docker-compose build --no-cache`

## Dependencies

- **ws**: WebSocket server implementation
- **redis**: Redis client for pub/sub
- **ioredis**: Alternative Redis client
- **pg**: PostgreSQL client (for potential database integration)
- **node-fetch**: HTTP client for API calls
