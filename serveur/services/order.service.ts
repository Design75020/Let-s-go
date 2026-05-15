
import { adminDb } from '../lib/firebase-admin';
import * as admin from 'firebase-admin';

export class OrderService {
  /**
   * Securely places an order after validating items and prices.
   */
  static async placeOrder(orderData: {
    clientId: string;
    clientName: string;
    restaurantId: string;
    restaurantName: string;
    items: any[];
    total: number;
  }) {
    if (!orderData.items || orderData.items.length === 0) {
      throw new Error('Order must contain items');
    }

    // SECURITY: Fetch actual prices from DB to prevent client-side manipulation
    const menuItemsSnap = await adminDb.collection('restaurants').doc(orderData.restaurantId).collection('menuItems').get();
    const priceMap: Record<string, number> = {};
    menuItemsSnap.forEach(doc => {
      priceMap[doc.id] = doc.data().price;
    });

    let calculatedTotal = 0;
    for (const item of orderData.items) {
      const actualPrice = priceMap[item.id];
      if (actualPrice === undefined) throw new Error(`Item ${item.name} not found in menu`);
      calculatedTotal += actualPrice * item.quantity;
    }

    // Add delivery fee (fixed for demo)
    const subtotal = calculatedTotal;
    const finalTotal = subtotal + 2.50;

    if (Math.abs(finalTotal - orderData.total) > 0.01) {
      throw new Error(`Price manipulation detected: expected ${finalTotal}, got ${orderData.total}`);
    }

    return await adminDb.collection('orders').add({
      ...orderData,
      status: 'pending',
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });
  }

  static async addTip(orderId: string, amount: number) {
    const orderRef = adminDb.collection('orders').doc(orderId);
    await orderRef.update({
      tip: admin.firestore.FieldValue.increment(amount),
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });
  }

  /**
   * Updates order status with permission and workflow validation.
   */
  static async updateStatus(orderId: string, newStatus: string, userId: string, role: string) {
    const orderRef = adminDb.collection('orders').doc(orderId);
    const orderSnap = await orderRef.get();

    if (!orderSnap.exists) throw new Error('Order not found');
    const order = orderSnap.data()!;

    // Workflow & Permission Logic
    if (role === 'merchant') {
      const restoSnap = await adminDb.collection('restaurants').doc(order.restaurantId).get();
      if (restoSnap.data()?.ownerId !== userId) throw new Error('Unauthorized');

      const allowedTransitions: Record<string, string[]> = {
        'pending': ['accepted', 'cancelled'],
        'accepted': ['preparing'],
        'preparing': ['ready']
      };

      if (!allowedTransitions[order.status]?.includes(newStatus)) {
        throw new Error(`Invalid status transition from ${order.status} to ${newStatus}`);
      }
    }

    if (role === 'driver') {
      if (newStatus === 'picked_up' && order.status !== 'ready') throw new Error('Order not ready for pickup');
      if (newStatus === 'delivered' && order.status !== 'picked_up') throw new Error('Order not picked up');
    }

    await orderRef.update({
      status: newStatus,
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });
  }
}
