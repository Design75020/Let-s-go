
export type AgentType = 'DISPATCH' | 'CRM' | 'SUPPORT' | 'FINANCE' | 'OPS';

export interface JulesTask {
  id: string;
  agent: AgentType;
  action: string;
  payload: any;
  dependsOn?: string[];
}

export interface JulesPlan {
  id: string;
  correlationId: string;
  tasks: JulesTask[];
  status: 'draft' | 'executing' | 'completed' | 'failed';
}
