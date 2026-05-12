import RegisterClient from '@/components/auth/RegisterClient';

export const metadata = {
  title: 'Créer un compte',
  robots: { index: false, follow: false },
};

export default function RegisterPage() {
  return <RegisterClient />;
}
