'use client';
import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { User, Mail, Phone, MapPin, LogOut, Loader2, ShieldCheck } from 'lucide-react';
import { toast } from 'sonner';
import api, { formatApiError } from '@/lib/api';

const ROLE_LABELS = { client: 'Client', admin: 'Administrateur', owner: 'Restaurateur', driver: 'Livreur' };
const ROLE_COLORS = { client: '#FF6B00', admin: '#EF4444', owner: '#8B5CF6', driver: '#3B82F6' };

export default function ProfileClient() {
  const { user, logout, setUser } = useAuth();
  const router = useRouter();
  const [form, setForm] = useState({ name: user?.name || '', phone: user?.phone || '', address: user?.address || '' });
  const [loading, setLoading] = useState(false);

  const handleSave = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await api.put('/users/me', form);
      setUser(data);
      toast.success('Profil mis à jour !');
    } catch (err) {
      toast.error(formatApiError(err?.response?.data?.detail) || 'Erreur lors de la mise à jour.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  if (!user) return null;
  const roleColor = ROLE_COLORS[user.role] || '#FF6B00';

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8">
      <h1 className="text-3xl font-bold mb-8" style={{ fontFamily: 'Outfit' }}>Mon profil</h1>

      {/* Avatar card */}
      <div className="bg-white rounded-2xl border border-border p-6 mb-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-white text-2xl font-bold"
            style={{ backgroundColor: roleColor }}>
            {user.name?.charAt(0)?.toUpperCase() || '?'}
          </div>
          <div>
            <h2 className="text-xl font-bold" style={{ fontFamily: 'Outfit' }}>{user.name}</h2>
            <p className="text-sm text-muted-foreground">{user.email}</p>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium mt-1"
              style={{ backgroundColor: `${roleColor}15`, color: roleColor }}>
              <ShieldCheck className="w-3 h-3" />{ROLE_LABELS[user.role] || user.role}
            </span>
          </div>
        </div>
      </div>

      {/* Edit form */}
      <div className="bg-white rounded-2xl border border-border p-6 mb-6">
        <h3 className="text-lg font-semibold mb-4" style={{ fontFamily: 'Outfit' }}>Informations personnelles</h3>
        <form onSubmit={handleSave} className="space-y-4">
          {[
            { name: 'name', label: 'Nom complet', icon: User, type: 'text' },
            { name: 'phone', label: 'Téléphone', icon: Phone, type: 'tel' },
            { name: 'address', label: 'Adresse de livraison', icon: MapPin, type: 'text' },
          ].map(({ name, label, icon: Icon, type }) => (
            <div key={name}>
              <label className="block text-sm font-medium mb-1.5">{label}</label>
              <div className="relative">
                <Icon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type={type}
                  value={form[name]}
                  onChange={(e) => setForm((prev) => ({ ...prev, [name]: e.target.value }))}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-border focus:outline-none focus:ring-2 focus:ring-[#FF6B00]/30 text-sm"
                />
              </div>
            </div>
          ))}
          <button
            type="submit"
            disabled={loading}
            className="flex items-center gap-2 bg-[#FF6B00] hover:bg-[#E05E00] text-white font-semibold px-5 py-2.5 rounded-xl transition-colors disabled:opacity-60"
          >
            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
            Enregistrer
          </button>
        </form>
      </div>

      {/* Logout */}
      <button
        onClick={handleLogout}
        className="flex items-center gap-2 text-sm text-destructive hover:bg-destructive/10 px-4 py-2.5 rounded-xl transition-colors"
      >
        <LogOut className="w-4 h-4" />Se déconnecter
      </button>
    </div>
  );
}
