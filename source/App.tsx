
import React, { useMemo, useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2 } from 'lucide-react';
import { AuthProvider } from './context/AuthContext';
import { seedDemoData } from './services/seedingService';
import LandingPage from './components/LandingPage';
import Login from './components/Login';
import ProtectedRoute from './components/ProtectedRoute';
import MerchantApp from './apps/merchant/MerchantApp';
import ClientApp from './apps/client/ClientApp';
import AdminApp from './apps/admin/AdminApp';
import SaaSApp from './apps/saas/SaaSApp';
import DriverApp from './apps/driver/DriverApp';
import DevLaunchpad from './components/DevLaunchpad';
import DevAgentDashboard from './components/DevAgentDashboard';
import OrderTracking from './components/OrderTracking';
import OpsDashboard from './components/OpsDashboard';

const LoadingScreen = () => (
  <div className="min-h-screen bg-slate-900 flex items-center justify-center">
    <div className="flex flex-col items-center gap-6">
      <div className="relative">
        <div className="absolute inset-0 bg-[#ff385c]/20 blur-2xl rounded-full scale-150 animate-pulse" />
        <Loader2 className="w-12 h-12 text-[#ff385c] animate-spin relative z-10" />
      </div>
      <p className="text-white/40 text-[10px] font-black uppercase tracking-[0.4em] animate-pulse italic">Kernel_Mapping_Active...</p>
    </div>
  </div>
);

const DevOverlay = () => {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const searchParams = new URLSearchParams(window.location.search);
  
  const switchView = (v: string) => {
    if (v === 'landing') {
      searchParams.delete('view');
      navigate('/' + (searchParams.toString() ? '?' + searchParams.toString() : ''));
    } else {
      searchParams.set('view', v);
      navigate(window.location.pathname + '?' + searchParams.toString());
    }
    setIsOpen(false);
    window.location.reload(); // Force reload to apply view logic
  };

  return (
    <div className="fixed bottom-6 right-6 z-[9999]">
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className="w-14 h-14 bg-slate-900 border border-white/10 text-[#ff385c] rounded-full flex items-center justify-center shadow-2xl shadow-black/50"
      >
        <Loader2 className={`w-6 h-6 ${isOpen ? 'rotate-45' : ''} transition-transform`} />
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="absolute bottom-20 right-0 bg-slate-900 border border-white/10 p-2 rounded-3xl shadow-3xl w-48 overflow-hidden"
          >
            {[
              { id: 'landing', label: 'Landing' },
              { id: 'app', label: 'Client App' },
              { id: 'merchant', label: 'Merchant' },
              { id: 'driver', label: 'Logistics' },
              { id: 'admin', label: 'Admin Hub' },
              { id: 'saas', label: 'Intelligence' },
            ].map((v) => (
              <button
                key={v.id}
                onClick={() => switchView(v.id)}
                className="w-full text-left px-6 py-4 text-[10px] font-black uppercase tracking-widest text-white/40 hover:text-[#ff385c] hover:bg-white/5 transition-all"
              >
                {v.label}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default function App() {
  const [isLoading, setIsLoading] = useState(true);
  const hostname = window.location.hostname;
  const searchParams = new URLSearchParams(window.location.search);
  const viewParam = searchParams.get('view');

  useEffect(() => {
    seedDemoData();
    const timer = setTimeout(() => setIsLoading(false), 800);
    return () => clearTimeout(timer);
  }, []);

  const AppContent = useMemo(() => {
    if (isLoading) return <LoadingScreen />;

    return (
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/dev" element={<DevLaunchpad />} />
        <Route path="/agent" element={<ProtectedRoute><DevAgentDashboard /></ProtectedRoute>} />
        <Route path="/ops" element={<ProtectedRoute><OpsDashboard /></ProtectedRoute>} />
        <Route path="/tracking/:id" element={<ProtectedRoute><OrderTracking /></ProtectedRoute>} />
        
        {/* Unified Application Swichboard based on role/view */}
        {(() => {
          const view = viewParam || hostname.split('.')[0];
          
          switch (view) {
            case 'merchant': return <Route path="/*" element={<ProtectedRoute><MerchantApp /></ProtectedRoute>} />;
            case 'driver': return <Route path="/*" element={<ProtectedRoute><DriverApp /></ProtectedRoute>} />;
            case 'admin': return <Route path="/*" element={<ProtectedRoute><AdminApp /></ProtectedRoute>} />;
            case 'saas': return <Route path="/*" element={<ProtectedRoute><SaaSApp /></ProtectedRoute>} />;
            case 'bi': return <Route path="/*" element={<ProtectedRoute><SaaSApp /></ProtectedRoute>} />;
            case 'app': return <Route path="/*" element={<ProtectedRoute><ClientApp /></ProtectedRoute>} />;
            default: return (
              <>
                <Route path="/" element={<LandingPage />} />
                <Route path="/app" element={<ProtectedRoute><ClientApp /></ProtectedRoute>} />
                <Route path="/merchant/*" element={<ProtectedRoute><MerchantApp /></ProtectedRoute>} />
                <Route path="/driver/*" element={<ProtectedRoute><DriverApp /></ProtectedRoute>} />
                <Route path="/admin/*" element={<ProtectedRoute><AdminApp /></ProtectedRoute>} />
                <Route path="/saas/*" element={<ProtectedRoute><SaaSApp /></ProtectedRoute>} />
                <Route path="*" element={<Navigate to="/" replace />} />
              </>
            );
          }
        })()}
      </Routes>
    );
  }, [hostname, viewParam, isLoading]);

  return (
    <AuthProvider>
      <BrowserRouter>
        {AppContent}
        <DevOverlay />
      </BrowserRouter>
    </AuthProvider>
  );
}
