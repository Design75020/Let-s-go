
import { Router, Request, Response, NextFunction } from 'express';
import { getAI } from './ai';
// import { adminAuth } from './firebaseAdmin'; // Using JWT for V15 Production Stability
import { orderController } from './controllers/OrderController';
import { metrics, HealthMonitor } from './services/infrastructure/Observability';
import { economyEngine, costController, batchProcessor, BIEvents, v16Engine } from './services/bi';
import { BusinessMonitor } from './services/bi/BusinessMonitor';
import { eventStream, EventDomain } from './services/infrastructure/EventStream';
import { authenticate, authorize } from './middleware/AuthMiddleware';
import { UserRole, Security } from './services/infrastructure/Security';
import { AuditLog } from './services/infrastructure/AuditLog';
import { AgentsPipelineCoordinator } from '../agents-pipeline/pipeline';
import { sreSimulationEngine } from './services/infrastructure/SreSimulationEngine';

const router = Router();

// --- AUTHENTICATION (Hardened) ---

// In production, this would verify against a DB/Identity Provider
router.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;
  
  // Demo Login (Stable Mock)
  if (email === 'admin@letsgofood.fr' && password === 'v15stable') {
    const user = { id: 'admin-1', email, role: UserRole.ADMIN };
    const token = Security.generateToken(user);
    AuditLog.logSecurityEvent(user.id, 'LOGIN_SUCCESS', { email });
    return res.json({ token, user });
  }
  
  AuditLog.logSecurityEvent(null, 'LOGIN_FAILURE', { email });
  res.status(401).json({ error: 'Invalid credentials' });
});

// --- STABLE V15 API ---

// Orders — FIX: Protected with authenticate middleware (was open to unauthenticated requests)
router.get('/api/orders', authenticate, orderController.listRecent);
router.post('/api/orders', authenticate, orderController.create);
router.get('/api/orders/:id', authenticate, orderController.getOne);
router.patch('/api/orders/:id/accept', authenticate, orderController.accept);
router.patch('/api/orders/:id/ready', authenticate, orderController.setReady);
router.post('/api/orders/:id/claim', authenticate, orderController.claim);
router.patch('/api/orders/:id/complete', authenticate, orderController.complete);

// Diagnostics API (Hardened RBAC)
router.get('/api/diagnostics', authenticate, authorize([UserRole.ADMIN, UserRole.OPERATOR]), async (req, res) => {
  const economyInfo = await eventStream.getStreamInfo(EventDomain.ECONOMY);
  const anomalyInfo = await eventStream.getStreamInfo(EventDomain.ANOMALY);
  const costInfo = await eventStream.getStreamInfo(EventDomain.COST);

  res.json({
    healthScore: HealthMonitor.getScore(),
    streams: {
      economy: economyInfo,
      anomaly: anomalyInfo,
      cost: costInfo
    },
    v16: v16Engine.getGlobalState()
  });
});

// Observability
router.get('/api/health', (req, res) => {
  res.status(200).json({
    status: "ok",
    service: "letsgofood-v15",
    safeMode: process.env.SAFE_MODE === "true"
  });
});

router.get('/api/version', (req, res) => {
  res.status(200).json({
    version: "v15-stable",
    environment: process.env.NODE_ENV || "development",
    safeMode: process.env.SAFE_MODE === "true"
  });
});

router.get('/api/metrics', authenticate, authorize([UserRole.ADMIN]), async (req, res) => {
  res.set('Content-Type', metrics.register.contentType);
  res.end(await metrics.getMetrics());
});

// SaaS Monitoring (Dashboard Data)
let lastMonitoringSnapshot: any = null;
let lastSnapshotTime = 0;
const MONITORING_CACHE_MS = 1000; // 1s server-side cache for monitoring endpoint

router.get('/api/monitoring', (req, res) => {
  const now = Date.now();
  if (lastMonitoringSnapshot && (now - lastSnapshotTime < MONITORING_CACHE_MS)) {
    return res.json(lastMonitoringSnapshot);
  }

  const health = HealthMonitor.getMetrics();
  const business = BusinessMonitor.getMetrics();
  const market = BusinessMonitor.getMarketMetrics();

  lastMonitoringSnapshot = {
    health: {
      uhs: health.uhs,
      apiLatency: health.avgLatency,
      redisLag: health.workerLag,
      workerLag: health.workerLag,
      errorRate: health.errorRate
    },
    business,
    market
  };
  lastSnapshotTime = now;

  res.json(lastMonitoringSnapshot);
});

// --- LEGACY/MERCHANT (Preserving for compatibility) ---
router.post('/api/ratings', authenticate, async (req, res) => {
  res.status(501).json({ error: 'Not implemented in V15 stable yet' });
});

// AI OPTIMIZER
router.post('/api/ai/optimize-menu', async (req, res) => {
  const ai = getAI();
  if (!ai) return res.status(503).json({ error: 'AI not configured' });

  try {
    const model = ai.getGenerativeModel({ model: "gemini-2.0-flash-exp" });
    const prompt = 'Analyse ces produits et suggère des prix psychologiques pour LetsGoFood V15 : ' + JSON.stringify(req.body.items);
    const result = await model.generateContent(prompt);
    res.json({ advice: result.response.text() });
  } catch (error) {
    res.status(500).json({ error: 'AI generation failed' });
  }
});

// --- LETSGOFOOD V15 AGENTS PIPELINE API ---

// Create / Trigger a pipeline run
router.post('/api/agents/run', async (req, res) => {
  if (process.env.NODE_ENV === 'production') {
    return res.status(403).json({ error: 'AI automation pipelines are disabled in the production runtime.' });
  }
  const { prompt } = req.body;
  if (!prompt) {
    return res.status(400).json({ error: 'Product prompt is required' });
  }

  try {
    const runState = await AgentsPipelineCoordinator.triggerPipeline(prompt);
    
    // Poll the background orchestrating task periodically (max 60 seconds)
    // to return the synchronous payload requested by the user API spec,
    // while still letting the dashboard show live progress.
    let attempts = 0;
    while (attempts < 120) {
      const current = AgentsPipelineCoordinator.getState(runState.id);
      if (current && (current.status === 'SUCCESS' || current.status === 'FAILED')) {
        break;
      }
      await new Promise(r => setTimeout(r, 500));
      attempts++;
    }

    const finalState = AgentsPipelineCoordinator.getState(runState.id);
    if (!finalState || finalState.status === 'FAILED') {
      return res.status(500).json({
        status: "error",
        error: finalState?.errorMessage || "Pipeline execution failed or timed out."
      });
    }

    res.json({
      status: "success",
      manus: {
        architecture: finalState.manusOutput?.architectureStyle || "Stateless Microservices Layout",
        services: finalState.manusOutput?.services.map(s => s.name) || []
      },
      codex: {
        status: finalState.codexOutput?.status || "ok",
        filesGenerated: (finalState.codexOutput?.filesGenerated?.length || 0) > 0
      },
      githubRepo: finalState.githubRepo || "",
      cloudRunUrl: finalState.cloudRunUrl || "",
      opsDashboardUpdate: true
    });

  } catch (error: any) {
    res.status(500).json({ status: "error", error: error.message || "Pipeline execution failure." });
  }
});

// Dynamic sandbox simulation route for verified SRE runs
router.all('/simulated/:runId*', (req, res) => {
  if (process.env.NODE_ENV === 'production') {
    return res.status(403).json({ error: 'Simulation engines are disabled in the production runtime.' });
  }
  const { runId } = req.params as any;
  const fullUrl = req.originalUrl;
  const prefix = `/simulated/${runId}`;
  let targetPath = fullUrl.substring(fullUrl.indexOf(prefix) + prefix.length) || '/';
  
  // Clean query strings for router path matching
  if (targetPath.includes('?')) {
    targetPath = targetPath.substring(0, targetPath.indexOf('?'));
  }
  if (!targetPath.startsWith('/')) {
    targetPath = '/' + targetPath;
  }

  const realRunId = runId.replace('letsgofood-mvp-', '');
  const run = AgentsPipelineCoordinator.getState(realRunId);
  
  if (!run) {
    return res.status(404).json({ 
      error: `Simulated runner failed: Run #${runId} not found.`,
      help: "Ensure you selected a successfully built run identifier inside the /ops workspace console."
    });
  }

  const services = run.manusOutput?.services || [];
  
  if (targetPath === '/health' || targetPath === '/api/health') {
    return res.json({
      status: "UP",
      timestamp: new Date().toISOString(),
      simulatedRunId: run.id,
      services: services.map(s => s.name),
      dataStore: run.manusOutput?.dataPlane?.primaryDatabase || "PostgreSQL (Prisma)",
      cacheLayer: run.manusOutput?.dataPlane?.cache || "Redis Clusters",
      messageBroker: run.manusOutput?.dataPlane?.messageBroker || "Kafka Queue Plane",
      platformCode: "LETSGOFOOD_V15_COMPLIANT_RUNNER"
    });
  }

  if (targetPath === '/api/orders' || targetPath === '/orders') {
    return res.json({
      status: "CREATED",
      id: "ord_sim_" + Math.random().toString(36).substring(7),
      estimatedArrivalMin: 20 + Math.floor(Math.random() * 15),
      idempotentKeyVerified: true,
      simulation: true,
      details: "Dynamically served from Codex compiled in-memory state containers."
    });
  }

  // Generic endpoint matcher for any custom path declared inside Codex's output
  for (const srv of services) {
    const matchedEp = srv.endpoints?.find(ep => {
      const epPath = ep.path.startsWith('/') ? ep.path : '/' + ep.path;
      return epPath === targetPath || targetPath.endsWith(epPath);
    });

    if (matchedEp) {
      return res.json({
        endpoint: matchedEp.path,
        method: matchedEp.method,
        description: matchedEp.description,
        status: "SUCCESS_EMULATED",
        timestamp: new Date().toISOString(),
        payload: {
          simulated: true,
          traceId: "tr_" + Math.random().toString(36).substring(9),
          note: "Auto-engineered with LetsGoFood V15 SRE guidelines"
        }
      });
    }
  }

  res.json({
    status: "SUCCESS_EMULATED",
    path: targetPath,
    message: "Flexible simulation catch-all fallback",
    timestamp: new Date().toISOString()
  });
});

// List all historical pipeline runs
router.get('/api/agents/runs', (req, res) => {
  res.json(AgentsPipelineCoordinator.getAllState());
});

// Get individual run status
router.get('/api/agents/runs/:id', (req, res) => {
  const state = AgentsPipelineCoordinator.getState(req.params.id);
  if (!state) return res.status(404).json({ error: 'Pipeline run not found' });
  res.json(state);
});

// --- LETSGOFOOD V15 PRODUCTION SRE & CHAOS API ---
// FIX: SRE routes protected with ADMIN/OPERATOR authorization
router.get('/api/sre/status', authenticate, authorize([UserRole.ADMIN, UserRole.OPERATOR]), (req, res) => {
  res.json(sreSimulationEngine.getStatus());
});

router.post('/api/sre/trigger-load', authenticate, authorize([UserRole.ADMIN, UserRole.OPERATOR]), (req, res) => {
  const { loadUsers, loadDrivers, orderSpike } = req.body;
  sreSimulationEngine.applyLoad(Number(loadUsers), Number(loadDrivers), Number(orderSpike));
  res.json({ success: true, status: sreSimulationEngine.getStatus() });
});

router.post('/api/sre/toggle-chaos', authenticate, authorize([UserRole.ADMIN]), (req, res) => {
  const { type, active } = req.body;
  sreSimulationEngine.toggleChaos(type, active);
  res.json({ success: true, status: sreSimulationEngine.getStatus() });
});

router.post('/api/sre/rebuild', authenticate, authorize([UserRole.ADMIN]), (req, res) => {
  sreSimulationEngine.rebuildProjections();
  res.json({ success: true, status: sreSimulationEngine.getStatus() });
});

router.post('/api/sre/auto-heal', authenticate, authorize([UserRole.ADMIN, UserRole.OPERATOR]), (req, res) => {
  sreSimulationEngine.runAutoHealing();
  res.json({ success: true, status: sreSimulationEngine.getStatus(), message: "Draining DLQ and reviving workers..." });
});

router.post('/api/sre/run-validation', authenticate, authorize([UserRole.ADMIN]), (req, res) => {
  const { loadUsers, loadDrivers, orderSpike } = req.body;
  const report = sreSimulationEngine.runFullValidationSuite(
    Number(loadUsers || 1500),
    Number(loadDrivers || 350),
    Number(orderSpike || 6000)
  );
  res.json({ success: true, status: sreSimulationEngine.getStatus(), report });
});

router.post('/api/sre/migrate-db', authenticate, authorize([UserRole.ADMIN]), (req, res) => {
  sreSimulationEngine.startMigration();
  res.json({ success: true, status: sreSimulationEngine.getStatus() });
});

router.post('/api/sre/reset-migration', authenticate, authorize([UserRole.ADMIN]), (req, res) => {
  sreSimulationEngine.resetMigration();
  res.json({ success: true, status: sreSimulationEngine.getStatus() });
});

router.post('/api/sre/canary-deploy', authenticate, authorize([UserRole.ADMIN]), (req, res) => {
  sreSimulationEngine.startCanaryDeploy();
  res.json({ success: true, status: sreSimulationEngine.getStatus() });
});

router.post('/api/sre/canary-ramp', authenticate, authorize([UserRole.ADMIN]), (req, res) => {
  sreSimulationEngine.startCanaryRamp();
  res.json({ success: true, status: sreSimulationEngine.getStatus() });
});

router.post('/api/sre/canary-rollback', authenticate, authorize([UserRole.ADMIN]), (req, res) => {
  sreSimulationEngine.triggerCanaryRollback();
  res.json({ success: true, status: sreSimulationEngine.getStatus() });
});

router.post('/api/sre/canary-reset', authenticate, authorize([UserRole.ADMIN]), (req, res) => {
  sreSimulationEngine.resetCanary();
  res.json({ success: true, status: sreSimulationEngine.getStatus() });
});

router.get('/api/sre/autonomous-report', authenticate, authorize([UserRole.ADMIN, UserRole.OPERATOR]), (req, res) => {
  res.json(sreSimulationEngine.getAutonomousReport());
});

export default router;
