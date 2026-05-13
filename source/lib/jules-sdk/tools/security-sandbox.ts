
import { telemetry } from '../core/telemetry';

export class JulesSecuritySandbox {
  private static instance: JulesSecuritySandbox;

  private constructor() {}

  public static getInstance(): JulesSecuritySandbox {
    if (!JulesSecuritySandbox.instance) {
      JulesSecuritySandbox.instance = new JulesSecuritySandbox();
    }
    return JulesSecuritySandbox.instance;
  }

  async runSafe<T>(toolName: string, task: () => Promise<T>, correlationId: string): Promise<T> {
    const span = telemetry.startSpan(`sandbox_${toolName}`, correlationId);
    console.log(`[SECURITY-SANDBOX] [EXEC] Tool: ${toolName} | correlationId: ${correlationId}`);

    try {
      // Logic for permission validation (RBAC check before tool run)
      // Future: Wasm/Isolate isolation
      const result = await task();

      console.log(`[SECURITY-SANDBOX] [SUCCESS] Tool: ${toolName}`);
      return result;
    } catch (error) {
      console.error(`[SECURITY-SANDBOX] [FAILURE] Tool: ${toolName} | Error:`, error);
      throw error;
    } finally {
      span.end();
    }
  }
}

export const sandbox = JulesSecuritySandbox.getInstance();
