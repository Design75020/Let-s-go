import PrivateProviders from '@/components/providers/PrivateProviders';
import ClientNav from '@/components/layout/ClientNav';

export default function PrivateLayout({ children }) {
  return (
    <PrivateProviders>
      <ClientNav />
      <main className="pt-[72px] min-h-screen bg-background">
        {children}
      </main>
    </PrivateProviders>
  );
}
