import { useState } from "react";
import { useNavigate, Navigate } from "react-router-dom";
import { api, getUser, setUser } from "../lib/api.js";
import { LogIn, AlertCircle, Lock } from "lucide-react";

export default function Login() {
  const nav = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);

  if (getUser()) return <Navigate to="/" replace />;

  const submit = async (e) => {
    e.preventDefault();
    setErr("");
    setLoading(true);
    try {
      const res = await api.login(email.trim(), password);
      if (res.role !== "admin") {
        setErr("Accès réservé aux administrateurs.");
        setLoading(false);
        return;
      }
      // httpOnly cookies are set by the backend — we only cache the user profile
      setUser({ id: res.id, email: res.email, name: res.name, role: res.role });
      nav("/");
    } catch (e) {
      setErr(e.message || "Identifiants invalides.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-brand-ink">
      <div className="w-full max-w-sm bg-white border border-brand-border shadow-xl p-8">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-lg bg-brand-ink flex items-center justify-center">
            <span className="text-brand-orange font-extrabold text-sm">CRM</span>
          </div>
          <div>
            <p className="font-extrabold text-brand-ink leading-none">
              Let's <span className="text-brand-orange">Go</span>
            </p>
            <p className="text-xs text-brand-nardo uppercase tracking-widest">
              Pipeline commercial
            </p>
          </div>
        </div>

        <h1 className="text-2xl font-bold mb-1">Connexion admin</h1>
        <p className="text-sm text-brand-nardo mb-6 flex items-center gap-1.5">
          <Lock className="w-3.5 h-3.5" /> Accès privé réservé à l'équipe commerciale
        </p>

        <form onSubmit={submit} className="space-y-4">
          <input
            data-testid="crm-email"
            type="email"
            required
            placeholder="Email admin"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full h-12 px-4 border border-brand-border text-sm focus:outline-none focus:border-brand-orange transition-colors"
          />
          <input
            data-testid="crm-password"
            type="password"
            required
            placeholder="Mot de passe"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full h-12 px-4 border border-brand-border text-sm focus:outline-none focus:border-brand-orange transition-colors"
          />
          {err && (
            <p className="text-xs text-red-600 flex items-center gap-2">
              <AlertCircle className="w-4 h-4" /> {err}
            </p>
          )}
          <button
            data-testid="crm-login-submit"
            type="submit"
            disabled={loading}
            className="w-full bg-brand-orange text-white hover:bg-brand-orange-dark font-semibold h-12 transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
          >
            <LogIn className="w-4 h-4" />
            {loading ? "Connexion…" : "Se connecter"}
          </button>
        </form>
      </div>
    </div>
  );
}
