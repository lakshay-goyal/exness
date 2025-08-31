# Batch Uploader

A Node.js TypeScript application that processes cryptocurrency trade data from Redis queues and stores it in TimescaleDB with automatic candlestick aggregation.

## Features

- **Redis Queue Consumer**: Processes trade data from `binance:trades` Redis queue
- **TimescaleDB Integration**: Stores trade data in time-series database
- **Automatic Candlestick Generation**: Creates multiple timeframe candlesticks (1m, 5m, 15m, 30m, 1h, 4h, 1d, 1w, 1mo, 1y)
- **Batch Processing**: Processes trades in batches of 100 for optimal performance
- **Continuous Aggregation**: Uses TimescaleDB continuous aggregates for real-time candlestick updates
- **Conflict Resolution**: Handles duplicate trades with ON CONFLICT DO NOTHING

## Architecture

The application consists of:

1. **Redis Consumer**: Continuously polls the `binance:trades` queue
2. **Data Processor**: Parses Binance trade data and formats it for storage
3. **TimescaleDB Client**: Connects to TimescaleDB and manages database operations
4. **Batch Manager**: Processes trades in configurable batches
5. **Continuous Aggregates**: Automatically generates candlestick data across multiple timeframes

## Data Flow

1. **Trade Data Source**: Binance WebSocket → Redis Queue (`binance:trades`)
2. **Batch Processing**: Batch Uploader consumes from Redis queue
3. **Data Storage**: Trades stored in TimescaleDB hypertable
4. **Candlestick Generation**: Continuous aggregates create OHLCV data
5. **Real-time Updates**: Candlesticks updated automatically as new trades arrive

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
   docker-compose logs -f batch_uploader
   ```

4. **Stop the services:**
   ```bash
   docker-compose down
   ```

### Manual Docker Build

1. **Build the image:**
   ```bash
   docker build -t batch-uploader .
   ```

2. **Run with dependencies:**
   ```bash
   # Start Redis
   docker run -d --name redis -p 6379:6379 redis:7-alpine
   
   # Start TimescaleDB
   docker run -d --name timescaledb -p 5432:5432 \
     -e POSTGRES_USER=timescaledb \
     -e POSTGRES_PASSWORD=password \
     -e POSTGRES_DB=exness \
     timescale/timescaledb:latest-pg14
   
   # Run the batch uploader
   docker run --name batch-uploader \
     --link redis \
     --link timescaledb \
     -e REDIS_URL=redis://redis:6379 \
     -e DB_HOST=timescaledb \
     batch-uploader
   ```

## Environment Variables

- `REDIS_URL`: Redis connection URL (default: `redis://localhost:6379`)
- `DB_USER`: TimescaleDB username (default: `timescaledb`)
- `DB_PASSWORD`: TimescaleDB password (default: `password`)
- `DB_HOST`: TimescaleDB host (default: `localhost`)
- `DB_PORT`: TimescaleDB port (default: `5432`)
- `DB_NAME`: TimescaleDB database name (default: `exness`)
- `NODE_ENV`: Node environment (default: `production`)

## Database Schema

### Trades Table
```sql
CREATE TABLE trades (
  time        TIMESTAMPTZ       NOT NULL,
  symbol      VARCHAR(20)       NOT NULL,
  price       NUMERIC(20,8)     NOT NULL,
  volume      NUMERIC(20,8)     NOT NULL,
  trade_id    BIGINT            NOT NULL,
  side        VARCHAR(4)        NOT NULL CHECK (side IN ('buy', 'sell')),
  PRIMARY KEY (time, symbol, trade_id)
);
```

### Candlestick Views
The application creates continuous aggregate views for multiple timeframes:
- `candles_1m` - 1 minute candlesticks
- `candles_5m` - 5 minute candlesticks
- `candles_15m` - 15 minute candlesticks
- `candles_30m` - 30 minute candlesticks
- `candles_1h` - 1 hour candlesticks
- `candles_4h` - 4 hour candlesticks
- `candles_1d` - 1 day candlesticks
- `candles_1w` - 1 week candlesticks
- `candles_1mo` - 1 month candlesticks
- `candles_1y` - 1 year candlesticks

## Redis Integration

- **Queue**: `binance:trades` - Raw trade data from Binance WebSocket
- **Processing**: Uses `LPOP` to consume messages one by one
- **Batch Size**: Processes 100 trades before resetting batch counter

## Development

### Local Development

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Create environment file:**
   ```bash
   # Create .env file with the following content:
   REDIS_URL=redis://localhost:6379
   DB_USER=timescaledb
   DB_PASSWORD=password
   DB_HOST=localhost
   DB_PORT=5432
   DB_NAME=exness
   NODE_ENV=development
   ```

3. **Start Redis:**
   ```bash
   docker run -d --name redis -p 6379:6379 redis:7-alpine
   ```

4. **Start TimescaleDB:**
   ```bash
   docker run -d --name timescaledb -p 5432:5432 \
     -e POSTGRES_USER=timescaledb \
     -e POSTGRES_PASSWORD=password \
     -e POSTGRES_DB=exness \
     timescale/timescaledb:latest-pg14
   ```

5. **Wait for TimescaleDB to be ready:**
   ```bash
   # Check if TimescaleDB is ready
   docker logs timescaledb | grep "database system is ready"
   ```

6. **Run in development mode:**
   ```bash
   npm run dev
   ```

### Building

```bash
npm run build
```

## Monitoring

- **Redis**: Accessible on port 6379
- **TimescaleDB**: Accessible on port 5432
- **Logs**: Application logs show trade processing and database operations
- **Batch Processing**: Logs show batch completion every 100 trades

## Performance

- **Batch Processing**: Processes trades in batches of 100 for optimal performance
- **Continuous Aggregates**: Real-time candlestick generation without manual intervention
- **Indexing**: Optimized indexes on symbol and time for fast queries
- **Conflict Handling**: Efficient duplicate trade handling

## Troubleshooting

1. **Redis Connection Issues:**
   - Ensure Redis container is running: `docker-compose ps`
   - Check Redis logs: `docker-compose logs redis`

2. **TimescaleDB Connection Issues:**
   - Ensure TimescaleDB container is running: `docker-compose ps`
   - Check TimescaleDB logs: `docker-compose logs timescaledb`
   - Verify database credentials in environment variables
   - **Authentication Error**: If you see "password authentication failed for user", ensure:
     - TimescaleDB container is fully started before batch_uploader
     - Environment variables are correctly set in docker-compose.yml
     - Database user "timescaledb" exists with correct password

3. **No Trade Data:**
   - Ensure Price_Poller is running and feeding data to Redis
   - Check Redis queue: `redis-cli LLEN binance:trades`

4. **Local Development Issues:**
   - Create a `.env` file with proper database credentials
   - Ensure TimescaleDB is running locally: `docker run -d --name timescaledb -p 5432:5432 -e POSTGRES_USER=timescaledb -e POSTGRES_PASSWORD=password -e POSTGRES_DB=exness timescale/timescaledb:latest-pg14`

5. **Build Issues:**
   - Clear Docker cache: `docker system prune -a`
   - Rebuild without cache: `docker-compose build --no-cache`

## Dependencies

- **redis**: Redis client for queue consumption
- **pg**: PostgreSQL client for TimescaleDB operations
- **typescript**: TypeScript compiler
- **tsc-watch**: TypeScript file watcher for development
