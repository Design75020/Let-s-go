
export class TokenBudgetManager {
  private tenantBudgets: Map<string, number> = new Map();
  private usage: Map<string, number> = new Map();

  constructor(defaultBudget = 1000000) {
    // Default 1M tokens budget
  }

  async checkBudget(tenantId: string, estimatedTokens: number): Promise<boolean> {
    const currentUsage = this.usage.get(tenantId) || 0;
    const budget = this.tenantBudgets.get(tenantId) || 1000000;

    if (currentUsage + estimatedTokens > budget) {
      console.error(`[COST-CONTROL] Budget exceeded for tenant ${tenantId}`);
      return false;
    }
    return true;
  }

  async trackUsage(tenantId: string, tokens: number) {
    const currentUsage = this.usage.get(tenantId) || 0;
    this.usage.set(tenantId, currentUsage + tokens);
    console.log(`[COST-CONTROL] Usage updated for ${tenantId}: ${currentUsage + tokens} tokens`);
  }
}

export const budgetManager = new TokenBudgetManager();
