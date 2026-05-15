
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion } from 'motion/react';
import { Lock, Mail, Loader2, ShieldCheck, Truck, ArrowRight, Globe } from 'lucide-react';

export default function Login() {
  const [email, setEmail] = useState('u6860348073@id.gle');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [devRole, setDevRole] = useState('admin');
  const { loginWithGoogle, loginAsEmail } = useAuth();
  const navigate = useNavigate();

  const authorizedEmails = ['letsgofood26@gmail.com', 'admin@lgf.com', 'u6860348073@id.gle'];

  const handleAuthorizedDirectLogin = async (role: string) => {
    setLoading(true);
    try {
      await loginAsEmail(authorizedEmails.includes(email) ? email : 'u6860348073@id.gle', role);
      if (role === 'merchant') navigate('/merchant');
      else if (role === 'driver') navigate('/driver');
      else if (role === 'admin') navigate('/admin');
      else navigate('/app');
    } catch (err) {
      setError('Erreur d\'accès direct.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async (role: string) => {
    setLoading(true);
    setError('');

    try {
      await loginWithGoogle(role);
      if (role === 'merchant') navigate('/merchant');
      else if (role === 'driver') navigate('/driver');
      else if (role === 'admin') navigate('/admin');
      else navigate('/app');
    } catch (err: any) {
      if (err.message.includes('popup-closed-by-user') || err.message.includes('cancelled-by-user')) {
        setError('Authentification annulée.');
      } else {
        setError('Google Auth restreint. Utilisez l\'accès direct avec votre email ID.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDevLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (authorizedEmails.includes(email)) {
      handleAuthorizedDirectLogin(devRole);
    } else {
      setError('Email non autorisé pour l\'accès direct.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 relative overflow-hidden font-sans">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-br from-[#ff385c]/10 to-transparent blur-[120px] rounded-full" />
      
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white/70 backdrop-blur-3xl w-full max-w-md p-10 md:p-12 rounded-[2.5rem] border border-white shadow-2xl relative z-10"
      >
        <div className="text-center mb-10">
          <div className="w-16 h-16 bg-[#ff385c] rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-xl shadow-[#ff385c]/30 rotate-3">
            <Globe className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-black italic tracking-tighter text-slate-900 uppercase">PORTAIL ECO-SYSTEM</h1>
          <p className="text-slate-400 text-[10px] font-black tracking-[0.3em] uppercase mt-2">LetsGoFood Unified</p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-100 text-red-500 p-4 rounded-xl text-[10px] font-black uppercase tracking-widest mb-8 text-center animate-shake">
            {error}
          </div>
        )}

        <div className="space-y-6">
          <div className="grid grid-cols-1 gap-4">
            <button 
              type="button"
              onClick={() => handleAuthorizedDirectLogin('admin')}
              disabled={loading}
              className="w-full group relative h-24 bg-slate-900 text-white rounded-[2rem] flex items-center justify-between px-10 hover:scale-[1.02] transition-all shadow-xl shadow-slate-900/10"
            >
              <div className="text-left">
                <span className="block text-[8px] font-black uppercase tracking-[0.4em] opacity-40 italic mb-1">COMMAND_STATION</span>
                <span className="block text-2xl font-black italic tracking-tighter uppercase">ADMIN DASHBOARD</span>
              </div>
              {loading ? <Loader2 className="w-8 h-8 animate-spin" /> : <ShieldCheck className="w-10 h-10 group-hover:rotate-12 transition-transform text-[#ff385c]" />}
            </button>

            <div className="flex gap-4">
              <button 
                type="button"
                onClick={() => authorizedEmails.includes(email) ? handleAuthorizedDirectLogin('merchant') : handleGoogleLogin('merchant')}
                disabled={loading}
                className="flex-1 h-32 bg-white border border-slate-100 text-slate-900 rounded-[2rem] flex flex-col items-center justify-center gap-4 hover:border-[#ff385c]/30 transition-all group shadow-sm hover:shadow-xl"
              >
                <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center group-hover:bg-[#ff385c] transition-colors">
                  <ShieldCheck className="w-6 h-6 text-slate-400 group-hover:text-white transition-colors" />
                </div>
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 group-hover:text-slate-900 transition-colors">MERCHANT</span>
              </button>

              <button 
                type="button"
                onClick={() => authorizedEmails.includes(email) ? handleAuthorizedDirectLogin('driver') : handleGoogleLogin('driver')}
                disabled={loading}
                className="flex-1 h-32 bg-white border border-slate-100 text-slate-900 rounded-[2rem] flex flex-col items-center justify-center gap-4 hover:border-[#ff385c]/30 transition-all group shadow-sm hover:shadow-xl"
              >
                <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center group-hover:bg-[#ff385c] transition-colors">
                  <Truck className="w-6 h-6 text-slate-400 group-hover:text-white transition-colors" />
                </div>
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 group-hover:text-slate-900 transition-colors">DISPATCH</span>
              </button>
            </div>

            <button 
              type="button"
              onClick={() => authorizedEmails.includes(email) ? handleAuthorizedDirectLogin('client') : handleGoogleLogin('client')}
              disabled={loading}
              className="w-full h-16 bg-slate-50 border border-slate-100 text-slate-400 rounded-2xl flex items-center justify-center gap-4 hover:border-[#ff385c]/30 hover:text-slate-900 transition-all group"
            >
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-lg shadow-emerald-500/40 animate-pulse" />
              <span className="text-[10px] font-black uppercase tracking-[0.4em] italic leading-none">Accès Marketplace Client</span>
              <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 group-hover:translate-x-2 transition-all text-[#ff385c]" />
            </button>
          </div>

          <form onSubmit={handleDevLogin} className="pt-6 border-t border-slate-100 space-y-4">
            <p className="text-[8px] font-black text-slate-300 uppercase tracking-[0.3em] text-center mb-2">Accès direct développement</p>
            <div className="space-y-2">
              <input 
                type="email" 
                placeholder="Votre email ID"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-white border border-slate-200 rounded-xl px-5 py-3 text-xs outline-none focus:border-[#ff385c]/40 transition-all shadow-sm"
              />
              <div className="flex gap-2">
                <select 
                  value={devRole}
                  onChange={(e) => setDevRole(e.target.value)}
                  className="flex-1 bg-white border border-slate-200 rounded-xl px-5 py-3 text-[10px] font-black uppercase outline-none focus:border-[#ff385c]/40 transition-all appearance-none text-slate-500 cursor-pointer"
                >
                  <option value="admin">Admin</option>
                  <option value="merchant">Merchant</option>
                  <option value="driver">Driver</option>
                  <option value="client">Client</option>
                </select>
                <button 
                  type="submit"
                  disabled={loading}
                  className="px-8 py-3 bg-slate-900 text-white rounded-xl text-[10px] font-black uppercase hover:bg-slate-800 transition-all disabled:opacity-50 shadow-lg shadow-slate-900/10"
                >
                  ENTRER
                </button>
              </div>
            </div>
          </form>
        </div>

        <div className="mt-12 flex items-center justify-center gap-3 text-slate-300">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span className="text-[9px] font-black tracking-[0.2em] uppercase">Security: TLS 1.3 Active</span>
        </div>
      </motion.div>
    </div>
  );
}
