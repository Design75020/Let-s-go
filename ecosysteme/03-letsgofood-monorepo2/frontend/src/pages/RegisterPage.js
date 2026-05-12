import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { formatApiError } from "../lib/api";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { ChefHat, Mail, Lock, User, Phone, ArrowRight, Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";

export default function RegisterPage() {
  const [form, setForm] = useState({ name: "", email: "", password: "", role: "client", phone: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password.length < 6) { toast.error("Le mot de passe doit contenir au moins 6 caracteres."); return; }
    setLoading(true);
    try {
      const data = await register(form);
      toast.success(`Compte cree ! Bienvenue, ${data.name}`);
      if (data.role === "admin") navigate("/admin");
      else if (data.role === "driver") navigate("/driver");
      else navigate("/home");
    } catch (err) {
      toast.error(formatApiError(err.response?.data?.detail));
    } finally {
      setLoading(false);
    }
  };

  const update = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target ? e.target.value : e }));

  return (
    <div className="min-h-screen flex" data-testid="register-page">
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden items-center justify-center" style={{ backgroundColor: '#6C6F70' }}>
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-32 right-20 w-56 h-56 rounded-full border-2 border-white" />
          <div className="absolute bottom-20 left-16 w-40 h-40 rounded-full border-2 border-white" />
        </div>
        <div className="relative z-10 text-white text-center px-12">
          <ChefHat className="w-16 h-16 mx-auto mb-6 opacity-90" />
          <h2 className="text-5xl brand-text mb-4">Let's Go</h2>
          <p className="text-lg opacity-80 leading-relaxed">Creez votre compte et commencez a commander vos repas preferes ou rejoignez notre equipe de livreurs.</p>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center px-6 py-12 bg-background">
        <div className="w-full max-w-sm animate-fade-in">
          <div className="lg:hidden flex items-center gap-2 mb-8">
            <div className="w-10 h-10 rounded-xl brand-bg flex items-center justify-center">
              <ChefHat className="w-5 h-5 text-white" />
            </div>
            <span className="text-2xl brand-text-sm">Let's Go</span>
          </div>

          <h1 className="text-3xl font-bold tracking-tight mb-2" style={{ fontFamily: 'Outfit' }}>Inscription</h1>
          <p className="text-muted-foreground mb-8">Creez votre compte en quelques secondes</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label>Nom complet</Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input data-testid="register-name-input" placeholder="Votre nom" value={form.name} onChange={update("name")} className="pl-10" required />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input data-testid="register-email-input" type="email" placeholder="votre@email.com" value={form.email} onChange={update("email")} className="pl-10" required />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Mot de passe</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input data-testid="register-password-input" type={showPassword ? "text" : "password"} placeholder="Min. 6 caracteres" value={form.password} onChange={update("password")} className="pl-10 pr-10" required />
                <button
                  type="button"
                  data-testid="register-toggle-password"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Telephone</Label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input data-testid="register-phone-input" placeholder="+33 6 00 00 00 00" value={form.phone} onChange={update("phone")} className="pl-10" />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Je suis</Label>
              <Select value={form.role} onValueChange={(val) => setForm((f) => ({ ...f, role: val }))}>
                <SelectTrigger data-testid="register-role-select">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="client">Client</SelectItem>
                  <SelectItem value="driver">Livreur</SelectItem>
                  <SelectItem value="restaurant_owner">Restaurateur</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button data-testid="register-submit-btn" type="submit" disabled={loading} className="w-full bg-[#10B981] hover:bg-[#059669] text-white h-11">
              {loading ? "Creation..." : "Creer mon compte"}
              {!loading && <ArrowRight className="w-4 h-4 ml-2" />}
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            Deja un compte ?{" "}
            <Link to="/login" data-testid="go-to-login" className="font-medium text-[#10B981] hover:underline">Se connecter</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
