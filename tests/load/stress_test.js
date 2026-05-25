
import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  stages: [
    { duration: '30s', target: 50 },  // Ramp up to 50 users
    { duration: '1m', target: 50 },   // Stay at 50 users
    { duration: '30s', target: 100 }, // Spike to 100 users
    { duration: '1m', target: 100 },  // Stay at 100 users
    { duration: '30s', target: 0 },   // Ramp down
  ],
  thresholds: {
    http_req_duration: ['p(95)<300'], // 95% of requests must be below 300ms
    http_req_failed: ['rate<0.01'],   // Less than 1% failure rate
  },
};

const BASE_URL = __ENV.BASE_URL || 'http://localhost:3000';

export default function () {
  const payload = JSON.stringify({
    userId: `user-${Math.floor(Math.random() * 1000)}`,
    restaurantId: 'rest-1',
    items: [{ id: 'pizza', price: 20 }],
    total: 20,
  });

  const params = {
    headers: {
      'Content-Type': 'application/json',
      'x-correlation-id': `load-test-${Date.now()}`,
    },
  };

  // 1. Create Order
  const res = http.post(`${BASE_URL}/api/orders`, payload, params);
  check(res, {
    'status is 201': (r) => r.status === 201,
  });

  // 2. Poll monitoring endpoint
  const monitorRes = http.get(`${BASE_URL}/api/monitoring`);
  check(monitorRes, {
    'health score is > 50': (r) => JSON.parse(r.body).health_score > 50,
  });

  sleep(1);
}
