
import { adminDb } from '../firebaseAdmin';

export class RatingService {
  static async submitRating(ratingData: {
    orderId: string;
    restaurantId: string;
    clientId: string;
    score: number;
    feedback?: string;
  }) {
    const { orderId, restaurantId, clientId, score, feedback } = ratingData;

    // 1. Check if rating already exists for this order
    const existingRating = await adminDb.collection('ratings')
      .where('orderId', '==', orderId)
      .limit(1)
      .get();

    if (!existingRating.empty) {
      throw new Error('This order has already been rated');
    }

    // 2. Save the rating
    const rating = {
      orderId,
      restaurantId,
      clientId,
      score,
      feedback: feedback || "",
      createdAt: new Date()
    };

    await adminDb.collection('ratings').add(rating);

    // 2.5 Mark the order as rated to prevent multiple UI triggers
    await adminDb.collection('orders').doc(orderId).update({ rated: true });

    // 3. Update restaurant aggregate rating
    const restaurantRef = adminDb.collection('restaurants').doc(restaurantId);
    await adminDb.runTransaction(async (transaction) => {
      const restaurantDoc = await transaction.get(restaurantRef);
      if (!restaurantDoc.exists) {
        throw new Error('Restaurant not found');
      }

      const data = restaurantDoc.data() || {};
      const currentRating = data.rating || 0;
      const currentCount = data.ratingCount || 0;

      const newCount = currentCount + 1;
      const newRating = ((currentRating * currentCount) + score) / newCount;

      transaction.update(restaurantRef, {
        rating: newRating,
        ratingCount: newCount
      });
    });

    return { success: true };
  }
}
