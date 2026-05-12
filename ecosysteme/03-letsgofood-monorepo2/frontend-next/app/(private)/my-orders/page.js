import MyOrdersClient from '@/components/orders/MyOrdersClient';

export const metadata = {
  title: 'Mes commandes',
  robots: { index: false, follow: false },
};

export default function MyOrdersPage() {
  return <MyOrdersClient />;
}
