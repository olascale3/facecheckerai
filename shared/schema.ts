import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, boolean, timestamp, real } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const searches = pgTable("searches", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  sessionId: text("session_id").notNull(),
  imageData: text("image_data").notNull(),
  status: text("status").notNull().default("processing"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const searchResults = pgTable("search_results", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  searchId: varchar("search_id").notNull().references(() => searches.id),
  platform: text("platform").notNull(),
  matchScore: real("match_score").notNull(),
  title: text("title").notNull(),
  sourceUrl: text("source_url").notNull(),
  description: text("description").notNull(),
  thumbnailUrl: text("thumbnail_url").notNull(),
  isUnlocked: boolean("is_unlocked").notNull().default(false),
});

export const payments = pgTable("payments", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  searchId: varchar("search_id").notNull().references(() => searches.id),
  amount: real("amount").notNull(),
  currency: text("currency").notNull().default("USDT"),
  walletAddress: text("wallet_address").notNull(),
  txHash: text("tx_hash"),
  status: text("status").notNull().default("pending"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertSearchSchema = createInsertSchema(searches).omit({ id: true, createdAt: true });
export const insertSearchResultSchema = createInsertSchema(searchResults).omit({ id: true });
export const insertPaymentSchema = createInsertSchema(payments).omit({ id: true, createdAt: true });

export type InsertSearch = z.infer<typeof insertSearchSchema>;
export type Search = typeof searches.$inferSelect;
export type InsertSearchResult = z.infer<typeof insertSearchResultSchema>;
export type SearchResult = typeof searchResults.$inferSelect;
export type InsertPayment = z.infer<typeof insertPaymentSchema>;
export type Payment = typeof payments.$inferSelect;

export type InsertUser = { username: string; password: string };
export type User = { id: string; username: string; password: string };
