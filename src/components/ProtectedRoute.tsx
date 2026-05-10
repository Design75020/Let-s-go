import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { token, status, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#08090a] flex flex-col items-center justify-center gap-4">
        <div className="w-8 h-8 border-4 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin"></div>
        <span className="text-[10px] font-mono text-white/20 uppercase tracking-[0.3em]">Synchro Sécurisée...</span>
      </div>
    );
  }

  if (status === 'UNAUTHENTICATED' || !token) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
}
