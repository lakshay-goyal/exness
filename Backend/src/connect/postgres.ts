import pkg from "pg";
const { Client } = pkg;

const client = new Client({
  user: process.env.DB_USER || "timescaledb",
  password: process.env.DB_PASSWORD || "password",
  host: process.env.DB_HOST || "localhost",
  port: parseInt(process.env.DB_PORT || "5432"),
  database: process.env.DB_NAME || "exness",
});

await client.connect();
console.log("Connected to TimescaleDB database");

export { client };
