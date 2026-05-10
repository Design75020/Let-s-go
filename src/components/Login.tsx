import React, { useState } from 'react';
import { Lock, ArrowLeft, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  const from = location.state?.from?.pathname || '/admin';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Login failed');
      }

      login(data.token, data.user);
      navigate(from, { replace: true });
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6 text-[#08090a]">
      <div className="max-w-md w-full space-y-12 text-center">
        {/* Lock Icon */}
        <motion.div 
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="flex justify-center"
        >
          <div className="w-20 h-20 rounded-2xl bg-[#ffedeb] flex items-center justify-center">
            <Lock className="w-10 h-10 text-[#ff4b3e]" />
          </div>
        </motion.div>

        {/* Title */}
        <div className="space-y-4">
          <h1 className="text-4xl md:text-5xl font-black italic tracking-tighter uppercase leading-none">
            ACCÈS <span className="text-[#ff4b3e]">RESTREINT</span>
          </h1>
          <p className="text-[#08090a]/40 text-sm font-medium tracking-tight uppercase max-w-[280px] mx-auto leading-tight">
            Connectez-vous pour débloquer votre accès sécurisé.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4 text-left">
          <AnimatePresence mode="wait">
            {error && (
              <motion.div 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="p-3 bg-red-50 border border-red-100 text-red-600 text-xs rounded-lg font-medium mb-4"
              >
                {error}
              </motion.div>
            )}
          </AnimatePresence>

          <div>
             <label className="text-[10px] font-bold text-[#08090a]/30 uppercase tracking-[0.2em] ml-2 mb-1 block">IDENTIFIANT</label>
             <input
               type="email"
               value={email}
               onChange={(e) => setEmail(e.target.value)}
               placeholder="ADMIN@LETSGOFOOD.FR"
               className="w-full bg-[#f8f9fa] border border-[#f0f1f3] rounded-xl px-5 py-4 text-sm font-medium focus:ring-2 focus:ring-[#ff4b3e]/20 focus:border-[#ff4b3e] outline-none transition-all placeholder:text-[#08090a]/20 uppercase tracking-widest"
               required
             />
          </div>

          <div>
             <label className="text-[10px] font-bold text-[#08090a]/30 uppercase tracking-[0.2em] ml-2 mb-1 block">MOT DE PASSE</label>
             <input
               type="password"
               value={password}
               onChange={(e) => setPassword(e.target.value)}
               placeholder="••••••••"
               className="w-full bg-[#f8f9fa] border border-[#f0f1f3] rounded-xl px-5 py-4 text-sm font-medium focus:ring-2 focus:ring-[#ff4b3e]/20 focus:border-[#ff4b3e] outline-none transition-all placeholder:text-[#08090a]/20 tracking-widest"
               required
             />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-[#08090a] text-white py-5 rounded-xl font-bold uppercase tracking-widest flex items-center justify-center gap-3 hover:bg-[#1a1c1e] active:scale-[0.98] transition-all disabled:opacity-50 mt-4"
          >
            {isLoading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <>
                <Lock className="w-4 h-4 ml-1" />
                Se connecter
              </>
            )}
          </button>

          <div className="pt-6">
             <button 
                type="button"
                onClick={() => {
                  setEmail('admin@letsgofood.fr');
                  setPassword('admin123');
                }}
                className="w-full py-3 border border-dashed border-[#08090a]/10 rounded-xl text-[10px] font-bold text-[#08090a]/40 uppercase tracking-widest hover:bg-emerald-50 hover:border-emerald-200 hover:text-emerald-600 transition-all"
             >
                Utiliser les identifiants de démo
             </button>
          </div>
        </form>

        {/* Back Link */}
        <Link 
          to="/" 
          className="inline-flex items-center gap-2 text-[10px] font-bold text-[#08090a]/30 uppercase tracking-[0.2em] hover:text-[#08090a] transition-colors group"
        >
          <ArrowLeft className="w-3 h-3 group-hover:-translate-x-1 transition-transform" />
          Retour au portail
        </Link>
      </div>
    </div>
  );
}
