import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { randomUUID } from "crypto";

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

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
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

      setTimeout(async () => {
        try {
          const mockResults = generateMockResults(search.id);
          for (const result of mockResults) {
            await storage.createSearchResult(result);
          }
          await storage.updateSearchStatus(search.id, "completed");
        } catch (err) {
          console.error("Error generating results:", err);
          await storage.updateSearchStatus(search.id, "failed");
        }
      }, 6000);

      res.json(search);
    } catch (err) {
      console.error("Error creating search:", err);
      res.status(500).json({ message: "Failed to create search" });
    }
  });

  app.get("/api/searches/:id", async (req, res) => {
    try {
      const search = await storage.getSearch(req.params.id);
      if (!search) {
        return res.status(404).json({ message: "Search not found" });
      }
      res.json(search);
    } catch (err) {
      res.status(500).json({ message: "Failed to get search" });
    }
  });

  app.get("/api/searches/:id/results", async (req, res) => {
    try {
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

  return httpServer;
}
