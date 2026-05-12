
import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import LandingPage from './components/LandingPage';
import Login from './components/Login';
import ProtectedRoute from './components/ProtectedRoute';
import MerchantPortal from './components/MerchantPortal';
import DriverApp from './components/DriverApp';
import ClientStore from './components/ClientStore';
import AdminPortal from './components/AdminPortal';

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<Login />} />
          
          {/* Marketplace / Client */}
          <Route path="/app" element={
            <ProtectedRoute>
              <ClientStore />
            </ProtectedRoute>
          } />
          
          {/* Merchant Portal */}
          <Route path="/merchant/*" element={
            <ProtectedRoute>
              <MerchantPortal />
            </ProtectedRoute>
          } />
          
          {/* Driver App */}
          <Route path="/driver/*" element={
            <ProtectedRoute>
              <DriverApp />
            </ProtectedRoute>
          } />

          {/* Admin / SaaS Control Tower */}
          <Route path="/admin/*" element={
            <ProtectedRoute>
              <AdminPortal />
            </ProtectedRoute>
          } />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
