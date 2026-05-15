
import jwt from 'jsonwebtoken';
import { config } from '../config';

const SECRET = config.JWT_SECRET;

async function testUnauthorizedTransitions() {
  console.log(`\n🕵️ Testing Unauthorized State Transitions...`);

  // 1. Customer trying to accept an order (should be driver)
  const customer = { uid: 'cust-1', email: 'cust@example.com', role: 'customer' };
  const customerToken = jwt.sign(customer, SECRET);

  const res1 = await fetch('http://localhost:3000/api/orders/some-order-id/accept', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${customerToken}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ driverName: 'Fake Driver' })
  });

  if (res1.status === 403) {
    console.log(`✅ Success: Customer blocked from accepting mission.`);
  } else {
    console.log(`❌ FAILURE: Customer could call accept API! Status: ${res1.status}`);
  }

  // 2. Driver trying to update restaurant status (should be merchant)
  const driver = { uid: 'driver-1', email: 'driver@example.com', role: 'driver' };
  const driverToken = jwt.sign(driver, SECRET);

  const res2 = await fetch('http://localhost:3000/api/merchant/restaurant/status', {
    method: 'PATCH',
    headers: { 'Authorization': `Bearer ${driverToken}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ status: 'closed' })
  });

  if (res2.status === 403) {
    console.log(`✅ Success: Driver blocked from changing restaurant status.`);
  } else {
    console.log(`❌ FAILURE: Driver could change restaurant status! Status: ${res2.status}`);
  }
}

async function testRBACExploits() {
  console.log(`\n🛡️ Testing RBAC & JWT Integrity...`);

  // Test invalid token
  const res = await fetch('http://localhost:3000/api/orders', {
    method: 'POST',
    headers: { 'Authorization': `Bearer invalid-token` }
  });

  if (res.status === 401) {
    console.log(`✅ Success: Invalid token rejected.`);
  } else {
    console.log(`❌ FAILURE: Invalid token accepted! Status: ${res.status}`);
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  (async () => {
    await testUnauthorizedTransitions();
    await testRBACExploits();
  })();
}

export { testUnauthorizedTransitions, testRBACExploits };
