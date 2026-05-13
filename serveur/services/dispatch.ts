
export interface RegionBounds {
  name: string;
  zipCodes: string[];
}

const PARIS_IDF_REGION: RegionBounds = {
  name: 'Paris + Île-de-France',
  zipCodes: ['75', '77', '78', '91', '92', '93', '94', '95']
};

export class DispatchService {
  async findAvailableDriver(zipCode: string) {
    // Check if in regional bounds
    const prefix = zipCode.slice(0, 2);
    if (!PARIS_IDF_REGION.zipCodes.includes(prefix)) {
      console.warn(`[DISPATCH] Order outside of ${PARIS_IDF_REGION.name} ignored.`);
      return null;
    }

    console.log(`[DISPATCH] Matching driver for region: ${prefix}`);
    // Simple availability logic (Simulation)
    return { id: 'd_expert_01', name: 'Jean Expert', eta: '12 min' };
  }
}

export const dispatch = new DispatchService();
