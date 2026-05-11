/**
 * LetsGoFood Multi-Region & Failover Manager
 * Simulates Global Distribution and Disaster Recovery.
 */

interface Region {
  id: string;
  name: string;
  status: 'HEALTHY' | 'DEGRADED' | 'DOWN';
  isPrimary: boolean;
  load: number;
}

class RegionManager {
  private static instance: RegionManager;
  private regions: Region[] = [
    { id: 'eu-west-1', name: 'Europe (Paris)', status: 'HEALTHY', isPrimary: true, load: 45 },
    { id: 'us-east-1', name: 'USA (N. Virginia)', status: 'HEALTHY', isPrimary: false, load: 12 },
    { id: 'asia-east-1', name: 'Asia (Tokyo)', status: 'HEALTHY', isPrimary: false, load: 8 }
  ];

  private constructor() {}

  public static getInstance(): RegionManager {
    if (!RegionManager.instance) {
      RegionManager.instance = new RegionManager();
    }
    return RegionManager.instance;
  }

  public getRegions() {
    return this.regions;
  }

  public simulateFailover() {
    const primary = this.regions.find(r => r.isPrimary);
    const backup = this.regions.find(r => !r.isPrimary && r.status === 'HEALTHY');

    if (primary && backup) {
      console.error(`[FAILOVER] Primary Region ${primary.id} DOWN. Rerouting to ${backup.id}.`);
      primary.status = 'DOWN';
      primary.isPrimary = false;
      backup.isPrimary = true;
    }
  }

  public recoverRegions() {
    this.regions.forEach(r => {
      r.status = 'HEALTHY';
      if (r.id === 'eu-west-1') r.isPrimary = true;
      else r.isPrimary = false;
    });
  }
}

export const Geo = RegionManager.getInstance();
