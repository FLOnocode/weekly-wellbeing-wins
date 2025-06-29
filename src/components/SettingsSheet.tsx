import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { 
  Settings as SettingsIcon, 
  Moon, 
  Sun, 
  Bell, 
  Smartphone, 
  Mail, 
  Info, 
  Heart,
  Shield,
  Database,
  Palette,
  X
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "next-themes";
import { useState, useEffect } from "react";
import { toast } from "@/components/ui/sonner";

interface SettingsSheetProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SettingsSheet = ({ isOpen, onClose }: SettingsSheetProps) => {
  const { profile, user } = useAuth();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  
  // États pour les notifications futures (placeholders)
  const [pushNotifications, setPushNotifications] = useState(false);
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [challengeReminders, setChallengeReminders] = useState(true);
  const [weeklyReports, setWeeklyReports] = useState(true);

  // Éviter l'hydratation mismatch avec next-themes
  useEffect(() => {
    setMounted(true);
  }, []);

  const handleThemeToggle = (checked: boolean) => {
    const newTheme = checked ? "light" : "dark";
    setTheme(newTheme);
    toast.success(`Mode ${newTheme === "light" ? "clair" : "sombre"} activé`);
  };

  const handleNotificationToggle = (type: string, checked: boolean) => {
    switch (type) {
      case 'push':
        setPushNotifications(checked);
        toast.success(`Notifications push ${checked ? 'activées' : 'désactivées'}`);
        break;
      case 'email':
        setEmailNotifications(checked);
        toast.success(`Notifications email ${checked ? 'activées' : 'désactivées'}`);
        break;
      case 'challenges':
        setChallengeReminders(checked);
        toast.success(`Rappels de défis ${checked ? 'activés' : 'désactivés'}`);
        break;
      case 'reports':
        setWeeklyReports(checked);
        toast.success(`Rapports hebdomadaires ${checked ? 'activés' : 'désactivés'}`);
        break;
    }
  };

  if (!mounted) {
    return null;
  }

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent side="right" className="w-full sm:w-96 bg-black/90 backdrop-blur-xl border-white/20 overflow-y-auto">
        <SheetHeader className="pb-6">
          <SheetTitle className="flex items-center gap-2 text-xl text-white">
            <SettingsIcon className="h-6 w-6 text-wellness-400" />
            Paramètres
          </SheetTitle>
          <SheetDescription className="text-white/70">
            Personnalisez votre expérience
          </SheetDescription>
        </SheetHeader>

        <div className="space-y-6">
          {/* Informations sur l'application */}
          <Card className="glassmorphism border-wellness-400/30">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 text-heading-4 text-white">
                <Info className="h-5 w-5 text-wellness-500" />
                <span>À propos de l'application</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-body text-white/70">Nom de l'application</span>
                <span className="text-body font-medium text-white">Fit Together</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-body text-white/70">Version</span>
                <Badge className="bg-wellness-500/20 text-wellness-200 border-wellness-400/30">v1.0.0</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-body text-white/70">Utilisateur connecté</span>
                <span className="text-body font-medium text-white">{profile?.nickname || 'Utilisateur'}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-body text-white/70">Type de défi</span>
                <span className="text-body font-medium text-white">SSM 2K25 Challenge</span>
              </div>
            </CardContent>
          </Card>

          {/* Apparence */}
          <Card className="glassmorphism">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 text-heading-4 text-white">
                <Palette className="h-5 w-5 text-motivation-500" />
                <span>Apparence</span>
              </CardTitle>
              <CardDescription className="text-white/70">
                Personnalisez l'apparence de l'application
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {theme === "light" ? (
                    <Sun className="h-5 w-5 text-yellow-500" />
                  ) : (
                    <Moon className="h-5 w-5 text-blue-400" />
                  )}
                  <div>
                    <Label htmlFor="theme-toggle" className="text-body font-medium text-white">
                      Mode clair
                    </Label>
                    <p className="text-body-sm text-white/60">
                      Basculer entre le mode sombre et clair
                    </p>
                  </div>
                </div>
                <Switch
                  id="theme-toggle"
                  checked={theme === "light"}
                  onCheckedChange={handleThemeToggle}
                />
              </div>
            </CardContent>
          </Card>

          {/* Notifications */}
          <Card className="glassmorphism">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 text-heading-4 text-white">
                <Bell className="h-5 w-5 text-energy-500" />
                <span>Notifications</span>
              </CardTitle>
              <CardDescription className="text-white/70">
                Gérez vos préférences de notifications
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Smartphone className="h-5 w-5 text-blue-400" />
                  <div>
                    <Label htmlFor="push-notifications" className="text-body font-medium text-white">
                      Notifications push
                    </Label>
                    <p className="text-body-sm text-white/60">
                      Recevoir des notifications sur votre appareil
                    </p>
                  </div>
                </div>
                <Switch
                  id="push-notifications"
                  checked={pushNotifications}
                  onCheckedChange={(checked) => handleNotificationToggle('push', checked)}
                />
              </div>

              <Separator className="bg-white/20" />

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Mail className="h-5 w-5 text-green-400" />
                  <div>
                    <Label htmlFor="email-notifications" className="text-body font-medium text-white">
                      Notifications email
                    </Label>
                    <p className="text-body-sm text-white/60">
                      Recevoir des emails de rappel
                    </p>
                  </div>
                </div>
                <Switch
                  id="email-notifications"
                  checked={emailNotifications}
                  onCheckedChange={(checked) => handleNotificationToggle('email', checked)}
                />
              </div>

              <Separator className="bg-white/20" />

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Heart className="h-5 w-5 text-wellness-400" />
                  <div>
                    <Label htmlFor="challenge-reminders" className="text-body font-medium text-white">
                      Rappels de défis
                    </Label>
                    <p className="text-body-sm text-white/60">
                      Rappels quotidiens pour vos défis
                    </p>
                  </div>
                </div>
                <Switch
                  id="challenge-reminders"
                  checked={challengeReminders}
                  onCheckedChange={(checked) => handleNotificationToggle('challenges', checked)}
                />
              </div>

              <Separator className="bg-white/20" />

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Database className="h-5 w-5 text-purple-400" />
                  <div>
                    <Label htmlFor="weekly-reports" className="text-body font-medium text-white">
                      Rapports hebdomadaires
                    </Label>
                    <p className="text-body-sm text-white/60">
                      Résumé de vos progrès chaque semaine
                    </p>
                  </div>
                </div>
                <Switch
                  id="weekly-reports"
                  checked={weeklyReports}
                  onCheckedChange={(checked) => handleNotificationToggle('reports', checked)}
                />
              </div>
            </CardContent>
          </Card>

          {/* Confidentialité et sécurité */}
          <Card className="glassmorphism">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 text-heading-4 text-white">
                <Shield className="h-5 w-5 text-red-400" />
                <span>Confidentialité et sécurité</span>
              </CardTitle>
              <CardDescription className="text-white/70">
                Vos données sont protégées et sécurisées
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="p-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg">
                <p className="text-body-sm text-white/80 leading-relaxed">
                  🔒 Toutes vos données personnelles sont chiffrées et stockées de manière sécurisée. 
                  Nous ne partageons jamais vos informations avec des tiers.
                </p>
              </div>
              <div className="p-3 bg-wellness-500/10 border border-wellness-400/30 rounded-lg">
                <p className="text-body-sm text-wellness-200 leading-relaxed">
                  💡 Vos données de santé et de progression restent privées et ne sont utilisées 
                  que pour améliorer votre expérience dans le challenge.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Support et aide */}
          <Card className="glassmorphism border-motivation-400/30">
            <CardHeader className="pb-4">
              <CardTitle className="text-heading-4 text-white">
                Support et aide
              </CardTitle>
              <CardDescription className="text-white/70">
                Besoin d'aide ? Nous sommes là pour vous
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <Button
                  variant="outline"
                  className="w-full bg-white/10 border-white/20 text-white hover:bg-white/20 justify-start"
                >
                  <Heart className="h-4 w-4 mr-2 text-wellness-400" />
                  Centre d'aide
                </Button>
                
                <Button
                  variant="outline"
                  className="w-full bg-white/10 border-white/20 text-white hover:bg-white/20 justify-start"
                >
                  <Mail className="h-4 w-4 mr-2 text-motivation-400" />
                  Nous contacter
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Message de motivation */}
          <Card className="glassmorphism border-wellness-400/30">
            <CardContent className="p-4 text-center">
              <div className="text-2xl mb-2">⚙️</div>
              <p className="text-white/80 text-sm">
                Personnalisez votre expérience pour tirer le meilleur parti de votre transformation !
              </p>
              <p className="text-wellness-300 text-xs mt-2">
                Vos paramètres sont sauvegardés automatiquement
              </p>
            </CardContent>
          </Card>
        </div>
      </SheetContent>
    </Sheet>
  );
};