
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

    // Enhanced DAG Generation
    if (event.type === 'order.created') {
      tasks.push({
        id: 'fraud_check',
        agent: 'OPS',
        action: 'RISK_ASSESSMENT',
        payload: { orderId: event.payload.resourceId }
      });
      tasks.push({
        id: 'payment_auth',
        agent: 'FINANCE',
        action: 'PAYMENT_RESERVATION',
        payload: { orderId: event.payload.resourceId },
        dependsOn: ['fraud_check']
      });
      tasks.push({
        id: 'notify_merchant',
        agent: 'OPS',
        action: 'ORDER_PUSH',
        payload: { orderId: event.payload.resourceId },
        dependsOn: ['payment_auth']
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
