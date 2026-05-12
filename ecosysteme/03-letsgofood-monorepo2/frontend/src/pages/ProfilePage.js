import { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import api, { formatApiError } from "../lib/api";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Card, CardContent } from "../components/ui/card";
import { Separator } from "../components/ui/separator";
import { User, Mail, Phone, MapPin, Lock, Save, ChefHat, Shield, Bike, Store, Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";

const ROLE_LABELS = { admin: "Administrateur", client: "Client", driver: "Livreur", restaurant_owner: "Restaurateur" };
const ROLE_COLORS = { admin: "#FF6B00", client: "#3B82F6", driver: "#10B981", restaurant_owner: "#F59E0B" };
const ROLE_ICONS = { admin: Shield, client: User, driver: Bike, restaurant_owner: Store };

export default function ProfilePage() {
  const { user, checkAuth } = useAuth();
  const [form, setForm] = useState({ name: "", phone: "", address: "" });
  const [pwForm, setPwForm] = useState({ current_password: "", new_password: "", confirm_password: "" });
  const [showCurrentPw, setShowCurrentPw] = useState(false);
  const [showNewPw, setShowNewPw] = useState(false);
  const [showConfirmPw, setShowConfirmPw] = useState(false);
  const [saving, setSaving] = useState(false);
  const [changingPw, setChangingPw] = useState(false);

  useEffect(() => {
    if (user) {
      setForm({ name: user.name || "", phone: user.phone || "", address: user.address || "" });
    }
  }, [user]);

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) { toast.error("Le nom est requis"); return; }
    setSaving(true);
    try {
      await api.put("/auth/profile", form);
      await checkAuth();
      toast.success("Profil mis a jour !");
    } catch (err) { toast.error(formatApiError(err.response?.data?.detail)); }
    finally { setSaving(false); }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (pwForm.new_password !== pwForm.confirm_password) { toast.error("Les mots de passe ne correspondent pas"); return; }
    if (pwForm.new_password.length < 6) { toast.error("Minimum 6 caracteres"); return; }
    setChangingPw(true);
    try {
      await api.put("/auth/change-password", { current_password: pwForm.current_password, new_password: pwForm.new_password });
      toast.success("Mot de passe modifie !");
      setPwForm({ current_password: "", new_password: "", confirm_password: "" });
    } catch (err) { toast.error(formatApiError(err.response?.data?.detail)); }
    finally { setChangingPw(false); }
  };

  if (!user) return null;

  const RoleIcon = ROLE_ICONS[user.role] || User;
  const roleColor = ROLE_COLORS[user.role] || "#6B7280";

  return (
    <div data-testid="profile-page" className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
      <h1 className="text-3xl font-bold tracking-tight mb-2" style={{ fontFamily: 'Outfit' }}>Mon Profil</h1>
      <p className="text-muted-foreground mb-8">Gerez vos informations personnelles</p>

      {/* Profile header */}
      <Card className="border-border mb-6 overflow-hidden animate-fade-in">
        <div className="h-1.5" style={{ backgroundColor: roleColor }} />
        <CardContent className="p-6">
          <div className="flex items-center gap-5">
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center" style={{ backgroundColor: `${roleColor}15` }}>
              <span className="text-2xl font-bold" style={{ color: roleColor }}>{user.name?.charAt(0)}</span>
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-bold" style={{ fontFamily: 'Outfit' }}>{user.name}</h2>
              <p className="text-sm text-muted-foreground flex items-center gap-1"><Mail className="w-3.5 h-3.5" />{user.email}</p>
              <div className="flex items-center gap-2 mt-2">
                <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium" style={{ backgroundColor: `${roleColor}15`, color: roleColor }}>
                  <RoleIcon className="w-3 h-3" />{ROLE_LABELS[user.role] || user.role}
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Edit profile */}
      <Card className="border-border mb-6 animate-fade-in stagger-1">
        <CardContent className="p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2" style={{ fontFamily: 'Outfit' }}>
            <User className="w-5 h-5 text-muted-foreground" />Informations personnelles
          </h3>
          <form onSubmit={handleSaveProfile} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-sm">Nom complet</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    data-testid="profile-name-input"
                    value={form.name}
                    onChange={(e) => setForm(f => ({...f, name: e.target.value}))}
                    className="pl-10"
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-sm">Telephone</Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    data-testid="profile-phone-input"
                    value={form.phone}
                    onChange={(e) => setForm(f => ({...f, phone: e.target.value}))}
                    className="pl-10"
                    placeholder="+33 6 00 00 00 00"
                  />
                </div>
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-sm">Adresse</Label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  data-testid="profile-address-input"
                  value={form.address}
                  onChange={(e) => setForm(f => ({...f, address: e.target.value}))}
                  className="pl-10"
                  placeholder="Votre adresse"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-sm text-muted-foreground">Email (non modifiable)</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input value={user.email} disabled className="pl-10 bg-muted/50" />
              </div>
            </div>
            <Button data-testid="save-profile-btn" type="submit" disabled={saving} className="bg-[#FF6B00] hover:bg-[#E05E00] text-white">
              {saving ? "Enregistrement..." : <><Save className="w-4 h-4 mr-2" />Enregistrer</>}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Change password */}
      <Card className="border-border animate-fade-in stagger-2">
        <CardContent className="p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2" style={{ fontFamily: 'Outfit' }}>
            <Lock className="w-5 h-5 text-muted-foreground" />Changer le mot de passe
          </h3>
          <form onSubmit={handleChangePassword} className="space-y-4">
            <div className="space-y-2">
              <Label className="text-sm">Mot de passe actuel</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  data-testid="current-password-input"
                  type={showCurrentPw ? "text" : "password"}
                  value={pwForm.current_password}
                  onChange={(e) => setPwForm(f => ({...f, current_password: e.target.value}))}
                  className="pl-10 pr-10"
                  required
                />
                <button type="button" data-testid="toggle-current-password" onClick={() => setShowCurrentPw(!showCurrentPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors">
                  {showCurrentPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-sm">Nouveau mot de passe</Label>
                <div className="relative">
                  <Input
                    data-testid="new-password-input"
                    type={showNewPw ? "text" : "password"}
                    value={pwForm.new_password}
                    onChange={(e) => setPwForm(f => ({...f, new_password: e.target.value}))}
                    placeholder="Min. 6 caracteres"
                    className="pr-10"
                    required
                  />
                  <button type="button" data-testid="toggle-new-password" onClick={() => setShowNewPw(!showNewPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors">
                    {showNewPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-sm">Confirmer</Label>
                <div className="relative">
                  <Input
                    data-testid="confirm-password-input"
                    type={showConfirmPw ? "text" : "password"}
                    value={pwForm.confirm_password}
                    onChange={(e) => setPwForm(f => ({...f, confirm_password: e.target.value}))}
                    placeholder="Repetez le mot de passe"
                    className="pr-10"
                    required
                  />
                  <button type="button" data-testid="toggle-confirm-password" onClick={() => setShowConfirmPw(!showConfirmPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors">
                    {showConfirmPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            </div>
            <Button data-testid="change-password-btn" type="submit" disabled={changingPw} variant="outline">
              {changingPw ? "Modification..." : <><Lock className="w-4 h-4 mr-2" />Modifier le mot de passe</>}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
