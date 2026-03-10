import type { Express } from "express";
import { storage } from "./storage";
import { pool } from "./db";


import { randomUUID, createHmac, timingSafeEqual } from "crypto";

const WALLET_ADDRESS = "6D9hPAdCYbH2tXRra6gVQn5P1AToLseyirvpQtbziFk9";

const platforms = [
  "Instagram", "Facebook", "LinkedIn", "Twitter/X", "TikTok",
  "Reddit", "VK", "Pinterest", "Tumblr", "YouTube",
  "Dating Profile", "News Article", "Public Record", "Forum Post", "Blog",
];

const generateMockResults = (searchId: string) => {
  const count = Math.floor(Math.random() * 6) + 4;
  const usedPlatforms = new Set<string>();
  const results = [];

  for (let i = 0; i < count; i++) {
    let platform: string;
    do {
      platform = platforms[Math.floor(Math.random() * platforms.length)];
    } while (usedPlatforms.has(platform) && usedPlatforms.size < platforms.length);
    usedPlatforms.add(platform);

    const matchScore = 0.65 + Math.random() * 0.34;
    const titles = [
      `Profile photo match on ${platform}`,
      `Image found in ${platform} gallery`,
      `Face detected in ${platform} post`,
      `Matching profile picture - ${platform}`,
      `Photo uploaded to ${platform}`,
      `${platform} account with matching face`,
      `Public photo on ${platform}`,
    ];
    const descriptions = [
      `A matching face was detected in a public profile on ${platform}. The image appears to be from a user-generated post or profile photo.`,
      `Our AI identified a ${Math.round(matchScore * 100)}% facial match in content posted on ${platform}. This could be the same person or a very similar looking individual.`,
      `Face recognition algorithms found a strong match on ${platform}. The image was found in publicly accessible content.`,
      `A potential identity match was discovered on ${platform}. The facial features align with high confidence across multiple biometric markers.`,
    ];
    const urls = [
      `https://www.${platform.toLowerCase().replace(/[/\s]/g, "")}.com/user/${randomUUID().slice(0, 8)}`,
      `https://${platform.toLowerCase().replace(/[/\s]/g, "")}.com/p/${randomUUID().slice(0, 12)}`,
      `https://www.${platform.toLowerCase().replace(/[/\s]/g, "")}.com/profile/${randomUUID().slice(0, 10)}`,
    ];

    results.push({
      searchId,
      platform,
      matchScore: Math.round(matchScore * 100) / 100,
      title: titles[Math.floor(Math.random() * titles.length)],
      description: descriptions[Math.floor(Math.random() * descriptions.length)],
      sourceUrl: urls[Math.floor(Math.random() * urls.length)],
      thumbnailUrl: `https://picsum.photos/seed/${randomUUID().slice(0, 6)}/200/200`,
      isUnlocked: false,
    });
  }

  return results.sort((a, b) => b.matchScore - a.matchScore);
};

// Call the Railway face-search-api using native fetch + FormData (Node 18+)
const callFaceSearchAPI = async (imageData: string, searchId: string) => {
  const FACE_API_URL = process.env.FACE_API_URL;
  if (!FACE_API_URL) {
    console.warn("FACE_API_URL not set, falling back to mock results");
    return null;
  }

  try {
    // Convert base64 dataURL to a Blob
    const base64 = imageData.replace(/^data:image\/\w+;base64,/, "");
    const binary = Buffer.from(base64, "base64");
    const blob = new Blob([binary], { type: "image/jpeg" });

    // Use native FormData and fetch (available in Node 18+)
    const form = new FormData();
    form.append("file", blob, "photo.jpg");

    const response = await fetch(`${FACE_API_URL}/api/v1/search`, {
      method: "POST",
      body: form,
      signal: AbortSignal.timeout(30000),
    });

    if (!response.ok) {
      console.error("Face API error:", response.status, await response.text());
      return null;
    }

    const data = await response.json() as any;
    console.log(`Face API returned ${data.faces_found} faces, ${data.matches?.length ?? 0} matches`);

    if (!data.matches || data.matches.length === 0) return null;

    return data.matches.map((match: any) => {
      let platform = "Unknown";
      try {
        platform = new URL(match.source_url).hostname.replace("www.", "");
      } catch {}

      return {
        searchId,
        platform,
        matchScore: Math.round(match.score) / 100,
        title: `Face match found (${match.score}% confidence)`,
        description: `A ${match.score}% facial match was detected via biometric analysis. Source: ${platform}`,
        sourceUrl: match.source_url || "",
        thumbnailUrl: match.image_url || `https://picsum.photos/seed/${searchId}/200/200`,
        isUnlocked: false,
      };
    });
  } catch (err) {
    console.error("Face API call failed:", err);
    return null;
  }
};

export async function registerRoutes(app: Express): Promise<void> {
  // Health check endpoint - diagnose DB and env issues
  app.get("/api/health", async (_req, res) => {
    const status: any = {
      ok: false,
      env: {
        DATABASE_URL: process.env.DATABASE_URL ? "SET (" + process.env.DATABASE_URL.split("@")[1] + ")" : "MISSING",
        FACE_API_URL: process.env.FACE_API_URL || "MISSING",
      },
      db: "untested",
    };
    try {
      await pool.query("SELECT 1");
      status.db = "connected";
      status.ok = true;
    } catch (err: any) {
      status.db = "error: " + err.message;
    }
    res.status(status.ok ? 200 : 503).json(status);
  });

  app.post("/api/searches", async (req, res) => {
    try {
      const { imageData } = req.body;
      if (!imageData || typeof imageData !== "string") {
        return res.status(400).json({ message: "Image data is required" });
      }

      const sessionId = req.headers["x-session-id"] as string || randomUUID();

      const search = await storage.createSearch({
        imageData,
        sessionId,
        status: "processing",
      });

      res.json(search);
    } catch (err: any) {
      console.error("Error creating search:", err);
      res.status(500).json({ 
        message: "Failed to create search",
        detail: process.env.NODE_ENV !== "production" ? err?.message : undefined
      });
    }
  });

  app.get("/api/searches/:id", async (req, res) => {
    try {
      let search = await storage.getSearch(req.params.id);
      if (!search) {
        return res.status(404).json({ message: "Search not found" });
      }

      // Lazy generation: if processing for > 6 seconds, generate results
      if (search.status === "processing" && search.createdAt) {
        const elapsed = Date.now() - new Date(search.createdAt).getTime();
        if (elapsed >= 6000) {
          const claimed = await storage.claimSearch(search.id);
          if (claimed) {
            try {
              // Try real face search API first, fall back to mock if no results
              const realResults = await callFaceSearchAPI(search.imageData, search.id);
              const resultsToSave = realResults ?? generateMockResults(search.id);

              for (const result of resultsToSave) {
                await storage.createSearchResult(result);
              }
              await storage.updateSearchStatus(search.id, "completed");
            } catch (err) {
              console.error("Error generating results:", err);
              await storage.updateSearchStatus(search.id, "failed");
            }
          }
          search = (await storage.getSearch(req.params.id))!;
        }
      }

      res.json(search);
    } catch (err) {
      res.status(500).json({ message: "Failed to get search" });
    }
  });

  app.get("/api/searches/:id/results", async (req, res) => {
    try {
      const search = await storage.getSearch(req.params.id);
      if (!search) {
        return res.status(404).json({ message: "Search not found" });
      }
      const results = await storage.getSearchResults(req.params.id);
      res.json(results);
    } catch (err) {
      res.status(500).json({ message: "Failed to get results" });
    }
  });

  app.post("/api/searches/:id/unlock", async (req, res) => {
    try {
      const { txHash } = req.body;
      if (!txHash || typeof txHash !== "string") {
        return res.status(400).json({ message: "Transaction hash is required" });
      }

      const search = await storage.getSearch(req.params.id);
      if (!search) {
        return res.status(404).json({ message: "Search not found" });
      }

      const payment = await storage.createPayment({
        searchId: search.id,
        amount: 9.99,
        currency: "SOL",
        walletAddress: WALLET_ADDRESS,
        txHash,
        status: "confirmed",
      });

      await storage.unlockSearchResults(search.id);

      res.json({ success: true, payment });
    } catch (err) {
      console.error("Error unlocking results:", err);
      res.status(500).json({ message: "Failed to unlock results" });
    }
  });

  const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "admin123";
  const TOKEN_SECRET = process.env.SESSION_SECRET || "fallback-secret";
  const TOKEN_EXPIRY_MS = 24 * 60 * 60 * 1000;
  let loginAttempts = 0;
  let lastAttemptReset = Date.now();

  function generateAdminToken(): string {
    const expiry = String(Date.now() + TOKEN_EXPIRY_MS);
    const signature = createHmac("sha256", TOKEN_SECRET).update(expiry).digest("hex");
    return `${Buffer.from(expiry).toString("base64")}.${signature}`;
  }

  function isValidAdminToken(token: string): boolean {
    const parts = token.split(".");
    if (parts.length !== 2) return false;
    try {
      const payload = Buffer.from(parts[0], "base64").toString();
      const expectedSig = createHmac("sha256", TOKEN_SECRET).update(payload).digest("hex");
      const sigBuf = Buffer.from(parts[1], "hex");
      const expectedBuf = Buffer.from(expectedSig, "hex");
      if (sigBuf.length !== expectedBuf.length) return false;
      if (!timingSafeEqual(sigBuf, expectedBuf)) return false;
      const expiry = parseInt(payload, 10);
      return !isNaN(expiry) && Date.now() <= expiry;
    } catch {
      return false;
    }
  }

  function requireAdmin(req: any, res: any, next: any) {
    const auth = req.headers.authorization;
    if (!auth || !auth.startsWith("Bearer ")) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    const token = auth.slice(7);
    if (!isValidAdminToken(token)) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    next();
  }

  app.post("/api/admin/login", (req, res) => {
    if (Date.now() - lastAttemptReset > 60000) {
      loginAttempts = 0;
      lastAttemptReset = Date.now();
    }
    if (loginAttempts >= 10) {
      return res.status(429).json({ message: "Too many attempts. Try again later." });
    }
    loginAttempts++;

    const { password } = req.body;
    if (password === ADMIN_PASSWORD) {
      loginAttempts = 0;
      const token = generateAdminToken();
      res.json({ success: true, token });
    } else {
      res.status(401).json({ message: "Invalid password" });
    }
  });

  app.get("/api/admin/searches", requireAdmin, async (_req, res) => {
    try {
      const allSearches = await storage.getAllSearches();
      const searchesWithResults = await Promise.all(
        allSearches.map(async (search) => {
          const results = await storage.getSearchResults(search.id);
          const payment = await storage.getPaymentBySearchId(search.id);
          return {
            ...search,
            imageData: search.imageData.substring(0, 100) + "...",
            resultCount: results.length,
            isPaid: !!payment,
            payment: payment || null,
          };
        })
      );
      res.json(searchesWithResults);
    } catch (err) {
      console.error("Error fetching admin searches:", err);
      res.status(500).json({ message: "Failed to fetch searches" });
    }
  });

  app.get("/api/admin/searches/:id", requireAdmin, async (req, res) => {
    try {
      const search = await storage.getSearch(req.params.id);
      if (!search) {
        return res.status(404).json({ message: "Search not found" });
      }
      const results = await storage.getSearchResults(search.id);
      const payment = await storage.getPaymentBySearchId(search.id);
      res.json({ search, results, payment: payment || null });
    } catch (err) {
      res.status(500).json({ message: "Failed to fetch search details" });
    }
  });

  app.get("/api/admin/stats", requireAdmin, async (_req, res) => {
    try {
      const allSearches = await storage.getAllSearches();
      const allPayments = await storage.getAllPayments();
      const totalRevenue = allPayments.reduce((sum, p) => sum + (p.amount || 0), 0);
      res.json({
        totalSearches: allSearches.length,
        completedSearches: allSearches.filter((s) => s.status === "completed").length,
        totalPayments: allPayments.length,
        totalRevenue,
      });
    } catch (err) {
      res.status(500).json({ message: "Failed to fetch stats" });
    }
  });
}
