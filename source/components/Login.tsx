
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import { Lock, Mail, Loader2, ShieldCheck, Truck } from 'lucide-react';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { loginWithGoogle } = useAuth();
  const navigate = useNavigate();

  const handleGoogleLogin = async (role: string) => {
    setLoading(true);
    setError('');

    try {
      await loginWithGoogle(role);
      if (role === 'merchant') navigate('/merchant');
      else if (role === 'driver') navigate('/driver');
      else navigate('/app');
    } catch (err: any) {
      setError('Connexion échouée : ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#08090a] flex items-center justify-center p-6 relative overflow-hidden">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#ff385c]/5 rounded-full blur-[100px]" />
      
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass w-full max-w-md p-12 rounded-[2.5rem]"
      >
        <div className="text-center mb-10">
          <div className="w-16 h-16 bg-[#ff385c]/10 rounded-2xl flex items-center justify-center mx-auto mb-6 border border-[#ff385c]/20">
            <Lock className="w-8 h-8 text-[#ff385c]" />
          </div>
          <h1 className="text-3xl font-black italic tracking-tighter">PORTAIL ECO-SYSTEM</h1>
          <p className="text-white/30 text-[10px] font-black tracking-[0.3em] uppercase mt-2">LetsGoFood Unified</p>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-500 p-4 rounded-xl text-xs font-bold mb-8 text-center ring-1 ring-red-500/30">
            {error}
          </div>
        )}

        <div className="space-y-4">
          <button 
            onClick={() => handleGoogleLogin('merchant')}
            disabled={loading}
            className="w-full h-14 bg-white text-black font-black italic rounded-2xl flex items-center justify-center gap-3 hover:bg-white/90 disabled:opacity-50 transition-all font-sans"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <ShieldCheck className="w-5 h-5" />}
            ESPACE RESTAURATEUR
          </button>

          <button 
            onClick={() => handleGoogleLogin('driver')}
            disabled={loading}
            className="w-full h-14 bg-white/5 border border-white/10 text-white font-black italic rounded-2xl flex items-center justify-center gap-3 hover:bg-white/10 disabled:opacity-50 transition-all font-sans"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Truck className="w-5 h-5" />}
            PORTAIL LIVREUR
          </button>

          <button 
            onClick={() => handleGoogleLogin('client')}
            disabled={loading}
            className="w-full h-14 bg-white/5 border border-white/10 text-white/50 font-bold rounded-2xl flex items-center justify-center gap-3 hover:bg-white/10 disabled:opacity-50 transition-all font-sans text-xs"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Mail className="w-5 h-5" />}
            ACCÈS CLIENT
          </button>
        </div>

        <div className="mt-12 flex items-center justify-center gap-2 text-white/20">
          <ShieldCheck className="w-3 h-3" />
          <span className="text-[10px] font-black tracking-widest">TLS 1.3 ENCRYPTED</span>
        </div>
      </motion.div>
    </div>
  );
}
