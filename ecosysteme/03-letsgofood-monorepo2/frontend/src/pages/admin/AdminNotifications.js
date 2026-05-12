import { useState, useEffect } from "react";
import api, { formatApiError } from "../../lib/api";
import { Card, CardContent } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Switch } from "../../components/ui/switch";
import { Mail, MessageSquare, Send, CheckCircle, AlertCircle, Bell } from "lucide-react";
import { toast } from "sonner";

export default function AdminNotifications() {
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [testEmail, setTestEmail] = useState("");
  const [testPhone, setTestPhone] = useState("");
  const [sendingEmail, setSendingEmail] = useState(false);
  const [sendingSms, setSendingSms] = useState(false);

  const fetchSettings = async () => {
    try { const { data } = await api.get("/notifications/settings"); setSettings(data); }
    catch { /* noop */ }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchSettings(); }, []);

  const updateSetting = async (key, value) => {
    const updated = { ...settings, [key]: value };
    setSettings(updated);
    try {
      await api.put("/notifications/settings", updated);
    } catch (err) { toast.error(formatApiError(err.response?.data?.detail)); }
  };

  const handleTestEmail = async () => {
    if (!testEmail) { toast.error("Entrez une adresse email"); return; }
    setSendingEmail(true);
    try {
      const { data } = await api.post("/notifications/test-email", { email: testEmail });
      toast.success(data.message);
    } catch (err) { toast.error(formatApiError(err.response?.data?.detail)); }
    finally { setSendingEmail(false); }
  };

  const handleTestSms = async () => {
    if (!testPhone) { toast.error("Entrez un numero de telephone"); return; }
    setSendingSms(true);
    try {
      const { data } = await api.post("/notifications/test-sms", { phone: testPhone });
      toast.success(data.message);
    } catch (err) { toast.error(formatApiError(err.response?.data?.detail)); }
    finally { setSendingSms(false); }
  };

  if (loading) return <div className="loading-screen"><div className="loading-spinner" /></div>;

  return (
    <div data-testid="admin-notifications" className="p-6 md:p-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight" style={{ fontFamily: 'Outfit' }}>Notifications</h1>
        <p className="text-muted-foreground mt-1">Configurez les notifications email et SMS</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Email Config */}
        <Card className="border-border animate-fade-in">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-lg bg-[#FF6B00]/10 flex items-center justify-center">
                <Mail className="w-5 h-5 text-[#FF6B00]" />
              </div>
              <div>
                <h3 className="font-semibold" style={{ fontFamily: 'Outfit' }}>Email (Brevo)</h3>
                <p className="text-xs text-muted-foreground">Notifications par email transactionnel</p>
              </div>
            </div>

            <div className="space-y-4">
              {settings && (
                <>
                  <div className="flex items-center justify-between">
                    <Label className="text-sm">Emails actives</Label>
                    <Switch data-testid="toggle-email" checked={settings.email_enabled} onCheckedChange={(v) => updateSetting("email_enabled", v)} />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label className="text-sm">Email sur nouvelle commande</Label>
                    <Switch checked={settings.email_on_order} onCheckedChange={(v) => updateSetting("email_on_order", v)} />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label className="text-sm">Email sur changement de statut</Label>
                    <Switch checked={settings.email_on_status} onCheckedChange={(v) => updateSetting("email_on_status", v)} />
                  </div>
                </>
              )}

              <div className="border-t border-border pt-4 mt-4">
                <Label className="text-xs text-muted-foreground mb-2 block">Tester l'envoi d'email</Label>
                <div className="flex gap-2">
                  <Input
                    data-testid="test-email-input"
                    type="email"
                    placeholder="test@email.com"
                    value={testEmail}
                    onChange={(e) => setTestEmail(e.target.value)}
                  />
                  <Button
                    data-testid="test-email-btn"
                    onClick={handleTestEmail}
                    disabled={sendingEmail}
                    className="bg-[#FF6B00] hover:bg-[#E05E00] text-white shrink-0"
                  >
                    {sendingEmail ? "Envoi..." : <><Send className="w-4 h-4 mr-1" />Tester</>}
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* SMS Config */}
        <Card className="border-border animate-fade-in stagger-1">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-lg bg-[#10B981]/10 flex items-center justify-center">
                <MessageSquare className="w-5 h-5 text-[#10B981]" />
              </div>
              <div>
                <h3 className="font-semibold" style={{ fontFamily: 'Outfit' }}>SMS (Twilio)</h3>
                <p className="text-xs text-muted-foreground">Notifications par SMS</p>
              </div>
            </div>

            <div className="space-y-4">
              {settings && (
                <>
                  <div className="flex items-center justify-between">
                    <Label className="text-sm">SMS actives</Label>
                    <Switch data-testid="toggle-sms" checked={settings.sms_enabled} onCheckedChange={(v) => updateSetting("sms_enabled", v)} />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label className="text-sm">SMS sur nouvelle commande</Label>
                    <Switch checked={settings.sms_on_order} onCheckedChange={(v) => updateSetting("sms_on_order", v)} />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label className="text-sm">SMS sur livraison</Label>
                    <Switch checked={settings.sms_on_delivery} onCheckedChange={(v) => updateSetting("sms_on_delivery", v)} />
                  </div>
                </>
              )}

              <div className="border-t border-border pt-4 mt-4">
                <Label className="text-xs text-muted-foreground mb-2 block">Tester l'envoi de SMS</Label>
                <div className="flex gap-2">
                  <Input
                    data-testid="test-sms-input"
                    type="tel"
                    placeholder="+33 6 12 34 56 78"
                    value={testPhone}
                    onChange={(e) => setTestPhone(e.target.value)}
                  />
                  <Button
                    data-testid="test-sms-btn"
                    onClick={handleTestSms}
                    disabled={sendingSms}
                    className="bg-[#10B981] hover:bg-[#059669] text-white shrink-0"
                  >
                    {sendingSms ? "Envoi..." : <><Send className="w-4 h-4 mr-1" />Tester</>}
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Info */}
      <Card className="border-border animate-fade-in stagger-2">
        <CardContent className="p-6">
          <h3 className="font-semibold mb-4 flex items-center gap-2" style={{ fontFamily: 'Outfit' }}>
            <Bell className="w-5 h-5 text-[#F59E0B]" />Quand les notifications sont envoyees
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-3">
              <h4 className="text-sm font-medium flex items-center gap-2"><Mail className="w-4 h-4 text-[#FF6B00]" />Emails</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-center gap-2"><CheckCircle className="w-3 h-3 text-[#10B981]" />Confirmation de commande au client</li>
                <li className="flex items-center gap-2"><CheckCircle className="w-3 h-3 text-[#10B981]" />Changement de statut de commande</li>
                <li className="flex items-center gap-2"><CheckCircle className="w-3 h-3 text-[#10B981]" />Assignation de livreur</li>
                <li className="flex items-center gap-2"><CheckCircle className="w-3 h-3 text-[#10B981]" />Notification au livreur</li>
              </ul>
            </div>
            <div className="space-y-3">
              <h4 className="text-sm font-medium flex items-center gap-2"><MessageSquare className="w-4 h-4 text-[#10B981]" />SMS</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-center gap-2"><CheckCircle className="w-3 h-3 text-[#10B981]" />Confirmation de commande (client)</li>
                <li className="flex items-center gap-2"><CheckCircle className="w-3 h-3 text-[#10B981]" />Commande en livraison (client)</li>
                <li className="flex items-center gap-2"><CheckCircle className="w-3 h-3 text-[#10B981]" />Commande livree (client)</li>
                <li className="flex items-center gap-2"><CheckCircle className="w-3 h-3 text-[#10B981]" />Nouvelle livraison (livreur)</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
