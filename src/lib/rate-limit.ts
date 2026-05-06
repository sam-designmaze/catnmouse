import { LRUCache } from "lru-cache";

type Options = {
  interval: number; // ms
  uniqueTokenPerInterval: number; // max requests per interval
};

export function Ratelimit(options: Options) {
  const { interval, uniqueTokenPerInterval: limit } = options;

  const tokenCache = new LRUCache<string, number[]>({
    max: 500, // Store at most 500 unique tokens
    ttl: interval,
  });

  return {
    check: async (token: string, rate: number = limit): Promise<{ success: boolean; remaining?: number }> => {
      const tokenCount = tokenCache.get(token) || [];
      const now = Date.now();

      // Remove timestamps older than the interval
      const recentCount = tokenCount.filter((timestamp) => now - timestamp < interval);

      if (recentCount.length >= rate) {
        return { success: false };
      }

      const ageOfOldestRequest = recentCount.length > 0 ? now - Math.min(...recentCount) : 0;
      const differenceFromInterval = interval - ageOfOldestRequest;

      const resetAfter = differenceFromInterval / 1000; // Convert to seconds
      recentCount.push(now);
      tokenCache.set(token, recentCount);

      return { success: true, remaining: rate - recentCount.length };
    },
  };
}

// Auth endpoints: max 5 attempts per 15 minutes
export const authRateLimit = Ratelimit({
  interval: 15 * 60 * 1000, // 15 minutes
  uniqueTokenPerInterval: 5, // max 5 attempts
});

// Register endpoint: max 3 new registrations per hour per IP
export const registerRateLimit = Ratelimit({
  interval: 60 * 60 * 1000, // 1 hour
  uniqueTokenPerInterval: 3,
});

// Generic API rate limit: max 100 requests per minute
export const apiRateLimit = Ratelimit({
  interval: 60 * 1000, // 1 minute
  uniqueTokenPerInterval: 100,
});
