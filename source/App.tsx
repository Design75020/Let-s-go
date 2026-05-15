
import React, { useMemo, useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { AuthProvider } from './context/AuthContext';
import { seedDemoData } from './services/seedingService';
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
  <div className="min-h-screen bg-white flex items-center justify-center">
    <div className="flex flex-col items-center gap-6">
      <div className="relative">
        <div className="absolute inset-0 bg-[#ff385c]/10 blur-xl rounded-full scale-150 animate-pulse" />
        <Loader2 className="w-12 h-12 text-[#ff385c] animate-spin relative z-10" />
      </div>
      <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.4em] animate-pulse italic">Determination_du_point_acces...</p>
    </div>
  </div>
);

const UnauthorizedDomain = () => (
  <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col items-center justify-center p-8 text-center">
    <div className="w-24 h-24 bg-red-50 rounded-[2.5rem] flex items-center justify-center mb-8 border border-red-100 shadow-sm">
      <span className="text-5xl">🛑</span>
    </div>
    <h1 className="text-4xl font-black italic mb-4 tracking-tighter uppercase leading-none">Accès Interdit</h1>
    <p className="text-slate-400 max-w-sm font-black uppercase text-[10px] tracking-widest italic leading-relaxed">
      Ce point d'entrée n'est pas autorisé par le Kernel Hub.<br/>Veuillez contacter l'administrateur système.
    </p>
  </div>
);

export default function App() {
  const [isLoading, setIsLoading] = useState(true);
  const hostname = window.location.hostname;
  const searchParams = new URLSearchParams(window.location.search);
  const viewParam = searchParams.get('view');

  useEffect(() => {
    seedDemoData();
    // Artificial small delay to ensure determination is clean
    const timer = setTimeout(() => setIsLoading(false), 800);
    return () => clearTimeout(timer);
  }, []);

  const AppContent = useMemo(() => {
    if (isLoading) return <LoadingScreen />;

    return (
      <Routes>
        {/* Global Routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/dev" element={<DevLaunchpad />} />
        <Route path="/agent" element={<ProtectedRoute><DevAgentDashboard /></ProtectedRoute>} />
        <Route path="/tracking/:id" element={<ProtectedRoute><OrderTracking /></ProtectedRoute>} />

        {/* Hostname/View Dependent Routes */}
        {(() => {
          // Priority 1: View Param (for testing/preview)
          if (viewParam) {
            switch (viewParam) {
              case 'app': return <Route path="/*" element={<ProtectedRoute><ClientStore /></ProtectedRoute>} />;
              case 'merchant': return <Route path="/*" element={<ProtectedRoute><MerchantPortal /></ProtectedRoute>} />;
              case 'driver': return <Route path="/*" element={<ProtectedRoute><DriverApp /></ProtectedRoute>} />;
              case 'admin': return <Route path="/*" element={<ProtectedRoute><AdminPortal /></ProtectedRoute>} />;
              default: return <Route path="/*" element={<LandingPage />} />;
            }
          }

          // Priority 2: Production Hostname Mapping
          if (hostname === 'app.letsgofood.fr') return <Route path="/*" element={<ProtectedRoute><ClientStore /></ProtectedRoute>} />;
          if (hostname === 'merchant.letsgofood.fr') return <Route path="/*" element={<ProtectedRoute><MerchantPortal /></ProtectedRoute>} />;
          if (hostname === 'driver.letsgofood.fr') return <Route path="/*" element={<ProtectedRoute><DriverApp /></ProtectedRoute>} />;
          if (['admin.letsgofood.fr', 'saas.letsgofood.fr', 'crm.letsgofood.fr'].includes(hostname)) {
             return <Route path="/*" element={<ProtectedRoute><AdminPortal /></ProtectedRoute>} />;
          }

          // Priority 3: Default Layout (Discovery / Localhost)
          return (
            <>
              <Route path="/" element={<LandingPage />} />
              <Route path="/app" element={<ProtectedRoute><ClientStore /></ProtectedRoute>} />
              <Route path="/merchant/*" element={<ProtectedRoute><MerchantPortal /></ProtectedRoute>} />
              <Route path="/driver/*" element={<ProtectedRoute><DriverApp /></ProtectedRoute>} />
              <Route path="/admin/*" element={<ProtectedRoute><AdminPortal /></ProtectedRoute>} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </>
          );
        })()}
      </Routes>
    );
  }, [hostname, viewParam, isLoading]);

  return (
    <AuthProvider>
      <BrowserRouter>
        {AppContent}
      </BrowserRouter>
    </AuthProvider>
  );
}
