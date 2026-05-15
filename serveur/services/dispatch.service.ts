
import { adminDb } from '../lib/firebase-admin';
import * as admin from 'firebase-admin';

export class DispatchService {
  /**
   * Updates driver location and propagates to active order listeners via Firestore.
   */
  static async updateLocation(driverId: string, orderId: string, location: { lat: number; lng: number }) {
    const orderRef = adminDb.collection('orders').doc(orderId);

    await orderRef.update({
      driverLocation: location,
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });
  }

  /**
   * Assigns a driver to an order.
   */
  static async assignDriver(orderId: string, driverId: string, driverName: string) {
    const orderRef = adminDb.collection('orders').doc(orderId);

    await orderRef.update({
      driverId,
      driverName,
      status: 'picked_up',
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });
  }
}
