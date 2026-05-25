
import { auth } from '../lib/firebase';

const API_BASE = '/api';

async function getAuthHeaders() {
  const token = await auth.currentUser?.getIdToken();
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  };
}

export const OrderApiService = {
  async createOrder(orderData: any) {
    const headers = await getAuthHeaders();
    const response = await fetch(`${API_BASE}/orders`, {
      method: 'POST',
      headers,
      body: JSON.stringify(orderData)
    });
    if (!response.ok) throw new Error('Order creation failed');
    return response.json();
  },

  async updateOrderStatus(orderId: string, status: string) {
    const headers = await getAuthHeaders();
    const response = await fetch(`${API_BASE}/merchant/orders/${orderId}/status`, {
      method: 'PATCH',
      headers,
      body: JSON.stringify({ status })
    });
    if (!response.ok) throw new Error('Status update failed');
    return response.json();
  },

  async submitRating(ratingData: { orderId: string, restaurantId: string, score: number, feedback?: string }) {
    const headers = await getAuthHeaders();
    const response = await fetch(`${API_BASE}/ratings`, {
      method: 'POST',
      headers,
      body: JSON.stringify(ratingData)
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Rating submission failed');
    }
    return response.json();
  }
};
