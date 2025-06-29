import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  Settings as SettingsIcon, 
  ArrowLeft, 
  Moon, 
  Sun, 
  Bell, 
  Smartphone, 
  Mail, 
  Info, 
  Heart,
  Shield,
  Database,
  Palette
} from "lucide-react";
import { MobileHeader } from "@/components/MobileHeader";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "next-themes";
import { useState, useEffect } from "react";
import { toast } from "@/components/ui/sonner";

const Settings = () => {
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

  // Statistiques utilisateur pour l'affichage du header
  const userStats = {
    totalPoints: 0,
    completedChallenges: 0,
    totalChallenges: 7
  };

  if (!mounted) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white">Chargement des paramètres...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black relative overflow-hidden">
      {/* Effets de fond similaires aux autres pages */}
      <div className="absolute inset-0 bg-gradient-to-b from-wellness-500/20 via-wellness-700/30 to-black" />
      
      <div className="absolute inset-0 opacity-[0.03] mix-blend-soft-light" 
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
          backgroundSize: '200px 200px'
        }}
      />

      <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-[120vh] h-[60vh] rounded-b-[50%] bg-wellness-400/20 blur-[80px]" />
      <motion.div 
        className="absolute top-0 left-1/2 transform -translate-x-1/2 w-[100vh] h-[60vh] rounded-b-full bg-wellness-300/20 blur-[60px]"
        animate={{ 
          opacity: [0.15, 0.3, 0.15],
          scale: [0.98, 1.02, 0.98]
        }}
        transition={{ 
          duration: 8, 
          repeat: Infinity,
          repeatType: "mirror"
        }}
      />

      <div className="absolute left-1/4 top-1/4 w-96 h-96 bg-white/5 rounded-full blur-[100px] animate-pulse opacity-40" />
      <div className="absolute right-1/4 bottom-1/4 w-96 h-96 bg-white/5 rounded-full blur-[100px] animate-pulse delay-1000 opacity-40" />

      <div className="relative z-20">
        <MobileHeader 
          totalPoints={userStats.totalPoints}
          completedChallenges={userStats.completedChallenges}
          totalChallenges={userStats.totalChallenges}
        />
      </div>

      <div className="relative z-10 pt-20 pb-6">
        <div className="container mx-auto px-4 max-w-lg">
          {/* Header avec retour */}
          <div className="flex items-center gap-3 mb-6">
            <Link to="/">
              <Button variant="ghost" size="icon" className="text-white">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <div>
              <h1 className="text-heading-2 font-bold text-gradient">Paramètres</h1>
              <p className="text-body text-white/70">Personnalisez votre expérience</p>
            </div>
          </div>

          <div className="space-y-4">
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
        </div>
      </div>
    </div>
  );
};

export default Settings;