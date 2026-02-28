// Payment & Token types - Phase 4 대비

export interface Profile {
  id: string;
  email: string;
  displayName?: string;
  avatarUrl?: string;
  tokenBalance: number;
  freeTokensUsed: number;
  createdAt: string;
}

export interface TokenTransaction {
  id: string;
  userId: string;
  type: "charge" | "spend" | "refund" | "bonus";
  amount: number;
  balance: number;
  description: string;
  referenceId?: string;
  createdAt: string;
}

export interface TokenPackage {
  id: string;
  name: string;
  tokens: number;
  price: number;
  bonusTokens?: number;
  recommended?: boolean;
}
