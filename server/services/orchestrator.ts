/**
 * LetsGoFood Cloud-Native Orchestrator (K8s Simulation)
 * Manages Service Instances, Horizontal Pod Autoscaling (HPA), and Self-Healing.
 */

interface PodInstance {
  id: string;
  service: string;
  status: 'RUNNING' | 'TERMINATING' | 'CRASHED';
  cpu: number;
  memory: number;
  startTime: Date;
}

class OrchestratorService {
  private static instance: OrchestratorService;
  private pods: Map<string, PodInstance> = new Map();

  private constructor() {
    this.bootInitialPods();
    this.startHPA();
  }

  public static getInstance(): OrchestratorService {
    if (!OrchestratorService.instance) {
      OrchestratorService.instance = new OrchestratorService();
    }
    return OrchestratorService.instance;
  }

  private bootInitialPods() {
    this.spawnPod('api-core');
    this.spawnPod('api-core');
    this.spawnPod('worker-queue');
  }

  private spawnPod(service: string) {
    const id = `${service}-${Math.random().toString(36).substr(2, 5)}`;
    this.pods.set(id, {
      id,
      service,
      status: 'RUNNING',
      cpu: Math.random() * 20,
      memory: Math.random() * 128,
      startTime: new Date()
    });
  }

  private startHPA() {
    setInterval(() => {
      this.pods.forEach((pod, id) => {
        // Simulate load fluctuation
        pod.cpu = Math.min(100, Math.max(0, pod.cpu + (Math.random() - 0.5) * 10));
        
        // Self-healing: if "Crashed", restart
        if (pod.status === 'CRASHED') {
          console.log(`[K8S] Self-Healing: Restarting ${id}`);
          pod.status = 'RUNNING';
          pod.cpu = 0;
        }

        // HPA Logic: Scale up if CPU > 80%
        if (pod.cpu > 80) {
          console.log(`[K8S] HPA: Scaling Up ${pod.service}`);
          this.spawnPod(pod.service);
        }
      });
    }, 5000);
  }

  public crashPod(id: string) {
    const pod = this.pods.get(id);
    if (pod) {
      pod.status = 'CRASHED';
      console.warn(`[K8S] Pod ${id} CRASHED (Failure Injection)`);
    }
  }

  public getClusterStatus() {
    return Array.from(this.pods.values());
  }
}

export const K8s = OrchestratorService.getInstance();
