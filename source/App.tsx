
import React, { useMemo, useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { AuthProvider } from './context/AuthContext';
import LandingPage from './components/LandingPage';
import Login from './components/Login';
import ProtectedRoute from './components/ProtectedRoute';
import MerchantPortal from './components/MerchantPortal';
import DriverApp from './components/DriverApp';
import ClientStore from './components/ClientStore';
import OrderTracking from './components/OrderTracking';
import AdminPortal from './components/AdminPortal';
import DevLaunchpad from './components/DevLaunchpad';
import DevAgentDashboard from './components/DevAgentDashboard';

const LoadingScreen = () => (
  <div className="min-h-screen bg-[#08090a] flex items-center justify-center">
    <div className="flex flex-col items-center gap-4">
      <Loader2 className="w-10 h-10 text-emerald-500 animate-spin" />
      <p className="text-white/40 text-[10px] font-black uppercase tracking-[0.3em] animate-pulse">Initializing Kernel...</p>
    </div>
  </div>
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

export default function App() {
  const [isLoading, setIsLoading] = useState(true);
  const hostname = window.location.hostname;
  const searchParams = new URLSearchParams(window.location.search);
  const viewParam = searchParams.get('view');

  useEffect(() => {
    // Artificial small delay to ensure determination is clean
    const timer = setTimeout(() => setIsLoading(false), 800);
    return () => clearTimeout(timer);
  }, []);

  const AppContent = useMemo(() => {
    if (isLoading) return <LoadingScreen />;
    // If we have a ?view=Param, override hostname logic for development/preview
    if (viewParam) {
      switch (viewParam) {
        case 'landing': return <LandingPage />;
        case 'app': return <ProtectedRoute><ClientStore /></ProtectedRoute>;
        case 'merchant': return <ProtectedRoute><MerchantPortal /></ProtectedRoute>;
        case 'driver': return <ProtectedRoute><DriverApp /></ProtectedRoute>;
        case 'admin': return <ProtectedRoute><AdminPortal /></ProtectedRoute>;
        case 'agent': return <ProtectedRoute><DevAgentDashboard /></ProtectedRoute>;
        case 'dev': return <DevLaunchpad />;
      }
    }

    // Production & Staging mapping
    switch (hostname) {
      case 'letsgofood.fr':
        return <LandingPage />;
      
      case 'app.letsgofood.fr':
        return (
          <ProtectedRoute>
            <ClientStore />
          </ProtectedRoute>
        );

      case 'merchant.letsgofood.fr':
        return (
          <ProtectedRoute>
            <MerchantPortal />
          </ProtectedRoute>
        );

      case 'driver.letsgofood.fr':
        return (
          <ProtectedRoute>
            <DriverApp />
          </ProtectedRoute>
        );

      case 'admin.letsgofood.fr':
      case 'saas.letsgofood.fr':
      case 'crm.letsgofood.fr':
        return (
          <ProtectedRoute>
            <AdminPortal />
          </ProtectedRoute>
        );

      // Local development fallback
      case 'localhost':
      case '127.0.0.1':
      default:
        // Handle AIS preview URLs or unknown domains
        return (
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<Login />} />
            <Route path="/app" element={<ProtectedRoute><ClientStore /></ProtectedRoute>} />
            <Route path="/tracking/:id" element={<ProtectedRoute><OrderTracking /></ProtectedRoute>} />
            <Route path="/merchant/*" element={<ProtectedRoute><MerchantPortal /></ProtectedRoute>} />
            <Route path="/driver/*" element={<ProtectedRoute><DriverApp /></ProtectedRoute>} />
            <Route path="/admin/*" element={<ProtectedRoute><AdminPortal /></ProtectedRoute>} />
            <Route path="/agent" element={<ProtectedRoute><DevAgentDashboard /></ProtectedRoute>} />
            <Route path="/dev" element={<DevLaunchpad />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        );
    }
  }, [hostname, viewParam]);

  return (
    <AuthProvider>
      <BrowserRouter>
        {AppContent}
      </BrowserRouter>
    </AuthProvider>
  );
}
