import AuthProviders from '@/components/providers/AuthProviders';

export default function AuthLayout({ children }) {
  return (
    <AuthProviders>
      <div className="min-h-screen bg-background">
        {children}
      </div>
    </AuthProviders>
  );
}
