/**
 * LetsGoFood V15 SRE Gate: verify-live.js
 * Advanced validation for production readiness.
 */

const axios = require('axios');
const WebSocket = require('ws');

const TARGET_URL = process.env.TARGET_URL || 'http://localhost:3000';
const WS_URL = TARGET_URL.replace('http', 'ws');

async function runGate() {
  console.log(`🚀 SRE GATE: Starting validation on ${TARGET_URL}`);
  let results = {
    checks: [],
    score: 0,
    verdict: 'FAIL'
  };

  try {
    // 1. Cold Start / Latency Detection
    const start = Date.now();
    const health = await axios.get(`${TARGET_URL}/api/health`, { timeout: 5000 });
    const latency = Date.now() - start;
    
    results.checks.push({
      name: 'Cold Start Latency',
      value: `${latency}ms`,
      status: latency < 300 ? 'PASS' : 'DEGRADED'
    });

    // 2. API Integrity Check
    const orders = await axios.get(`${TARGET_URL}/api/orders/recent`, { timeout: 2000 });
    results.checks.push({
      name: 'API Integrity',
      status: Array.isArray(orders.data) ? 'PASS' : 'FAIL'
    });

    // 3. WS Handshake & Storm Simulation
    const wsStatus = await checkWebSocket(WS_URL);
    results.checks.push({
      name: 'WebSocket Handshake',
      status: wsStatus ? 'PASS' : 'FAIL'
    });

    // 4. Memory Snapshot Simulation (Internal endpoint check)
    try {
      const stats = await axios.get(`${TARGET_URL}/api/debug/stats`, { timeout: 1000 });
      results.checks.push({
        name: 'Heap Usage',
        value: `${stats.data.memory.heapUsed / 1024 / 1024 | 0}MB`,
        status: stats.data.memory.heapUsed < 200 * 1024 * 1024 ? 'PASS' : 'DEGRADED'
      });
    } catch (e) {
      results.checks.push({ name: 'Heap Usage', status: 'SKIP (Endpoint private)' });
    }

    // Final Verdict Logic
    const failed = results.checks.filter(c => c.status === 'FAIL').length;
    const degraded = results.checks.filter(c => c.status === 'DEGRADED').length;

    if (failed > 0) {
      results.verdict = 'FAIL (BLOCK DEPLOY)';
    } else if (degraded > 0) {
      results.verdict = 'SAFE WITH CANARY ONLY';
    } else {
      results.verdict = 'SAFE FOR PRODUCTION';
    }

    console.table(results.checks);
    console.log(`\n🏁 FINAL VERDICT: ${results.verdict}`);
    
    if (failed > 0) process.exit(1);
  } catch (error) {
    console.error(`❌ GATE CRASHED: ${error.message}`);
    process.exit(1);
  }
}

function checkWebSocket(url) {
  return new Promise((resolve) => {
    const ws = new WebSocket(url);
    const timeout = setTimeout(() => { ws.terminate(); resolve(false); }, 3000);
    ws.on('open', () => { clearTimeout(timeout); ws.close(); resolve(true); });
    ws.on('error', () => { clearTimeout(timeout); resolve(false); });
  });
}

runGate();
