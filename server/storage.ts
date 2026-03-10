import { pool } from "./db";
import { randomUUID } from "crypto";

export interface Search {
  id: string;
  sessionId: string;
  imageData: string;
  status: string;
  createdAt: Date;
}

export interface SearchResult {
  id: string;
  searchId: string;
  platform: string;
  matchScore: number;
  title: string;
  sourceUrl: string;
  description: string;
  thumbnailUrl: string;
  isUnlocked: boolean;
}

export interface Payment {
  id: string;
  searchId: string;
  amount: number;
  currency: string;
  walletAddress: string;
  txHash: string | null;
  status: string;
  createdAt: Date;
}

export interface IStorage {
  createSearch(data: { imageData: string; sessionId: string; status: string }): Promise<Search>;
  getSearch(id: string): Promise<Search | undefined>;
  updateSearchStatus(id: string, status: string): Promise<void>;
  claimSearch(id: string): Promise<boolean>;
  createSearchResult(data: Omit<SearchResult, "id">): Promise<SearchResult>;
  getSearchResults(searchId: string): Promise<SearchResult[]>;
  unlockSearchResults(searchId: string): Promise<void>;
  createPayment(data: Omit<Payment, "id" | "createdAt">): Promise<Payment>;
  getPaymentBySearchId(searchId: string): Promise<Payment | undefined>;
  getAllSearches(): Promise<Search[]>;
  getAllPayments(): Promise<Payment[]>;
}

export class DatabaseStorage implements IStorage {
  async createSearch(data: { imageData: string; sessionId: string; status: string }): Promise<Search> {
    const id = randomUUID();
    const result = await pool.query(
      `INSERT INTO searches (id, session_id, image_data, status) VALUES ($1, $2, $3, $4) RETURNING *`,
      [id, data.sessionId, data.imageData, data.status]
    );
    return this.mapSearch(result.rows[0]);
  }

  async getSearch(id: string): Promise<Search | undefined> {
    const result = await pool.query(`SELECT * FROM searches WHERE id = $1`, [id]);
    return result.rows[0] ? this.mapSearch(result.rows[0]) : undefined;
  }

  async updateSearchStatus(id: string, status: string): Promise<void> {
    await pool.query(`UPDATE searches SET status = $1 WHERE id = $2`, [status, id]);
  }

  async claimSearch(id: string): Promise<boolean> {
    const result = await pool.query(
      `UPDATE searches SET status = 'generating' WHERE id = $1 AND status = 'processing' RETURNING id`,
      [id]
    );
    return result.rowCount! > 0;
  }

  async createSearchResult(data: Omit<SearchResult, "id">): Promise<SearchResult> {
    const id = randomUUID();
    const result = await pool.query(
      `INSERT INTO search_results (id, search_id, platform, match_score, title, source_url, description, thumbnail_url, is_unlocked)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *`,
      [id, data.searchId, data.platform, data.matchScore, data.title, data.sourceUrl, data.description, data.thumbnailUrl, data.isUnlocked]
    );
    return this.mapResult(result.rows[0]);
  }

  async getSearchResults(searchId: string): Promise<SearchResult[]> {
    const result = await pool.query(`SELECT * FROM search_results WHERE search_id = $1`, [searchId]);
    return result.rows.map(this.mapResult);
  }

  async unlockSearchResults(searchId: string): Promise<void> {
    await pool.query(`UPDATE search_results SET is_unlocked = true WHERE search_id = $1`, [searchId]);
  }

  async createPayment(data: Omit<Payment, "id" | "createdAt">): Promise<Payment> {
    const id = randomUUID();
    const result = await pool.query(
      `INSERT INTO payments (id, search_id, amount, currency, wallet_address, tx_hash, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
      [id, data.searchId, data.amount, data.currency, data.walletAddress, data.txHash, data.status]
    );
    return this.mapPayment(result.rows[0]);
  }

  async getPaymentBySearchId(searchId: string): Promise<Payment | undefined> {
    const result = await pool.query(`SELECT * FROM payments WHERE search_id = $1`, [searchId]);
    return result.rows[0] ? this.mapPayment(result.rows[0]) : undefined;
  }

  async getAllSearches(): Promise<Search[]> {
    const result = await pool.query(`SELECT * FROM searches ORDER BY created_at DESC`);
    return result.rows.map(this.mapSearch);
  }

  async getAllPayments(): Promise<Payment[]> {
    const result = await pool.query(`SELECT * FROM payments ORDER BY created_at DESC`);
    return result.rows.map(this.mapPayment);
  }

  private mapSearch(row: any): Search {
    return {
      id: row.id,
      sessionId: row.session_id,
      imageData: row.image_data,
      status: row.status,
      createdAt: row.created_at,
    };
  }

  private mapResult(row: any): SearchResult {
    return {
      id: row.id,
      searchId: row.search_id,
      platform: row.platform,
      matchScore: row.match_score,
      title: row.title,
      sourceUrl: row.source_url,
      description: row.description,
      thumbnailUrl: row.thumbnail_url,
      isUnlocked: row.is_unlocked,
    };
  }

  private mapPayment(row: any): Payment {
    return {
      id: row.id,
      searchId: row.search_id,
      amount: row.amount,
      currency: row.currency,
      walletAddress: row.wallet_address,
      txHash: row.tx_hash,
      status: row.status,
      createdAt: row.created_at,
    };
  }
}

export const storage = new DatabaseStorage();
