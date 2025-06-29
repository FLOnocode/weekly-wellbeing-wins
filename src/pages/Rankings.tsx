import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Trophy, Flame, Crown, Medal, Award, ArrowLeft, HelpCircle } from "lucide-react";
import { MobileHeader } from "@/components/MobileHeader";
import { RulesModal } from "@/components/RulesModal";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { leaderboardService, LeaderboardEntry, ChallengeRule } from "@/lib/leaderboard";

const Rankings = () => {
  const { profile, user } = useAuth();
  const [leaderboardData, setLeaderboardData] = useState<LeaderboardEntry[]>([]);
  const [rules, setRules] = useState<ChallengeRule[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUserStats, setCurrentUserStats] = useState({
    totalPoints: 0,
    completedChallenges: 0,
    totalChallenges: 7
  });

  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;

      try {
        setLoading(true);
        
        // Charger le classement et les règles en parallèle
        const [leaderboard, challengeRules] = await Promise.all([
          leaderboardService.getLeaderboard(user.id),
          leaderboardService.getChallengeRules()
        ]);

        console.log('📊 Données du classement reçues par Rankings.tsx:', leaderboard);
        console.log('📋 Nombre de participants dans le classement:', leaderboard.length);
        console.log('👥 Détail des participants:', leaderboard.map(entry => ({
          name: entry.name,
          totalScore: entry.totalScore,
          isCurrentUser: entry.isCurrentUser,
          rank: entry.rank,
          weeklyWeightChange: entry.weeklyWeightChange,
          hasAvatar: !!entry.avatar
        })));

        setLeaderboardData(leaderboard);
        setRules(challengeRules);

        // Trouver les stats de l'utilisateur actuel
        const currentUser = leaderboard.find(entry => entry.isCurrentUser);
        if (currentUser) {
          setCurrentUserStats({
            totalPoints: currentUser.totalScore,
            completedChallenges: currentUser.challengesCompleted,
            totalChallenges: 7
          });
        }

      } catch (error) {
        console.error('Erreur lors du chargement des données:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user]);

  // Générer les initiales du profil utilisateur
  const getUserInitials = () => {
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

  // Générer les initiales pour n'importe quel nom
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Crown className="h-5 w-5 text-yellow-500" />;
      case 2:
        return <Medal className="h-5 w-5 text-gray-400" />;
      case 3:
        return <Award className="h-5 w-5 text-amber-600" />;
      default:
        return <span className="text-body-sm font-bold text-white/70">#{rank}</span>;
    }
  };

  const burnerOfWeek = leaderboardData.find((entry) => entry.isBurnerOfWeek);

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white">Chargement du classement...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black relative overflow-hidden">
      {/* Effets de fond similaires à la page principale */}
      <div className="absolute inset-0 bg-gradient-to-b from-wellness-500/20 via-wellness-700/30 to-black" />
      
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
      <div className="absolute left-1/4 top-1/4 w-96 h-96 bg-white/5 rounded-full blur-[100px] animate-pulse opacity-40" />
      <div className="absolute right-1/4 bottom-1/4 w-96 h-96 bg-white/5 rounded-full blur-[100px] animate-pulse delay-1000 opacity-40" />

      <div className="relative z-20">
        <MobileHeader 
          totalPoints={currentUserStats.totalPoints}
          completedChallenges={currentUserStats.completedChallenges}
          totalChallenges={currentUserStats.totalChallenges}
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
            <div className="flex-1">
              <h1 className="text-heading-2 font-bold text-gradient">Le Classement</h1>
              <p className="text-body text-white/70">Votre position dans le défi</p>
            </div>
            <RulesModal />
          </div>

          <div className="space-y-4">
            {/* Brûleur de la semaine */}
            {burnerOfWeek && (
              <Card className="glassmorphism border-energy-400/30">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center gap-2 text-heading-4 text-white">
                    <Flame className="h-6 w-6 text-energy-500" />
                    <span className="text-energy-300">Brûleur de la semaine</span>
                  </CardTitle>
                  <CardDescription className="text-energy-200/70">Plus de poids perdu cette semaine</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-4 flex-wrap">
                    <Avatar className="h-12 w-12 border-2 border-energy-300">
                      <AvatarImage src={burnerOfWeek.avatar} />
                      <AvatarFallback className="bg-energy-500/20 text-energy-300">
                        {burnerOfWeek.isCurrentUser 
                          ? getUserInitials()
                          : getInitials(burnerOfWeek.name)
                        }
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-white">{burnerOfWeek.name}</div>
                      <div className="text-body-sm text-energy-200">A perdu {burnerOfWeek.weeklyWeightChange.toFixed(1)}kg cette semaine</div>
                    </div>
                    <Badge className="bg-energy-500/20 text-energy-200 border-energy-400/30">{burnerOfWeek.weeklyScore} pts</Badge>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Classement général */}
            <Card className="glassmorphism">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2 text-heading-4 text-white">
                  <Trophy className="h-5 w-5 text-yellow-500" />
                  <span>Classement du défi</span>
                </CardTitle>
                <CardDescription className="text-white/70">
                  Positions actuelles - {leaderboardData.length} participant{leaderboardData.length > 1 ? 's' : ''}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {leaderboardData.length === 0 ? (
                  <div className="text-center text-white/70 py-8">
                    Aucun participant pour le moment
                  </div>
                ) : (
                  <div className="space-y-3">
                    {leaderboardData.map((entry) => (
                      <div
                        key={entry.id}
                        className={`flex flex-col p-3 rounded-lg transition-colors gap-2 ${
                          entry.isCurrentUser 
                            ? "bg-white/20 backdrop-blur-sm border border-motivation-400/30" 
                            : "bg-white/10 backdrop-blur-sm border border-white/20 md:hover:bg-white/15"
                        }`}
                      >
                        {/* Section supérieure : Rang, Avatar, Surnom, Badge "Vous" */}
                        <div className="flex items-center gap-4 w-full">
                          <div className="flex items-center justify-center w-8 flex-shrink-0">
                            {getRankIcon(entry.rank)}
                          </div>

                          <Avatar className="h-10 w-10 flex-shrink-0">
                            <AvatarImage src={entry.avatar} />
                            <AvatarFallback className="bg-wellness-500/20 text-wellness-300">
                              {entry.isCurrentUser 
                                ? getUserInitials()
                                : getInitials(entry.name)
                              }
                            </AvatarFallback>
                          </Avatar>

                          <div className="flex-1 min-w-0">
                            <div className={`font-medium ${entry.isCurrentUser ? "text-motivation-200" : "text-white"}`}>
                              {entry.name}
                              {entry.isCurrentUser && (
                                <Badge variant="outline" className="ml-2 text-xs border-motivation-400/30 text-motivation-200">
                                  Vous
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Section du milieu : Poids perdu, Défis complétés, Journées parfaites (cachées sur mobile) */}
                        <div className="flex items-center justify-between w-full text-body-sm text-white/70">
                          <span>
                            {entry.weightLost.toFixed(1)}kg perdus • {entry.challengesCompleted} défis
                          </span>
                          <span className="hidden md:block">
                            {entry.perfectDays} journées parfaites
                          </span>
                        </div>

                        {/* Section inférieure : Points totaux, Points cette semaine */}
                        <div className="flex items-center justify-between w-full">
                          <div className="text-right">
                            <div className="font-semibold text-white">{entry.totalScore}</div>
                            <div className="text-body-sm text-white/70">pts total</div>
                          </div>

                          <div className="text-right">
                            <div className="text-body-sm font-medium text-wellness-300">+{entry.weeklyScore}</div>
                            <div className="text-body-sm text-white/70">cette semaine</div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Système de points */}
            <Card className="glassmorphism">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2 text-heading-4 text-white">
                  <span>Comment ça marche</span>
                  <RulesModal 
                    trigger={
                      <Button variant="ghost" size="icon" className="h-6 w-6 text-white/70 hover:text-white">
                        <HelpCircle className="h-4 w-4" />
                      </Button>
                    }
                  />
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-body-sm">
                  {/* Afficher les règles principales */}
                  {rules.filter(rule => ['challenge_completion', 'daily_perfect_bonus', 'weight_loss_per_kg', 'burner_of_week_bonus'].includes(rule.rule_type)).map((rule) => (
                    <div key={rule.id} className="flex justify-between flex-wrap gap-2">
                      <span className="text-white/70 flex-1 min-w-0">{rule.description}</span>
                      <span className={`font-medium flex-shrink-0 ${rule.points > 0 ? 'text-wellness-300' : 'text-red-300'}`}>
                        {rule.points > 0 ? '+' : ''}{rule.points} points
                      </span>
                    </div>
                  ))}
                  
                  {/* Afficher les pénalités en rouge */}
                  {rules.filter(rule => rule.points < 0).map((rule) => (
                    <div key={rule.id} className="flex justify-between flex-wrap gap-2">
                      <span className="text-red-300 flex-1 min-w-0">{rule.description}</span>
                      <span className="font-medium text-red-300 flex-shrink-0">
                        {rule.points} points
                      </span>
                    </div>
                  ))}
                  
                  <div className="pt-2 border-t border-white/20">
                    <RulesModal 
                      trigger={
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="text-wellness-300 hover:text-wellness-200 p-0 h-auto"
                        >
                          Voir toutes les règles et conseils →
                        </Button>
                      }
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Message d'encouragement */}
            <Card className="glassmorphism border-wellness-400/30">
              <CardContent className="p-4 text-center">
                <div className="text-2xl mb-2">🏆</div>
                <p className="text-white/80 text-sm">
                  {leaderboardData.length > 0 
                    ? `${leaderboardData.length} participant${leaderboardData.length > 1 ? 's' : ''} dans le challenge ! Continuez vos efforts pour grimper dans le classement.`
                    : "Soyez le premier à rejoindre le challenge et à apparaître dans le classement !"
                  }
                </p>
                <p className="text-wellness-300 text-xs mt-2">
                  Les données sont mises à jour en temps réel
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Rankings;