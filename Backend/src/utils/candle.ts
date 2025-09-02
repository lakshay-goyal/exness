import { client } from "../connect/postgres.js";

export async function RetreiveData(
  symbol: string,
  intervals: string,
  from: string,
  to: string
) {
  try {
    const table = `candles_${intervals}`;

    const query = `
      SELECT bucket AS time,
             open, high, low, close, volume, trade_count
      FROM ${table}
      WHERE symbol = $1
        AND bucket BETWEEN $2 AND $3
      ORDER BY bucket ASC;
    `;

    const values = [symbol, from, to];
    const result = await client.query(query, values);

    return result.rows;
  } catch (err) {
    console.error("Error retrieving data", err);
    return [];
  }
}

export function getTimeRange(interval: string) {
  const to = new Date();
  let from = new Date(to); // copy

  switch (interval) {
    case "1m":
      from.setDate(to.getDate() - 1); // 1 day back
      break;
    case "5m":
      from.setDate(to.getDate() - 7); // 7 days back
      break;
    case "15m":
      from.setDate(to.getDate() - 14); // 14 days back
      break;
    case "30m":
      from.setMonth(to.getMonth() - 1); // 1 month back
      break;
    case "1h":
      from.setMonth(to.getMonth() - 3); // 3 months back
      break;
    case "4h":
      from.setFullYear(to.getFullYear() - 1); // 1 year back
      break;
    case "1d":
      from.setFullYear(to.getFullYear() - 5); // 5 years back
      break;
    default:
      from.setDate(to.getDate() - 1); // fallback 1 day
  }

  return {
    from: from.toISOString(),
    to: to.toISOString(),
  };
}
