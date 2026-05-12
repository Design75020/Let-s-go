import CartClient from '@/components/cart/CartClient';

export const metadata = {
  title: 'Mon panier',
  robots: { index: false, follow: false },
};

export default function CartPage() {
  return <CartClient />;
}
