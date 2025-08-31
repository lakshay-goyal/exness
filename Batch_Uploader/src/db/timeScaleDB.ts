import pkg from "pg";
const { Client } = pkg;
import dotenv from "dotenv";
dotenv.config();

const client = new Client({
  user: process.env.DB_USER!,
  password: process.env.DB_PASSWORD || 'password',
  host: process.env.DB_HOST!,
  port: parseInt(process.env.DB_PORT!),
  database: process.env.DB_NAME!,
});

export async function setupTimescale() {
  try {
    await client.connect();
    console.log("Connected to database");

    // Enable TimescaleDB extension
    await client.query("CREATE EXTENSION IF NOT EXISTS timescaledb;");

    // Create trades table if not exists
    await client.query(`
      CREATE TABLE IF NOT EXISTS trades (
        time        TIMESTAMPTZ       NOT NULL,
        symbol      VARCHAR(20)       NOT NULL,
        price       NUMERIC(20,8)     NOT NULL,
        volume      NUMERIC(20,8)     NOT NULL,
        trade_id    BIGINT            NOT NULL,
        side        VARCHAR(4)        NOT NULL CHECK (side IN ('buy', 'sell')),
        PRIMARY KEY (time, symbol, trade_id)
      );
    `);
    console.log("Ensured trades table exists");

    // Convert to hypertable
    await client.query("SELECT create_hypertable('trades', 'time', if_not_exists => TRUE);");
    console.log("Created hypertable (or already exists)");

    // Index for symbol
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_trades_symbol ON trades (symbol);
    `);

    // Interval configs with custom start offsets
    const intervals = [
      { interval: "1 minute", name: "1m", start: "7 days" },
      { interval: "5 minutes", name: "5m", start: "14 days" },
      { interval: "15 minutes", name: "15m", start: "1 month" },
      { interval: "30 minutes", name: "30m", start: "2 months" },
      { interval: "1 hour", name: "1h", start: "6 months" },
      { interval: "4 hours", name: "4h", start: "1 year" },
      { interval: "1 day", name: "1d", start: "2 years" },
      { interval: "1 week", name: "1w", start: "5 years" },
      { interval: "1 month", name: "1mo", start: "10 years" },
      { interval: "1 year", name: "1y", start: "50 years" },
    ];

    for (const { interval, name, start } of intervals) {
      // Create continuous aggregate
      await client.query(`
        CREATE MATERIALIZED VIEW IF NOT EXISTS candles_${name}
        WITH (timescaledb.continuous) AS
        SELECT
          symbol,
          time_bucket('${interval}', time) AS bucket,
          FIRST(price, time) AS open,
          MAX(price) AS high,
          MIN(price) AS low,
          LAST(price, time) AS close,
          SUM(volume) AS volume,
          COUNT(*) AS trade_count
        FROM trades
        GROUP BY symbol, bucket
        WITH NO DATA;
      `);

      // Index
      await client.query(`
        CREATE INDEX IF NOT EXISTS idx_candles_${name}_symbol_time
        ON candles_${name} (symbol, bucket DESC);
      `);

      // Refresh policy with dynamic start_offset
      await client.query(`
        SELECT add_continuous_aggregate_policy('candles_${name}',
          start_offset => INTERVAL '${start}',
          end_offset   => INTERVAL '${interval}',
          schedule_interval => INTERVAL '${interval}'
        );
      `);
    }

    console.log("TimescaleDB setup completed with multiple intervals!");
  } catch (error) {
    console.error("Error setting up TimescaleDB:", error);
  }
}

export { client };