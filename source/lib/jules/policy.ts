export class JulesPolicy {
  async evaluate(action: string, context: any) {
    console.log(`[JULES] [POLICY] Evaluating action: ${action}`);
    return true; // Simple allow-all for MVP
  }
}
