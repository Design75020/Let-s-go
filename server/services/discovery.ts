/**
 * LetsGoFood Service Discovery Layer
 * Registry for internal micro-modules to ensure decoupling and future-proof scaling.
 */

interface ServiceInfo {
  name: string;
  endpoint: string;
  status: 'UP' | 'DOWN';
  lastHeartbeat: Date;
}

class DiscoveryService {
  private static instance: DiscoveryService;
  private services: Map<string, ServiceInfo> = new Map();

  private constructor() {
    // Register initial core services
    this.register('api-core', 'http://api.letsgofood.fr');
    this.register('payment-gateway', 'internal://payments');
    this.register('notification-dispatcher', 'internal://notifications');
  }

  public static getInstance(): DiscoveryService {
    if (!DiscoveryService.instance) {
      DiscoveryService.instance = new DiscoveryService();
    }
    return DiscoveryService.instance;
  }

  register(name: string, endpoint: string): void {
    this.services.set(name, {
      name,
      endpoint,
      status: 'UP',
      lastHeartbeat: new Date()
    });
    console.log(`[DISCOVERY] Service Registered: ${name} -> ${endpoint}`);
  }

  resolve(name: string): string | null {
    const service = this.services.get(name);
    return service && service.status === 'UP' ? service.endpoint : null;
  }

  getRegistry(): ServiceInfo[] {
    return Array.from(this.services.values());
  }
}

export const Discovery = DiscoveryService.getInstance();
