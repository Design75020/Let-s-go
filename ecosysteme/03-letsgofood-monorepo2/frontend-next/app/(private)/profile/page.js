import ProfileClient from '@/components/profile/ProfileClient';

export const metadata = {
  title: 'Mon profil',
  robots: { index: false, follow: false },
};

export default function ProfilePage() {
  return <ProfileClient />;
}
