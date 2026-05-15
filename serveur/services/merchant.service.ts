
import { adminDb } from '../lib/firebase-admin';
import * as admin from 'firebase-admin';

export class MerchantService {
  static async updateRestaurantStatus(restaurantId: string, status: 'open' | 'closed') {
    const restoRef = adminDb.collection('restaurants').doc(restaurantId);
    await restoRef.update({
      status,
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });
  }

  static async addMenuItem(restaurantId: string, item: any) {
    const res = await adminDb.collection('restaurants').doc(restaurantId).collection('menuItems').add({
      ...item,
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    });
    return res.id;
  }

  static async updateMenuItem(restaurantId: string, itemId: string, item: any) {
    await adminDb.collection('restaurants').doc(restaurantId).collection('menuItems').doc(itemId).update({
      ...item,
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });
  }

  static async deleteMenuItem(restaurantId: string, itemId: string) {
    await adminDb.collection('restaurants').doc(restaurantId).collection('menuItems').doc(itemId).delete();
  }
}
