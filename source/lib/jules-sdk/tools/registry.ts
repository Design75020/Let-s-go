
import { FirestoreTool, StripeTool, NotificationTool } from './index';

export class JulesToolRegistry {
  private static instance: JulesToolRegistry;
  private tools: Map<string, any> = new Map();

  private constructor() {
    this.register('firestore', new FirestoreTool());
    this.register('stripe', new StripeTool());
    this.register('notification', new NotificationTool());
  }

  public static getInstance(): JulesToolRegistry {
    if (!JulesToolRegistry.instance) {
      JulesToolRegistry.instance = new JulesToolRegistry();
    }
    return JulesToolRegistry.instance;
  }

  register(name: string, tool: any) {
    this.tools.set(name, tool);
    console.log(`[JULES-REGISTRY] Registered tool: ${name}`);
  }

  getTool(name: string) {
    return this.tools.get(name);
  }

  listTools() {
    return Array.from(this.tools.keys());
  }
}

export const registry = JulesToolRegistry.getInstance();
