
import React, { useMemo, Suspense, ReactNode } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import LandingPage from './components/LandingPage';
import Login from './components/Login';
import ProtectedRoute from './components/ProtectedRoute';

const MerchantPortal = React.lazy(() => import('./components/MerchantPortal'));
const DriverApp = React.lazy(() => import('./components/DriverApp'));
const ClientStore = React.lazy(() => import('./components/ClientStore'));
const AdminPortal = React.lazy(() => import('./components/AdminPortal'));

const AppContainer = ({ children }: { children: React.ReactNode }) => (
  <Routes>
    <Route path="/login" element={<Login />} />
    <Route path="/*" element={children} />
  </Routes>
);

const UnauthorizedDomain = ({ hostname }: { hostname: string }) => (
  <div className="min-h-screen bg-[#08090a] text-white flex flex-col items-center justify-center p-6 text-center">
    <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center mb-6">
      <span className="text-4xl">🚫</span>
    </div>
    <h1 className="text-3xl font-black italic mb-2 tracking-tighter uppercase">Domaine non reconnu</h1>
    <p className="text-white/40 max-w-sm font-bold uppercase text-[10px] tracking-widest mb-8">
      Le domaine <span className="text-[#ff385c]">{hostname}</span> n'est pas configuré dans le LetsGoFood Kernel.
    </p>
    <a href="https://letsgofood.fr" className="px-8 py-3 bg-white/5 border border-white/10 rounded-full text-[10px] font-black uppercase tracking-widest hover:bg-white/10 transition-all">
      Retour au portail officiel
    </a>
  </div>
);

const ErrorBoundary = ({ children }: { children: ReactNode }) => {
  const [hasError, setHasError] = React.useState(false);

  React.useEffect(() => {
    const handleError = (error: ErrorEvent) => {
      console.error("ErrorBoundary caught an error:", error);
      setHasError(true);
    };
    window.addEventListener('error', handleError);
    return () => window.removeEventListener('error', handleError);
  }, []);

  if (hasError) {
    return (
      <div className="min-h-screen bg-[#08090a] text-white flex flex-col items-center justify-center p-6 text-center">
        <h1 className="text-2xl font-bold mb-4">Une erreur est survenue</h1>
        <button
          onClick={() => window.location.reload()}
          className="px-6 py-2 bg-[#ff385c] rounded-full font-bold"
        >
          Recharger la page
        </button>
      </div>
    );
  }
  return <>{children}</>;
};

/**
 * Robust Hostname Normalizer for Multi-Tenant Routing
 */
function getAppType(hostname: string): string {
  // 1. Remove 'www.' prefix
  let host = hostname.toLowerCase().replace(/^www\./, '');

  // 2. Localhost & Dev tools
  if (host === 'localhost' || host === '127.0.0.1' || host.includes('webcontainer.io') || host.includes('stackblitz.io') || host.includes('bolt.new')) {
    return 'development';
  }

  // 3. Vercel Previews
  if (host.includes('vercel.app')) {
    return 'development';
  }

  // 4. Production Subdomains
  if (host === 'letsgofood.fr') return 'landing';
  if (host === 'app.letsgofood.fr') return 'client';
  if (host === 'merchant.letsgofood.fr') return 'merchant';
  if (host === 'driver.letsgofood.fr') return 'driver';
  if (host === 'admin.letsgofood.fr' || host === 'saas.letsgofood.fr' || host === 'crm.letsgofood.fr') return 'admin';

  return 'unauthorized';
}

export default function App() {
  const hostname = window.location.hostname;
  const appType = useMemo(() => getAppType(hostname), [hostname]);

  const AppContent = useMemo(() => {
    console.log(`[ROUTING] Detected Hostname: ${hostname} | App Type: ${appType}`);

    switch (appType) {
      case 'landing':
        return <LandingPage />;
      
      case 'client':
        return (
          <AppContainer>
            <ProtectedRoute><ClientStore /></ProtectedRoute>
          </AppContainer>
        );

      case 'merchant':
        return (
          <AppContainer>
            <ProtectedRoute><MerchantPortal /></ProtectedRoute>
          </AppContainer>
        );

      case 'driver':
        return (
          <AppContainer>
            <ProtectedRoute><DriverApp /></ProtectedRoute>
          </AppContainer>
        );

      case 'admin':
        return (
          <AppContainer>
            <ProtectedRoute><AdminPortal /></ProtectedRoute>
          </AppContainer>
        );

      case 'development':
        return (
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<Login />} />
            <Route path="/app" element={<ProtectedRoute><ClientStore /></ProtectedRoute>} />
            <Route path="/merchant/*" element={<ProtectedRoute><MerchantPortal /></ProtectedRoute>} />
            <Route path="/driver/*" element={<ProtectedRoute><DriverApp /></ProtectedRoute>} />
            <Route path="/admin/*" element={<ProtectedRoute><AdminPortal /></ProtectedRoute>} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        );

      default:
        return <UnauthorizedDomain hostname={hostname} />;
    }
  }, [appType, hostname]);

  return (
    <ErrorBoundary>
      <AuthProvider>
        <BrowserRouter>
          <Suspense fallback={
            <div className="min-h-screen bg-[#08090a] flex items-center justify-center">
              <div className="w-8 h-8 border-4 border-[#ff385c] border-t-transparent rounded-full animate-spin" />
            </div>
          }>
            {AppContent}
          </Suspense>
        </BrowserRouter>
      </AuthProvider>
    </ErrorBoundary>
  );
}
