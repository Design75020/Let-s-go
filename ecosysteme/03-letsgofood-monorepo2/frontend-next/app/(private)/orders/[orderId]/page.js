import OrderTrackingClient from '@/components/orders/OrderTrackingClient';

export const metadata = {
  title: 'Suivi de commande',
  robots: { index: false, follow: false },
};

export default function OrderTrackingPage({ params }) {
  return <OrderTrackingClient orderId={params.orderId} />;
}
