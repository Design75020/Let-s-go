/**
 * LetsGoFood Async Message Queue
 * Decouples heavy processing from the API Lifecycle.
 */

type Job = {
  id: string;
  type: string;
  payload: any;
  retries: number;
  timestamp: Date;
};

class QueueService {
  private static instance: QueueService;
  private queue: Job[] = [];
  private processing: boolean = false;

  private constructor() {
    this.startWorker();
  }

  public static getInstance(): QueueService {
    if (!QueueService.instance) {
      QueueService.instance = new QueueService();
    }
    return QueueService.instance;
  }

  /**
   * Push an async job to the queue
   */
  async push(type: string, payload: any): Promise<string> {
    const id = Math.random().toString(36).substr(2, 9);
    this.queue.push({
      id,
      type,
      payload,
      retries: 0,
      timestamp: new Date()
    });
    console.log(`[QUEUE] Job Enqueued: ${type} (${id})`);
    return id;
  }

  /**
   * Simple Worker Loop
   */
  private startWorker() {
    setInterval(async () => {
      if (this.processing || this.queue.length === 0) return;
      
      this.processing = true;
      const job = this.queue.shift()!;
      
      try {
        await this.processJob(job);
        console.log(`[QUEUE] Job Success: ${job.type} (${job.id})`);
      } catch (err) {
        console.error(`[QUEUE] Job Failed: ${job.type} (${job.id})`, err);
        if (job.retries < 3) {
          job.retries++;
          this.queue.push(job);
        }
      } finally {
        this.processing = false;
      }
    }, 1000);
  }

  private async processJob(job: Job) {
    // Industrial Async Logic simulations
    switch (job.type) {
      case 'PROCESS_PAYMENT_RECEIPT':
        // Stripe Sync, PDF Generation, Email etc.
        await new Promise(r => setTimeout(r, 500));
        break;
      case 'NOTIFY_MERCHANT_SMS':
        // SMS Integration proxy
        break;
      case 'ANALYTICS_AGGREGATION':
        // Move heavy calc out of request
        break;
      default:
        console.warn(`[QUEUE] Unknown job type: ${job.type}`);
    }
  }
}

export const Queue = QueueService.getInstance();
