import { pgTable, uuid, varchar, timestamp, decimal, integer, text, boolean } from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  id: uuid().primaryKey().defaultRandom(),
  firstName: varchar({ length: 255 }).notNull(),
  lastName: varchar({ length: 255 }).notNull(),
  email: varchar({ length: 255 }).notNull().unique(),
  password: varchar({ length: 255 }).notNull(),
  balance: decimal({ precision: 20, scale: 8 }).notNull(),
  createdAt: timestamp().notNull().defaultNow(),
  updatedAt: timestamp().notNull().defaultNow(),
});

export const orders = pgTable('orders', {
  id: uuid().primaryKey().defaultRandom(),
  userId: uuid().notNull().references(() => users.id, { onDelete: 'cascade' }),
  symbol: varchar({ length: 20 }).notNull(), // e.g., 'BTCUSDT', 'ETHUSDT'
  type: varchar({ length: 10 }).notNull(), // 'buy' or 'sell'
  quantity: decimal({ precision: 20, scale: 8 }).notNull(), // Order quantity
  leverage: integer().notNull(), // Leverage used (1-100)
  openPrice: decimal({ precision: 20, scale: 8 }).notNull(), // Price when order was opened
  closePrice: decimal({ precision: 20, scale: 8 }), // Price when order was closed
  margin: decimal({ precision: 20, scale: 8 }).notNull(), // Required margin
  profitLoss: decimal({ precision: 20, scale: 8 }), // Profit/Loss amount
  status: varchar({ length: 20 }).notNull().default('open'), // 'open', 'closed', 'cancelled'
  stopLoss: decimal({ precision: 20, scale: 8 }), // Stop loss price
  openTime: timestamp().notNull().defaultNow(),
  closeTime: timestamp(), // When order was closed
  createdAt: timestamp().notNull().defaultNow(),
  updatedAt: timestamp().notNull().defaultNow(),
});