
import { JulesEvent } from '../core/runtime';
import { JulesPlan, JulesTask, AgentType } from '../types';

export class JulesOrchestrator {
  async selectAgent(event: JulesEvent): Promise<AgentType> {
    const mapping: Record<string, AgentType> = {
      'order.created': 'OPS',
      'order.accepted': 'FINANCE',
      'order.ready': 'DISPATCH',
      'order.delivered': 'CRM',
      'support.ticket': 'SUPPORT'
    };

    return mapping[event.type] || 'OPS';
  }

  async createPlan(event: JulesEvent, context: any): Promise<JulesPlan> {
    const agent = await this.selectAgent(event);
    console.log(`[JULES-ORCHESTRATOR] Selecting agent ${agent} for ${event.type}`);

    const tasks: JulesTask[] = [];

    // Simulate DAG Generation
    if (event.type === 'order.created') {
      tasks.push({
        id: 'task_1',
        agent: 'OPS',
        action: 'RISK_ASSESSMENT',
        payload: { orderId: event.payload.resourceId }
      });
      tasks.push({
        id: 'task_2',
        agent: 'FINANCE',
        action: 'PAYMENT_RESERVATION',
        payload: { orderId: event.payload.resourceId },
        dependsOn: ['task_1']
      });
    }

    return {
      id: crypto.randomUUID(),
      correlationId: event.correlationId,
      tasks,
      status: 'draft'
    };
  }
}

export const orchestrator = new JulesOrchestrator();
