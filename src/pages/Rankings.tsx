import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Trophy, Flame, Crown, Medal, Award, ArrowLeft } from "lucide-react";
import { MobileHeader } from "@/components/MobileHeader";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";

interface LeaderboardEntry {
  id: string;
  name: string;
  avatar?: string;
  totalScore: number;
  weeklyScore: number;
  weightLost: number;
  rank: number;
  isBurnerOfWeek?: boolean;
  isCurrentUser?: boolean;
}

const Rankings = () => {
  const { profile, user } = useAuth();

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

  const leaderboardData: LeaderboardEntry[] = [
    {
      id: "1",
      name: "Sarah Johnson",
      totalScore: 285,
      weeklyScore: 45,
      weightLost: 3.2,
      rank: 1,
      isBurnerOfWeek: true,
    },
    {
      id: "2",
      name: "Mike Chen",
      totalScore: 270,
      weeklyScore: 40,
      weightLost: 2.8,
      rank: 2,
    },
    {
      id: "3",
      name: "Emma Davis",
      totalScore: 255,
      weeklyScore: 38,
      weightLost: 2.5,
      rank: 3,
    },
    {
      id: "4",
      name: profile?.nickname || "Vous",
      totalScore: 240,
      weeklyScore: 35,
      weightLost: profile?.current_weight && profile?.goal_weight 
        ? Math.max(0, (profile.current_weight + 3.5) - profile.current_weight)
        : 2.2,
      rank: 4,
      isCurrentUser: true,
    },
    {
      id: "5",
      name: "Alex Rodriguez",
      totalScore: 225,
      weeklyScore: 32,
      weightLost: 2.0,
      rank: 5,
    },
    {
      id: "6",
      name: "Lisa Wang",
      totalScore: 210,
      weeklyScore: 30,
      weightLost: 1.8,
      rank: 6,
    },
  ];

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
          totalPoints={240}
          completedChallenges={5}
          totalChallenges={7}
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
              <h1 className="text-heading-2 font-bold text-gradient">Le Classement</h1>
              <p className="text-body text-white/70">Votre position dans le défi</p>
            </div>
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
                  <div className="flex items-center gap-4">
                    <Avatar className="h-12 w-12 border-2 border-energy-300">
                      <AvatarImage src={burnerOfWeek.avatar || "/placeholder.svg"} />
                      <AvatarFallback className="bg-energy-500/20 text-energy-300">
                        {burnerOfWeek.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="font-semibold text-white">{burnerOfWeek.name}</div>
                      <div className="text-body-sm text-energy-200">A perdu {burnerOfWeek.weightLost}kg cette semaine</div>
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
                <CardDescription className="text-white/70">Positions actuelles pour la Transformation de Janvier</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {leaderboardData.map((entry) => (
                    <div
                      key={entry.id}
                      className={`flex items-center gap-4 p-3 rounded-lg transition-colors ${
                        entry.isCurrentUser 
                          ? "bg-white/20 backdrop-blur-sm border border-motivation-400/30" 
                          : "bg-white/10 backdrop-blur-sm border border-white/20 md:hover:bg-white/15"
                      }`}
                    >
                      <div className="flex items-center justify-center w-8">{getRankIcon(entry.rank)}</div>

                      <Avatar className="h-10 w-10">
                        <AvatarImage src={entry.avatar || "/placeholder.svg"} />
                        <AvatarFallback className="bg-wellness-500/20 text-wellness-300">
                          {entry.isCurrentUser 
                            ? getUserInitials()
                            : entry.name
                                .split(" ")
                                .map((n) => n[0])
                                .join("")
                          }
                        </AvatarFallback>
                      </Avatar>

                      <div className="flex-1">
                        <div className={`font-medium ${entry.isCurrentUser ? "text-motivation-200" : "text-white"}`}>
                          {entry.name}
                          {entry.isCurrentUser && (
                            <Badge variant="outline" className="ml-2 text-xs border-motivation-400/30 text-motivation-200">
                              Vous
                            </Badge>
                          )}
                        </div>
                        <div className="text-body-sm text-white/70">{entry.weightLost}kg perdus</div>
                      </div>

                      <div className="text-right">
                        <div className="font-semibold text-white">{entry.totalScore}</div>
                        <div className="text-body-sm text-white/70">pts total</div>
                      </div>

                      <div className="text-right">
                        <div className="text-body-sm font-medium text-wellness-300">+{entry.weeklyScore}</div>
                        <div className="text-body-sm text-white/70">cette semaine</div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Système de points */}
            <Card className="glassmorphism">
              <CardHeader className="pb-4">
                <CardTitle className="text-heading-4 text-white">Comment ça marche</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-body-sm">
                  <div className="flex justify-between">
                    <span className="text-white/70">Perte de poids (par kg)</span>
                    <span className="font-medium text-wellness-300">15 points</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-white/70">Mission hebdomadaire réalisée</span>
                    <span className="font-medium text-motivation-300">5 points</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-white/70">Semaine parfaite (toutes les missions)</span>
                    <span className="font-medium text-energy-300">+10 bonus</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-white/70">Brûleur de la semaine</span>
                    <span className="font-medium text-energy-300">+25 bonus</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Rankings;