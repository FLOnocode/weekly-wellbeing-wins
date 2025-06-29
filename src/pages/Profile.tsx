import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { User, Scale, Trophy, TrendingDown, Calendar, ArrowLeft, Medal, Target, LogOut, Settings, PlusCircle, TrendingUp } from "lucide-react";
import { MobileHeader } from "@/components/MobileHeader";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { useState, useEffect } from "react";
import { leaderboardService, LeaderboardEntry } from "@/lib/leaderboard";
import { supabase } from "@/lib/supabase";
import { toast } from "@/components/ui/sonner";

const Profile = () => {
  const { signOut, profile, user, updateProfile, refreshProfile } = useAuth();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [userLeaderboardStats, setUserLeaderboardStats] = useState<LeaderboardEntry | null>(null);
  const [loadingStats, setLoadingStats] = useState(true);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);

  useEffect(() => {
    const fetchUserStats = async () => {
      if (!user) return;
      setLoadingStats(true);
      try {
        const leaderboard = await leaderboardService.getLeaderboard(user.id);
        const currentUserEntry = leaderboard.find(entry => entry.isCurrentUser);
        setUserLeaderboardStats(currentUserEntry || null);
      } catch (error) {
        console.error("Erreur lors de la récupération des statistiques de l'utilisateur:", error);
        toast.error("Erreur lors du chargement de vos statistiques.");
      } finally {
        setLoadingStats(false);
      }
    };

    fetchUserStats();
  }, [user]);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await signOut();
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error);
      setIsLoggingOut(false);
    }
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.size > 1 * 1024 * 1024) { // Max 1MB
        toast.error("L'avatar ne doit pas dépasser 1MB.");
        return;
      }
      if (!file.type.startsWith('image/')) {
        toast.error("Veuillez sélectionner une image valide pour l'avatar.");
        return;
      }
      uploadAvatar(file); // Déclenche l'upload immédiatement
    }
  };

  const uploadAvatar = async (file: File) => {
    if (!user || !profile) {
      toast.error("Vous devez être connecté pour changer votre avatar.");
      return;
    }
    setIsUploadingAvatar(true);
    toast.loading("Téléchargement de l'avatar...");

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/avatar.${fileExt}`; // Nom de fichier unique par utilisateur

      const { data, error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: true // Permet de remplacer l'avatar existant
        });

      if (uploadError) {
        throw uploadError;
      }

      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(fileName);

      const { error: updateError } = await updateProfile({ avatar_url: publicUrl });

      if (updateError) {
        throw updateError;
      }

      toast.success("Avatar mis à jour avec succès !");
      await refreshProfile(); // Rafraîchit le profil dans le contexte
    } catch (error: any) {
      console.error("Erreur lors de l'upload de l'avatar:", error);
      toast.error(`Erreur: ${error.message || "Impossible de mettre à jour l'avatar."}`);
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  // Calculs dynamiques basés sur les données réelles
  const totalPoints = userLeaderboardStats?.totalScore || 0;
  const currentRank = userLeaderboardStats?.rank || 0;
  const totalWeightLost = userLeaderboardStats?.weightLost || 0;
  const weeklyWeightChange = userLeaderboardStats?.weeklyWeightChange || 0;
  const initialWeight = userLeaderboardStats?.initialWeight || 0;
  const perfectDays = userLeaderboardStats?.perfectDays || 0;
  const challengesCompleted = userLeaderboardStats?.challengesCompleted || 0;
  const weeklyScore = userLeaderboardStats?.weeklyScore || 0;

  // Calcul de la durée de participation
  const joinDate = profile?.created_at ? new Date(profile.created_at) : new Date();
  const now = new Date();
  const diffTime = Math.abs(now.getTime() - joinDate.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  const participationWeeks = Math.floor(diffDays / 7);

  // Calcul de la progression du poids - CORRIGÉ avec le vrai poids initial
  const actualWeightLossProgress = profile?.current_weight && profile?.goal_weight && initialWeight > 0 && initialWeight > profile.goal_weight
    ? ((initialWeight - profile.current_weight) / (initialWeight - profile.goal_weight)) * 100
    : 0;

  // Générer les initiales du profil
  const getInitials = () => {
    if (profile?.nickname) {
      return profile.nickname
        .split(' ')
        .map(word => word[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);
    }
    return user?.email?.slice(0, 2).toUpperCase() || 'VP';
  };

  if (loadingStats) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-foreground">Chargement du profil...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Effets de fond adaptatifs */}
      <div className="absolute inset-0 bg-[var(--page-background-overlay)]" />
      
      {/* Texture de bruit subtile */}
      <div className="absolute inset-0 opacity-[0.03] mix-blend-soft-light" 
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
          backgroundSize: '200px 200px'
        }}
      />

      {/* Lueur radiale du haut */}
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

      {/* Spots lumineux animés */}
      <div className="absolute left-1/4 top-1/4 w-96 h-96 bg-foreground/5 rounded-full blur-[100px] animate-pulse opacity-40" />
      <div className="absolute right-1/4 bottom-1/4 w-96 h-96 bg-foreground/5 rounded-full blur-[100px] animate-pulse delay-1000 opacity-40" />

      <div className="relative z-20">
        <MobileHeader 
          totalPoints={totalPoints}
          completedChallenges={challengesCompleted}
          totalChallenges={7} // Nombre de défis par jour pour l'affichage du header
        />
      </div>

      <div className="relative z-10 pt-20 pb-6">
        <div className="container mx-auto px-4 max-w-lg">
          {/* Header avec retour */}
          <div className="flex items-center gap-3 mb-6">
            <Link to="/">
              <Button variant="ghost" size="icon" className="text-foreground">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <div>
              <h1 className="text-heading-2 font-bold text-gradient">Profil</h1>
              <p className="text-body text-muted-foreground">Votre progression personnelle</p>
            </div>
          </div>

          <div className="space-y-4">
            {/* Profil utilisateur avec avatar */}
            <Card className="glassmorphism">
              <CardHeader className="pb-4">
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <Avatar className="h-16 w-16 border-2 border-wellness-300">
                      <AvatarImage src={profile?.avatar_url || "/placeholder.svg"} />
                      <AvatarFallback className="bg-wellness-500/20 text-wellness-600 dark:text-wellness-300 text-heading-4">
                        {getInitials()}
                      </AvatarFallback>
                    </Avatar>
                    <input
                      id="avatar-input"
                      type="file"
                      accept="image/*"
                      onChange={handleAvatarChange}
                      className="hidden"
                      disabled={isUploadingAvatar}
                    />
                    <label htmlFor="avatar-input" className="absolute bottom-0 right-0 cursor-pointer">
                      <div className="h-6 w-6 bg-background rounded-full border border-wellness-400 flex items-center justify-center">
                        <PlusCircle className="h-4 w-4 text-wellness-400" />
                      </div>
                    </label>
                    {isUploadingAvatar && (
                      <div className="absolute inset-0 bg-background/50 rounded-full flex items-center justify-center">
                        <div className="text-xs text-foreground">...</div>
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <CardTitle className="text-heading-4 text-foreground">{profile?.nickname || "Votre Profil"}</CardTitle>
                    <CardDescription className="text-muted-foreground">
                      Membre depuis le {new Date(joinDate).toLocaleDateString("fr-FR")}
                    </CardDescription>
                    <div className="flex items-center gap-2 mt-2">
                      {currentRank > 0 && (
                        <Badge className="bg-wellness-500/20 text-wellness-600 dark:text-wellness-200 border-wellness-400/30">#{currentRank} au classement</Badge>
                      )}
                      <Badge className="bg-motivation-500/20 text-motivation-600 dark:text-motivation-200 border-motivation-400/30">{totalPoints} pts</Badge>
                    </div>
                  </div>
                </div>
              </CardHeader>
            </Card>

            {/* Statistiques de poids */}
            <Card className="glassmorphism">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2 text-heading-4 text-foreground">
                  <Scale className="h-5 w-5 text-wellness-500" />
                  <span>Progression du poids</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-3 bg-muted border border-wellness-400/30 rounded-lg">
                    <div className="text-heading-3 font-bold text-wellness-600 dark:text-wellness-300">
                      {profile?.current_weight > 0 ? `${profile.current_weight}kg` : 'Non défini'}
                    </div>
                    <div className="text-body-sm text-muted-foreground">Poids actuel</div>
                  </div>
                  <div className="text-center p-3 bg-muted border border-motivation-400/30 rounded-lg">
                    <div className="text-heading-3 font-bold text-motivation-600 dark:text-motivation-300">
                      {profile?.goal_weight > 0 ? `${profile.goal_weight}kg` : 'Non défini'}
                    </div>
                    <div className="text-body-sm text-muted-foreground">Poids objectif</div>
                  </div>
                </div>

                {profile?.current_weight > 0 && profile?.goal_weight > 0 && initialWeight > 0 && (
                  <>
                    <div className="space-y-2">
                      <div className="flex justify-between text-body-sm">
                        <span className="text-muted-foreground">Progression vers l'objectif</span>
                        <span className="font-medium text-foreground">{Math.round(actualWeightLossProgress)}%</span>
                      </div>
                      <Progress value={actualWeightLossProgress} className="h-2 bg-muted" />
                      <div className="flex justify-between text-body-sm text-muted-foreground">
                        <span>Départ: {initialWeight.toFixed(1)}kg</span>
                        <span>Objectif: {profile.goal_weight}kg</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between p-3 bg-muted border border-border rounded-lg">
                      <div className="flex items-center gap-2">
                        {totalWeightLost >= 0 ? (
                          <TrendingDown className="h-5 w-5 text-wellness-500" />
                        ) : (
                          <TrendingUp className="h-5 w-5 text-red-500" />
                        )}
                        <span className="text-body font-medium text-foreground">
                          {totalWeightLost >= 0 ? 'Poids perdu au total' : 'Poids pris au total'}
                        </span>
                      </div>
                      <div className={`text-body font-bold ${totalWeightLost >= 0 ? 'text-wellness-600 dark:text-wellness-300' : 'text-red-600 dark:text-red-300'}`}>
                        {Math.abs(totalWeightLost).toFixed(1)}kg
                      </div>
                    </div>

                    {/* Nouveau: Changement de poids hebdomadaire */}
                    <div className="flex items-center justify-between p-3 bg-muted border border-border rounded-lg">
                      <div className="flex items-center gap-2">
                        {weeklyWeightChange >= 0 ? (
                          <TrendingDown className="h-5 w-5 text-wellness-500" />
                        ) : (
                          <TrendingUp className="h-5 w-5 text-red-500" />
                        )}
                        <span className="text-body font-medium text-foreground">Cette semaine</span>
                      </div>
                      <div className={`text-body font-bold ${weeklyWeightChange >= 0 ? 'text-wellness-600 dark:text-wellness-300' : 'text-red-600 dark:text-red-300'}`}>
                        {weeklyWeightChange >= 0 ? '-' : '+'}{Math.abs(weeklyWeightChange).toFixed(1)}kg
                      </div>
                    </div>
                  </>
                )}

                {(profile?.current_weight === 0 || profile?.goal_weight === 0 || initialWeight === 0) && (
                  <div className="p-4 bg-yellow-500/10 border border-yellow-400/30 rounded-lg text-center">
                    <p className="text-yellow-600 dark:text-yellow-200 text-sm">
                      {initialWeight === 0 
                        ? "Enregistrez votre première pesée pour voir votre progression"
                        : "Complétez votre profil pour voir votre progression"
                      }
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Statistiques du défi avec données réelles */}
            <Card className="glassmorphism">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2 text-heading-4 text-foreground">
                  <Trophy className="h-5 w-5 text-yellow-500" />
                  <span>Statistiques du défi</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="text-center p-3 bg-muted border border-yellow-400/30 rounded-lg">
                    <div className="text-heading-3 font-bold text-yellow-600 dark:text-yellow-300">{totalPoints}</div>
                    <div className="text-body-sm text-muted-foreground">Points total</div>
                  </div>
                  <div className="text-center p-3 bg-muted border border-energy-400/30 rounded-lg">
                    <div className="text-heading-3 font-bold text-energy-600 dark:text-energy-300">{weeklyScore}</div>
                    <div className="text-body-sm text-muted-foreground">Cette semaine</div>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-muted border border-border rounded-lg">
                    <div className="flex items-center gap-2">
                      <Medal className="h-5 w-5 text-motivation-500" />
                      <span className="text-body text-foreground">Classement actuel</span>
                    </div>
                    <span className="text-body font-bold text-motivation-600 dark:text-motivation-300">
                      {currentRank > 0 ? `#${currentRank}` : 'Non classé'}
                    </span>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-muted border border-border rounded-lg">
                    <div className="flex items-center gap-2">
                      {totalWeightLost >= 0 ? (
                        <TrendingDown className="h-5 w-5 text-wellness-500" />
                      ) : (
                        <TrendingUp className="h-5 w-5 text-red-500" />
                      )}
                      <span className="text-body text-foreground">
                        {totalWeightLost >= 0 ? 'Poids perdu au total' : 'Poids pris au total'}
                      </span>
                    </div>
                    <span className={`text-body font-bold ${totalWeightLost >= 0 ? 'text-wellness-600 dark:text-wellness-300' : 'text-red-600 dark:text-red-300'}`}>
                      {Math.abs(totalWeightLost).toFixed(1)}kg
                    </span>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-muted border border-border rounded-lg">
                    <div className="flex items-center gap-2">
                      <Target className="h-5 w-5 text-energy-500" />
                      <span className="text-body text-foreground">Journées parfaites</span>
                    </div>
                    <span className="text-body font-bold text-energy-600 dark:text-energy-300">{perfectDays}</span>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-muted border border-border rounded-lg">
                    <div className="flex items-center gap-2">
                      <Trophy className="h-5 w-5 text-motivation-500" />
                      <span className="text-body text-foreground">Défis complétés</span>
                    </div>
                    <span className="text-body font-bold text-motivation-600 dark:text-motivation-300">{challengesCompleted}</span>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-muted border border-border rounded-lg">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-5 w-5 text-motivation-500" />
                      <span className="text-body text-foreground">Durée de participation</span>
                    </div>
                    <span className="text-body font-bold text-motivation-600 dark:text-motivation-300">{participationWeeks} semaines</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Objectifs personnels */}
            <Card className="glassmorphism border-wellness-400/30">
              <CardHeader className="pb-4">
                <CardTitle className="text-heading-4 flex items-center gap-2 text-foreground">
                  <Target className="h-6 w-6 text-wellness-400" />
                  Vos objectifs
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-body text-muted-foreground">Poids objectif</span>
                    <span className="text-body font-bold text-foreground">
                      {profile?.goal_weight > 0 ? `${profile.goal_weight}kg` : 'Non défini'}
                    </span>
                  </div>
                  {profile?.current_weight > 0 && profile?.goal_weight > 0 && (
                    <>
                      <div className="flex justify-between items-center">
                        <span className="text-body text-muted-foreground">Reste à perdre</span>
                        <span className="text-body font-bold text-foreground">
                          {Math.max(0, (profile?.current_weight || 0) - (profile?.goal_weight || 0)).toFixed(1)}kg
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-body text-muted-foreground">Progression</span>
                        <span className="text-body font-bold text-foreground">{Math.round(actualWeightLossProgress)}%</span>
                      </div>
                    </>
                  )}
                  {initialWeight > 0 && (
                    <div className="flex justify-between items-center">
                      <span className="text-body text-muted-foreground">Poids de départ</span>
                      <span className="text-body font-bold text-foreground">{initialWeight.toFixed(1)}kg</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Gestion du compte */}
            <Card className="glassmorphism border-red-400/30">
              <CardHeader className="pb-4">
                <CardTitle className="text-heading-4 flex items-center gap-2 text-foreground">
                  <Settings className="h-6 w-6 text-red-400" />
                  Gestion du compte
                </CardTitle>
                <CardDescription className="text-muted-foreground">
                  Options de compte et déconnexion
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <Button
                    onClick={handleLogout}
                    disabled={isLoggingOut}
                    variant="outline"
                    className="w-full bg-red-500/10 border-red-400/30 text-red-600 dark:text-red-300 hover:bg-red-500/20 hover:text-red-600 dark:hover:text-red-200 transition-colors"
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    {isLoggingOut ? "Déconnexion..." : "Se déconnecter"}
                  </Button>
                  
                  <p className="text-body-sm text-muted-foreground text-center">
                    Vous serez redirigé vers la page de connexion
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;