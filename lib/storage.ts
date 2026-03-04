import { sql } from "./db";

export type Search = {
  id: string;
  session_id: string;
  image_data: string;
  status: string;
  created_at: string;
};

export type SearchResult = {
  id: string;
  search_id: string;
  platform: string;
  match_score: number;
  title: string;
  source_url: string;
  description: string;
  thumbnail_url: string;
  is_unlocked: boolean;
};

export type Payment = {
  id: string;
  search_id: string;
  amount: number;
  currency: string;
  wallet_address: string;
  tx_hash: string | null;
  status: string;
  created_at: string;
};

export async function createSearch(data: {
  imageData: string;
  sessionId: string;
  status: string;
}): Promise<Search> {
  const rows = await sql`
    INSERT INTO searches (session_id, image_data, status)
    VALUES (${data.sessionId}, ${data.imageData}, ${data.status})
    RETURNING *
  `;
  return rows[0] as Search;
}

export async function getSearch(id: string): Promise<Search | null> {
  const rows = await sql`SELECT * FROM searches WHERE id = ${id}`;
  return (rows[0] as Search) || null;
}

export async function updateSearchStatus(
  id: string,
  status: string
): Promise<void> {
  await sql`UPDATE searches SET status = ${status} WHERE id = ${id}`;
}

export async function claimSearch(id: string): Promise<boolean> {
  const rows = await sql`
    UPDATE searches SET status = 'generating'
    WHERE id = ${id} AND status = 'processing'
    RETURNING id
  `;
  return rows.length > 0;
}

export async function createSearchResult(data: {
  searchId: string;
  platform: string;
  matchScore: number;
  title: string;
  description: string;
  sourceUrl: string;
  thumbnailUrl: string;
  isUnlocked: boolean;
}): Promise<SearchResult> {
  const rows = await sql`
    INSERT INTO search_results (search_id, platform, match_score, title, description, source_url, thumbnail_url, is_unlocked)
    VALUES (${data.searchId}, ${data.platform}, ${data.matchScore}, ${data.title}, ${data.description}, ${data.sourceUrl}, ${data.thumbnailUrl}, ${data.isUnlocked})
    RETURNING *
  `;
  return rows[0] as SearchResult;
}

export async function getSearchResults(
  searchId: string
): Promise<SearchResult[]> {
  const rows = await sql`
    SELECT * FROM search_results WHERE search_id = ${searchId}
  `;
  return rows as SearchResult[];
}

export async function unlockSearchResults(searchId: string): Promise<void> {
  await sql`
    UPDATE search_results SET is_unlocked = true WHERE search_id = ${searchId}
  `;
}

export async function createPayment(data: {
  searchId: string;
  amount: number;
  currency: string;
  walletAddress: string;
  txHash: string;
  status: string;
}): Promise<Payment> {
  const rows = await sql`
    INSERT INTO payments (search_id, amount, currency, wallet_address, tx_hash, status)
    VALUES (${data.searchId}, ${data.amount}, ${data.currency}, ${data.walletAddress}, ${data.txHash}, ${data.status})
    RETURNING *
  `;
  return rows[0] as Payment;
}

export async function getPaymentBySearchId(
  searchId: string
): Promise<Payment | null> {
  const rows = await sql`
    SELECT * FROM payments WHERE search_id = ${searchId}
  `;
  return (rows[0] as Payment) || null;
}

export async function getAllSearches(): Promise<Search[]> {
  const rows = await sql`
    SELECT * FROM searches ORDER BY created_at DESC
  `;
  return rows as Search[];
}

export async function getAllPayments(): Promise<Payment[]> {
  const rows = await sql`
    SELECT * FROM payments ORDER BY created_at DESC
  `;
  return rows as Payment[];
}
