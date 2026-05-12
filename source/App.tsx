
import React, { useMemo, Suspense, Component, ErrorInfo, ReactNode } from 'react';
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

const UnauthorizedDomain = () => (
  <div className="min-h-screen bg-[#08090a] text-white flex flex-col items-center justify-center p-6 text-center">
    <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center mb-6">
      <span className="text-4xl">🚫</span>
    </div>
    <h1 className="text-3xl font-black italic mb-2 tracking-tighter">ACCÈS NON AUTORISÉ</h1>
    <p className="text-white/40 max-w-sm font-bold uppercase text-[10px] tracking-widest">
      Ce domaine n'est pas reconnu par le LetsGoFood Kernel.
      Veuillez utiliser un point d'accès officiel.
    </p>
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

export default function App() {
  const hostname = window.location.hostname;

  const AppContent = useMemo(() => {
    // Production & Staging mapping
    switch (hostname) {
      case 'letsgofood.fr':
        return <LandingPage />;
      
      case 'app.letsgofood.fr':
        return (
          <AppContainer>
            <ProtectedRoute><ClientStore /></ProtectedRoute>
          </AppContainer>
        );

      case 'merchant.letsgofood.fr':
        return (
          <AppContainer>
            <ProtectedRoute><MerchantPortal /></ProtectedRoute>
          </AppContainer>
        );

      case 'driver.letsgofood.fr':
        return (
          <AppContainer>
            <ProtectedRoute><DriverApp /></ProtectedRoute>
          </AppContainer>
        );

      case 'admin.letsgofood.fr':
      case 'saas.letsgofood.fr':
      case 'crm.letsgofood.fr':
        return (
          <AppContainer>
            <ProtectedRoute><AdminPortal /></ProtectedRoute>
          </AppContainer>
        );

      // Local development fallback & AIS previews
      case 'localhost':
      case '127.0.0.1':
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
        // Strictly block unknown production domains
        if (hostname.endsWith('.letsgofood.fr')) {
           return <UnauthorizedDomain />;
        }

        // AIS Previews (only allowed if not a .fr domain)
        if (hostname.includes('run.app') || hostname.includes('webcontainer.io') || hostname.includes('bolt.new') || hostname.includes('stackblitz.io')) {
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
        }
        return <UnauthorizedDomain />;
    }
  }, [hostname]);

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
