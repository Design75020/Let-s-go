/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LandingPage from './components/LandingPage';
import Store from './components/Store';
import OrderTracking from './components/OrderTracking';
import Login from './components/Login';
import SaaSDashboard from './components/SaaSDashboard';
import ProtectedRoute from './components/ProtectedRoute';
import { AuthProvider } from './context/AuthContext';
import AdminPanel from './components/AdminPanel';
import CRMPanel from './components/CRMPanel';
import { Loader2 } from 'lucide-react';

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<LandingPage />} />
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
        </Routes>
      </Router>
    </AuthProvider>
  );
}
