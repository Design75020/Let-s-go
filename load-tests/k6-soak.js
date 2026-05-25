import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  stages: [
    { duration: '1m', target: 100 }, // Ramp up
    { duration: '8h', target: 500 }, // Sustained SOAK test
    { duration: '1m', target: 0 },   // Ramp down
  ],
  thresholds: {
    http_req_duration: ['p(95)<150', 'p(99)<300'],
    http_req_failed: ['rate<0.01'],
  },
};

export default function () {
  const payload = JSON.stringify({
    userId: 'test-user',
    restaurantId: 'rest-1',
    total: 25.50,
    idempotencyKey: `k6-${Math.random()}-${Date.now()}`
  });

  const params = {
    headers: { 'Content-Type': 'application/json' },
  };

  const res = http.post('http://lgf-api/api/orders', payload, params);
  
  check(res, {
    'is status 200': (r) => r.status === 200,
    'has orderId': (r) => r.json().id !== undefined,
  });

  sleep(1);
}
