import { randomUUID } from "crypto";

const platforms = [
  "Instagram", "Facebook", "LinkedIn", "Twitter/X", "TikTok",
  "Reddit", "VK", "Pinterest", "Tumblr", "YouTube",
  "Dating Profile", "News Article", "Public Record", "Forum Post", "Blog",
];

export function generateMockResults(searchId: string) {
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
}
