import { LRUCache } from "lru-cache";

const tokenBalanceCache = new LRUCache<string, { balance: number; freeTokensUsed: number }>({
  max: 500,
  ttl: 30 * 1000, // 30초 TTL
});

export function getCachedTokenBalance(userId: string) {
  return tokenBalanceCache.get(userId) ?? null;
}

export function setCachedTokenBalance(
  userId: string,
  data: { balance: number; freeTokensUsed: number },
) {
  tokenBalanceCache.set(userId, data);
}

export function invalidateTokenBalance(userId: string) {
  tokenBalanceCache.delete(userId);
}
