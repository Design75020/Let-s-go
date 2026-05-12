import PublicProviders from '@/components/providers/PublicProviders';
import ClientNav from '@/components/layout/ClientNav';

export default function PublicLayout({ children }) {
  return (
    <PublicProviders>
      <ClientNav />
      <main className="pt-[72px] min-h-screen bg-background">
        {children}
      </main>
    </PublicProviders>
  );
}
