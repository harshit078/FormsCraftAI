import { LRUCache } from 'lru-cache';

export function rateLimit(options: {
  interval: number;
  uniqueTokenPerInterval: number;
}) {
  const tokenCache = new LRUCache({
    max: options.uniqueTokenPerInterval || 500,
    ttl: options.interval || 60000,
  });

  return {
    check: (req: Request, limit: number, token: string) =>
      new Promise<void>((resolve, reject) => {
        const tokenCount = (tokenCache.get(token) as number[]) || [0];
        if (tokenCount[0] === 0) {
          tokenCache.set(token, [1]);
        } else {
          tokenCount[0] += 1;
          tokenCache.set(token, tokenCount);
        }
        if (tokenCount[0] > limit) {
          reject(new Error('Rate limit exceeded'));
        } else {
          resolve();
        }
      }),
  };
} 