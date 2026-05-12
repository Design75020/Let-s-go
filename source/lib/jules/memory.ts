export class JulesMemory {
  async getContext(resourceId: string) {
    console.log(`[JULES] [MEMORY] Retrieving context for ${resourceId}`);
    return {};
  }

  async storeContext(resourceId: string, data: any) {
    console.log(`[JULES] [MEMORY] Storing context for ${resourceId}`);
  }
}
