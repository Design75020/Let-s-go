
import jwt from 'jsonwebtoken';
import { config } from '../config';

const SECRET = config.JWT_SECRET;

/**
 * UTILS FOR STAGING VALIDATION
 * Simulates API calls and load.
 */

async function runLoadTest(concurrentUsers: number) {
  console.log(`🚀 Starting Load Test with ${concurrentUsers} concurrent users...`);
  const results = {
    success: 0,
    failed: 0,
    latencies: [] as number[]
  };

  const tasks = Array.from({ length: concurrentUsers }).map(async (_, i) => {
    const start = Date.now();
    try {
      // Create a mock JWT for the test user
      const testUser = { uid: `test-user-${i}`, email: `test-${i}@example.com`, role: 'customer' };
      const token = jwt.sign(testUser, SECRET);

      const response = await fetch('http://localhost:3000/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          clientId: testUser.uid,
          clientName: `Test User ${i}`,
          restaurantId: 'resto-demo-1',
          restaurantName: 'Demo Restaurant',
          items: [
            { id: 'item-1', name: 'Premium Burger', price: 15.00, quantity: 1 }
          ],
          total: 15.00 // This should be 17.50 with delivery fee if validated by server
        })
      });

      const duration = Date.now() - start;
      results.latencies.push(duration);

      if (response.ok) {
        results.success++;
      } else {
        const err = await response.json();
        // console.log(`Order ${i} failed:`, err.error);
        results.failed++;
      }
    } catch (err) {
      results.failed++;
    }
  });

  await Promise.all(tasks);

  const avgLatency = results.latencies.reduce((a, b) => a + b, 0) / results.latencies.length;
  console.log(`\n--- LOAD TEST RESULTS ---`);
  console.log(`Users: ${concurrentUsers}`);
  console.log(`Success: ${results.success}`);
  console.log(`Failed: ${results.failed} (Expected some failures if price validation is working)`);
  console.log(`Avg Latency: ${avgLatency.toFixed(2)}ms`);
}

async function validatePriceAuthority() {
  console.log(`\n🛡️ Validating Backend Price Authority...`);

  const testUser = { uid: 'hacker-1', email: 'hacker@example.com', role: 'customer' };
  const token = jwt.sign(testUser, SECRET);

  // Try to place order with manipulated price (0.01€ instead of 15€)
  const response = await fetch('http://localhost:3000/api/orders', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({
      clientId: testUser.uid,
      clientName: 'Hacker',
      restaurantId: 'resto-demo-1',
      restaurantName: 'Demo Restaurant',
      items: [
        { id: 'item-1', name: 'Premium Burger', price: 0.01, quantity: 1 }
      ],
      total: 0.01
    })
  });

  if (response.status === 400) {
    const data = await response.json();
    console.log(`✅ Success: Server rejected price manipulation: "${data.error}"`);
  } else {
    console.log(`❌ FAILURE: Server accepted manipulated price! Status: ${response.status}`);
  }
}

// If run directly
if (import.meta.url === `file://${process.argv[1]}`) {
  (async () => {
    await validatePriceAuthority();
    await runLoadTest(10);
    await runLoadTest(50);
  })();
}

export { runLoadTest, validatePriceAuthority };
