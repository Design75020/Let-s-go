import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { formatApiError } from "../lib/api";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { ChefHat, Mail, Lock, ArrowRight, Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login, user } = useAuth();
  const navigate = useNavigate();

  if (user) {
    if (user.role === "admin") navigate("/admin", { replace: true });
    else if (user.role === "driver") navigate("/driver", { replace: true });
    else navigate("/home", { replace: true });
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const data = await login(email, password);
      toast.success(`Bienvenue, ${data.name} !`);
      if (data.role === "admin") navigate("/admin");
      else if (data.role === "driver") navigate("/driver");
      else navigate("/home");
    } catch (err) {
      toast.error(formatApiError(err.response?.data?.detail));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex" data-testid="login-page">
      {/* Left decorative panel */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden items-center justify-center" style={{ backgroundColor: '#6C6F70' }}>
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-20 w-64 h-64 rounded-full border-2 border-white" />
          <div className="absolute bottom-32 right-16 w-48 h-48 rounded-full border-2 border-white" />
          <div className="absolute top-1/2 left-1/3 w-32 h-32 rounded-full border-2 border-white" />
        </div>
        <div className="relative z-10 text-white text-center px-12">
          <ChefHat className="w-16 h-16 mx-auto mb-6 opacity-90" />
          <h2 className="text-5xl brand-text mb-4">Let's Go</h2>
          <p className="text-lg opacity-80 leading-relaxed">Votre plateforme de livraison de repas professionnelle. Gerez restaurants, commandes et livreurs en un seul endroit.</p>
        </div>
      </div>

      {/* Right form panel */}
      <div className="flex-1 flex items-center justify-center px-6 py-12 bg-background">
        <div className="w-full max-w-sm animate-fade-in">
          <div className="lg:hidden flex items-center gap-2 mb-8">
            <div className="w-10 h-10 rounded-xl brand-bg flex items-center justify-center">
              <ChefHat className="w-5 h-5 text-white" />
            </div>
            <span className="text-2xl brand-text-sm">Let's Go</span>
          </div>

          <h1 className="text-3xl font-bold tracking-tight mb-2" style={{ fontFamily: 'Outfit' }}>Connexion</h1>
          <p className="text-muted-foreground mb-8">Entrez vos identifiants pour acceder a votre compte</p>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="email"
                  data-testid="login-email-input"
                  type="email"
                  placeholder="votre@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Mot de passe</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="password"
                  data-testid="login-password-input"
                  type={showPassword ? "text" : "password"}
                  placeholder="Votre mot de passe"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 pr-10"
                  required
                />
                <button
                  type="button"
                  data-testid="login-toggle-password"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <Button
              data-testid="login-submit-btn"
              type="submit"
              disabled={loading}
              className="w-full bg-[#FF6B00] hover:bg-[#E05E00] text-white h-11"
            >
              {loading ? "Connexion..." : "Se connecter"}
              {!loading && <ArrowRight className="w-4 h-4 ml-2" />}
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            Pas encore de compte ?{" "}
            <Link to="/register" data-testid="go-to-register" className="font-medium text-[#FF6B00] hover:underline">
              Creer un compte
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
