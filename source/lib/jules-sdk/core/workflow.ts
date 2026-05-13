
export type WorkflowState = 'INITIAL' | 'PROCESSING' | 'WAITING' | 'COMPLETED' | 'FAILED' | 'RETRYING';

export interface WorkflowInstance {
  id: string;
  name: string;
  state: WorkflowState;
  context: any;
  createdAt: string;
  updatedAt: string;
}

export interface PersistenceProvider {
  save(id: string, instance: WorkflowInstance): Promise<void>;
  load(id: string): Promise<WorkflowInstance | null>;
  delete(id: string): Promise<void>;
}

export class JulesWorkflowEngine {
  private static instance: JulesWorkflowEngine;
  private persistence?: PersistenceProvider;

  private constructor() {}

  public static getInstance(): JulesWorkflowEngine {
    if (!JulesWorkflowEngine.instance) {
      JulesWorkflowEngine.instance = new JulesWorkflowEngine();
    }
    return JulesWorkflowEngine.instance;
  }

  setPersistenceProvider(provider: PersistenceProvider) {
    this.persistence = provider;
  }

  async startWorkflow(name: string, initialContext: any): Promise<string> {
    const workflowId = crypto.randomUUID();
    const instance: WorkflowInstance = {
      id: workflowId,
      name,
      state: 'INITIAL',
      context: initialContext,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    console.log(`[JULES-WORKFLOW] Starting workflow: ${name} [${workflowId}]`);
    await this.persistence?.save(workflowId, instance);

    return workflowId;
  }

  async transition(workflowId: string, newState: WorkflowState, contextUpdate: any) {
    console.log(`[JULES-WORKFLOW] Transitioning ${workflowId} to ${newState}`);
    await this.checkpoint(workflowId, newState, contextUpdate);
  }

  async checkpoint(workflowId: string, state: WorkflowState, contextUpdate: any) {
    console.log(`[JULES-WORKFLOW] [CHECKPOINT] Saving state for ${workflowId}: ${state}`);
    const instance = await this.persistence?.load(workflowId);
    if (instance) {
      instance.state = state;
      instance.context = { ...instance.context, ...contextUpdate };
      instance.updatedAt = new Date().toISOString();
      await this.persistence?.save(workflowId, instance);
    }
  }

  async resume(workflowId: string): Promise<WorkflowInstance | null> {
    console.log(`[JULES-WORKFLOW] [RECOVERY] Resuming workflow ${workflowId}`);
    const instance = await this.getWorkflow(workflowId);
    if (instance && instance.state !== 'COMPLETED' && instance.state !== 'FAILED') {
      // Logic to restart from last valid checkpoint
      return instance;
    }
    return null;
  }

  async getWorkflow(workflowId: string): Promise<WorkflowInstance | null> {
    return this.persistence?.load(workflowId) || null;
  }
}

export const workflowEngine = JulesWorkflowEngine.getInstance();
