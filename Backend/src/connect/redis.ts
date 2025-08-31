import pkg from "pg";
const { Client } = pkg;

const client = new Client({
  user: "timescaledb",
  password: "password",
  host: "localhost",
  port: 5432,
  database: "exness",
});
await client.connect();
console.log("Connected to database");

export {client}