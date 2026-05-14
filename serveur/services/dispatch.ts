
import { REGIONAL_CONFIG } from '../constants';

export class DispatchService {
  async findAvailableDriver(zipCode: string) {
    // Check if in regional bounds
    const prefix = zipCode.slice(0, 2);
    const region = REGIONAL_CONFIG.PARIS_IDF;

    if (!region.zipCodes.includes(prefix)) {
      console.warn(`[DISPATCH] Order outside of ${region.name} ignored.`);
      return null;
    }

    console.log(`[DISPATCH] Matching driver for region: ${prefix}`);
    // Simple availability logic (Simulation)
    return { id: 'd_expert_01', name: 'Jean Expert', eta: '12 min' };
  }
}

export const dispatch = new DispatchService();
