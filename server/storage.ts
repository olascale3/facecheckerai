import { db } from "./db";
import { eq, desc } from "drizzle-orm";
import {
  searches,
  searchResults,
  payments,
  type Search,
  type InsertSearch,
  type SearchResult,
  type InsertSearchResult,
  type Payment,
  type InsertPayment,
} from "@shared/schema";

export interface IStorage {
  createSearch(data: InsertSearch): Promise<Search>;
  getSearch(id: string): Promise<Search | undefined>;
  updateSearchStatus(id: string, status: string): Promise<void>;
  createSearchResult(data: InsertSearchResult): Promise<SearchResult>;
  getSearchResults(searchId: string): Promise<SearchResult[]>;
  unlockSearchResults(searchId: string): Promise<void>;
  createPayment(data: InsertPayment): Promise<Payment>;
  getPaymentBySearchId(searchId: string): Promise<Payment | undefined>;
  getAllSearches(): Promise<Search[]>;
  getAllPayments(): Promise<Payment[]>;
}

export class DatabaseStorage implements IStorage {
  async createSearch(data: InsertSearch): Promise<Search> {
    const [search] = await db.insert(searches).values(data).returning();
    return search;
  }

  async getSearch(id: string): Promise<Search | undefined> {
    const [search] = await db.select().from(searches).where(eq(searches.id, id));
    return search;
  }

  async updateSearchStatus(id: string, status: string): Promise<void> {
    await db.update(searches).set({ status }).where(eq(searches.id, id));
  }

  async createSearchResult(data: InsertSearchResult): Promise<SearchResult> {
    const [result] = await db.insert(searchResults).values(data).returning();
    return result;
  }

  async getSearchResults(searchId: string): Promise<SearchResult[]> {
    return db.select().from(searchResults).where(eq(searchResults.searchId, searchId));
  }

  async unlockSearchResults(searchId: string): Promise<void> {
    await db.update(searchResults).set({ isUnlocked: true }).where(eq(searchResults.searchId, searchId));
  }

  async createPayment(data: InsertPayment): Promise<Payment> {
    const [payment] = await db.insert(payments).values(data).returning();
    return payment;
  }

  async getPaymentBySearchId(searchId: string): Promise<Payment | undefined> {
    const [payment] = await db.select().from(payments).where(eq(payments.searchId, searchId));
    return payment;
  }

  async getAllSearches(): Promise<Search[]> {
    return db.select().from(searches).orderBy(desc(searches.createdAt));
  }

  async getAllPayments(): Promise<Payment[]> {
    return db.select().from(payments).orderBy(desc(payments.createdAt));
  }
}

export const storage = new DatabaseStorage();
