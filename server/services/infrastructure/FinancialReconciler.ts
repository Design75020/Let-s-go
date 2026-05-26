import { prisma } from '../../lib/prisma';
import { logger } from './Observability';

/**
 * LetsGoFood V15 Financial Reconciler
 * audits the canonical ledger against the order store to detect 
 * financial drift or missing revenue events.
 */
export class FinancialReconciler {
  public async runAudit() {
    logger.info('FINANCE_GATE: Starting Marketplace Audit...');
    
    try {
      const orders = await prisma.order.findMany({
        where: { status: 'DELIVERED' },
        include: { ledgerEntries: true }
      });

      let discrepancies = 0;

      for (const order of orders) {
        const totalCredited = order.ledgerEntries
          .filter((e: any) => e.status === 'COMPLETED')
          .reduce((sum: number, e: any) => sum + e.amount, 0);

        if (Math.abs(totalCredited - order.total) > 0.001) {
          logger.fatal({ 
            orderId: order.id, 
            orderTotal: order.total, 
            ledgerTotal: totalCredited 
          }, 'FINANCE_GATE: Critical Discrepancy Found!');
          discrepancies++;
        }
      }

      const result = {
        auditedOrders: orders.length,
        discrepancies,
        status: discrepancies === 0 ? 'PASS' : 'FAIL'
      };

      logger.info(result, 'FINANCE_GATE: Audit Complete.');
      return result;
    } catch (err) {
      logger.error(err, 'FINANCE_GATE: Audit Aborted due to system error');
      throw err;
    }
  }
}

export const financialReconciler = new FinancialReconciler();
