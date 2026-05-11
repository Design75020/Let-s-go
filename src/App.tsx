/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useMemo, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
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
  
  // Diagnostic log
  console.log(`[LetsGoFood] Dispatching host: ${hostname}`);

  useEffect(() => {
    const updateMetadata = () => {
      switch (hostname) {
        case 'app.letsgofood.fr':
        case 'commande.letsgofood.fr':
          document.title = "LetsGoFood App :: Commande en ligne";
          break;
        case 'letsgofood.fr':
        case 'www.letsgofood.fr':
          document.title = "LetsGoFood :: Plateforme de livraison Halal";
          break;
        case 'merchant.letsgofood.fr':
        case 'marchand.letsgofood.fr':
          document.title = "LetsGoFood :: Portail Commerçant";
          break;
        case 'driver.letsgofood.fr':
        case 'chauffeur.letsgofood.fr':
          document.title = "LetsGoFood :: Portail Chauffeur";
          break;
        default:
          document.title = "LetsGoFood Ecosystem";
      }
    };
    updateMetadata();
  }, [hostname]);

  switch (hostname) {
    case 'app.letsgofood.fr':
    case 'commande.letsgofood.fr':
      return <ClientApp />;

    case 'letsgofood.fr':
    case 'www.letsgofood.fr':
      return <LandingPage />;

    case 'marchand.letsgofood.fr':
    case 'merchant.letsgofood.fr':
      return <Navigate to="/merchant" replace />;

    case 'chauffeur.letsgofood.fr':
    case 'driver.letsgofood.fr':
      return <Navigate to="/driver" replace />;

    case 'admin.letsgofood.fr':
      return <Navigate to="/admin" replace />;

    case 'crm.letsgofood.fr':
    case 'crm-letsgofood.vercel.app': // Variant handling
      return <Navigate to="/crm" replace />;

    case 'saas.letsgofood.fr':
      return <Navigate to="/saas" replace />;

    default:
      // Preview/Dev/Custom domain logic
      const params = new URLSearchParams(window.location.search);
      const view = params.get('view');
      
      if (view === 'landing') return <LandingPage />;
      if (view === 'app') return <ClientApp />;
      if (view === 'merchant') return <Navigate to="/merchant" replace />;
      if (view === 'driver') return <Navigate to="/driver" replace />;
      if (view === 'admin') return <Navigate to="/admin" replace />;
      if (view === 'crm') return <Navigate to="/crm" replace />;
      if (view === 'saas') return <SaaSDashboard />;
      
      // Default fallback in AI Studio preview: Show the Landing Page first to test the ecosystem
      return <LandingPage />;
  }
};

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<DomainDispatcher />} />
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
