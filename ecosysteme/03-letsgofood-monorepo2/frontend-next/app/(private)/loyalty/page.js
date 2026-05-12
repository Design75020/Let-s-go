import LoyaltyClient from '@/components/loyalty/LoyaltyClient';

export const metadata = {
  title: 'Programme fidélité',
  robots: { index: false, follow: false },
};

export default function LoyaltyPage() {
  return <LoyaltyClient />;
}
