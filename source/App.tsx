/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useMemo, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useSearchParams } from 'react-router-dom';
import LandingPage from './components/LandingPage';
import ClientApp from './components/ClientApp';
import Store from './components/Store';
import OrderTracking from './components/OrderTracking';
import Login from './components/Login';
import SaaSDashboard from './components/SaaSDashboard';
import ProtectedRoute from './components/ProtectedRoute';
import { AuthProvider } from './context/AuthContext';
import AdminPanel from './components/AdminPanel';
import CRMPanel from './components/CRMPanel';
import { Loader2 } from 'lucide-react';

/**
 * Domain-based Dispatcher (SaaS Industrial Mode)
 * Enforces strict isolation between Acquisition, Product, and Ops layers.
 */
const DomainDispatcher = () => {
  const hostname = window.location.hostname.toLowerCase();
  const [searchParams] = useSearchParams();
  const view = searchParams.get('view');
  
  // Diagnostic log
  console.log(`[LetsGoFood] Dispatching host: ${hostname}, view: ${view}`);

  useEffect(() => {
    const updateMetadata = () => {
      let title = "LetsGoFood Ecosystem";
      if (hostname.includes('app') || view === 'app') title = "LetsGoFood App :: Commande en ligne";
      else if (hostname.includes('www') || view === 'landing' || !view) title = "LetsGoFood :: Plateforme de livraison Halal";
      else if (hostname.includes('merchant') || view === 'merchant') title = "LetsGoFood :: Portail Commerçant";
      else if (hostname.includes('driver') || view === 'driver') title = "LetsGoFood :: Portail Chauffeur";
      
      document.title = title;
    };
    updateMetadata();
  }, [hostname, view]);

  // Priority 1: Production Multi-Domain Routing
  if (hostname === 'app.letsgofood.fr' || hostname === 'commande.letsgofood.fr') return <ClientApp />;
  if (hostname === 'letsgofood.fr' || hostname === 'www.letsgofood.fr') return <LandingPage />;
  if (hostname === 'marchand.letsgofood.fr' || hostname === 'merchant.letsgofood.fr') return <Navigate to="/merchant" replace />;
  if (hostname === 'chauffeur.letsgofood.fr' || hostname === 'driver.letsgofood.fr') return <Navigate to="/driver" replace />;
  if (hostname === 'admin.letsgofood.fr') return <Navigate to="/admin" replace />;
  if (hostname === 'saas.letsgofood.fr') return <Navigate to="/saas" replace />;

  // Priority 2: Preview Mode Query Parameter Routing
  if (view === 'landing') return <LandingPage />;
  if (view === 'app') return <ClientApp />;
  if (view === 'merchant') return <Navigate to="/merchant" replace />;
  if (view === 'driver') return <Navigate to="/driver" replace />;
  if (view === 'admin') return <Navigate to="/admin" replace />;
  if (view === 'crm') return <Navigate to="/crm" replace />;
  if (view === 'saas') return <SaaSDashboard />;

  // Fallback: Default to Landing Page
  return <LandingPage />;
};

/**
 * Stabilized Dispatcher Wrapper
 * Prevents "removeChild" errors by giving React a clear identity for the root component
 */
const StabilizedDispatcher = () => {
  const [searchParams] = useSearchParams();
  const view = searchParams.get('view') || 'default';
  const hostname = window.location.hostname.toLowerCase();
  
  return (
    <div key={`lgf-root-${hostname}-${view}`} className="min-h-screen bg-[#08090a]">
      <DomainDispatcher />
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<StabilizedDispatcher />} />
          <Route path="/login" element={<Login />} />
          
          {/* Ecosystem Modules */}
          <Route path="/merchant" element={<ProtectedRoute><div className="min-h-screen bg-[#08090a] flex flex-col items-center justify-center text-white font-mono uppercase tracking-[0.2em] gap-4"><Loader2 className="w-8 h-8 animate-spin text-emerald-500" /> MERCHANT INTERFACE :: SYNCING...</div></ProtectedRoute>} />
          <Route path="/driver" element={<ProtectedRoute><div className="min-h-screen bg-[#08090a] flex flex-col items-center justify-center text-white font-mono uppercase tracking-[0.2em] gap-4"><Loader2 className="w-8 h-8 animate-spin text-emerald-500" /> DRIVER DISPATCH :: GPS READY</div></ProtectedRoute>} />
          <Route 
            path="/crm" 
            element={
              <ProtectedRoute>
                <CRMPanel />
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/saas" 
            element={
              <ProtectedRoute>
                <SaaSDashboard />
              </ProtectedRoute>
            } 
          />

          <Route 
            path="/admin" 
            element={
              <ProtectedRoute>
                <AdminPanel />
              </ProtectedRoute>
            } 
          />

          <Route path="/store/:id" element={<Store />} />
          <Route path="/track/:id" element={<OrderTracking />} />
          
          {/* Universal Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}
