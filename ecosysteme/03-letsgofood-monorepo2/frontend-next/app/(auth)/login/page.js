import LoginClient from '@/components/auth/LoginClient';

export const metadata = {
  title: 'Connexion',
  robots: { index: false, follow: false },
};

export default function LoginPage() {
  return <LoginClient />;
}
