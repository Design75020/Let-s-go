'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { ChefHat, Eye, EyeOff, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { formatApiError } from '@/lib/api';

export default function RegisterClient() {
  const [form, setForm] = useState({ name: '', email: '', password: '', phone: '' });
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const router = useRouter();

  const handleChange = (e) => setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await register(form);
      toast.success('Compte créé avec succès !');
      router.push('/restaurants');
    } catch (err) {
      toast.error(formatApiError(err?.response?.data?.detail) || 'Erreur lors de la création du compte.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-orange-50 to-white">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl brand-bg mb-4">
            <ChefHat className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold brand-text">Let's Go Food</h1>
          <p className="text-muted-foreground mt-2">Créez votre compte gratuitement</p>
        </div>
        <div className="bg-white rounded-2xl border border-border p-8 shadow-sm">
          <form onSubmit={handleSubmit} className="space-y-4">
            {[
              { name: 'name', label: 'Nom complet', type: 'text', placeholder: 'Jean Dupont' },
              { name: 'email', label: 'Email', type: 'email', placeholder: 'vous@exemple.fr' },
              { name: 'phone', label: 'Téléphone', type: 'tel', placeholder: '+33 6 00 00 00 00' },
            ].map((field) => (
              <div key={field.name}>
                <label className="block text-sm font-medium mb-1.5">{field.label}</label>
                <input
                  type={field.type}
                  name={field.name}
                  value={form[field.name]}
                  onChange={handleChange}
                  required={field.name !== 'phone'}
                  placeholder={field.placeholder}
                  className="w-full px-4 py-2.5 rounded-xl border border-border focus:outline-none focus:ring-2 focus:ring-[#FF6B00]/30 text-sm"
                />
              </div>
            ))}
            <div>
              <label className="block text-sm font-medium mb-1.5">Mot de passe</label>
              <div className="relative">
                <input
                  type={showPwd ? 'text' : 'password'}
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  required
                  minLength={6}
                  placeholder="Minimum 6 caractères"
                  className="w-full px-4 py-2.5 pr-10 rounded-xl border border-border focus:outline-none focus:ring-2 focus:ring-[#FF6B00]/30 text-sm"
                />
                <button type="button" onClick={() => setShowPwd(!showPwd)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                  {showPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 bg-[#FF6B00] hover:bg-[#E05E00] text-white font-semibold py-2.5 rounded-xl transition-colors disabled:opacity-60 mt-2"
            >
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              Créer mon compte
            </button>
          </form>
          <p className="text-center text-sm text-muted-foreground mt-6">
            Déjà un compte ?{' '}
            <Link href="/login" className="text-[#FF6B00] font-medium hover:underline">Se connecter</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
