import { db } from '../lib/firebase';
import { collection, query, where, onSnapshot, doc } from 'firebase/firestore';

export class RealtimeService {
  private static unsubscribers: Map<string, () => void> = new Map();

  static subscribeToOrders(userId: string, role: string, callback: (orders: any[]) => void) {
    const key = `orders-${userId}-${role}`;
    if (this.unsubscribers.has(key)) return;

    let q;
    if (role === 'admin') {
      q = query(collection(db, 'orders'));
    } else if (role === 'merchant') {
      q = query(collection(db, 'orders'), where('restaurantId', '==', userId));
    } else if (role === 'driver') {
      q = query(collection(db, 'orders'), where('driverId', '==', userId));
    } else {
      q = query(collection(db, 'orders'), where('clientId', '==', userId));
    }

    const unsub = onSnapshot(q, (snapshot) => {
      const orders = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
      callback(orders);
    });

    this.unsubscribers.set(key, unsub);
    return unsub;
  }

  static subscribeToOrder(orderId: string, callback: (order: any) => void) {
    const key = `order-${orderId}`;
    if (this.unsubscribers.has(key)) return;

    const unsub = onSnapshot(doc(db, 'orders', orderId), (snapshot) => {
      if (snapshot.exists()) {
        callback({ id: snapshot.id, ...snapshot.data() });
      }
    });

    this.unsubscribers.set(key, unsub);
    return unsub;
  }

  static unsubscribe(key: string) {
    const unsub = this.unsubscribers.get(key);
    if (unsub) {
      unsub();
      this.unsubscribers.delete(key);
    }
  }

  static clearAll() {
    this.unsubscribers.forEach(unsub => unsub());
    this.unsubscribers.clear();
  }
}
