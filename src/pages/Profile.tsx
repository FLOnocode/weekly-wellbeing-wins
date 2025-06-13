import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { User, Scale, Trophy, TrendingDown, Calendar, ArrowLeft, Medal, Target } from "lucide-react";
import { MobileHeader } from "@/components/MobileHeader";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

const Profile = () => {
  const userStats = {
    name: "Votre Profil",
    currentWeight: 72.5,
    previousWeight: 73.3,
    startWeight: 76.0,
    goalWeight: 68.0,
    rank: 4,
    totalPoints: 240,
    weeklyPoints: 35,
    weightLost: 3.5,
    joinDate: "2025-01-01",
    perfectWeeks: 2,
    totalWeeks: 4
  };

  const weightLossProgress = ((userStats.startWeight - userStats.currentWeight) / (userStats.startWeight - userStats.goalWeight)) * 100;
  const weeklyChange = userStats.previousWeight - userStats.currentWeight;

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
          totalPoints={userStats.totalPoints}
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
              <h1 className="text-heading-2 font-bold text-gradient">Profil</h1>
              <p className="text-body text-white/70">Votre progression personnelle</p>
            </div>
          </div>

          <div className="space-y-4">
            {/* Profil utilisateur */}
            <Card className="glassmorphism">
              <CardHeader className="pb-4">
                <div className="flex items-center gap-4">
                  <Avatar className="h-16 w-16 border-2 border-wellness-300">
                    <AvatarImage src="/placeholder.svg" />
                    <AvatarFallback className="bg-wellness-500/20 text-wellness-300 text-heading-4">
                      VP
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <CardTitle className="text-heading-4 text-white">{userStats.name}</CardTitle>
                    <CardDescription className="text-white/70">Membre depuis le {new Date(userStats.joinDate).toLocaleDateString("fr-FR")}</CardDescription>
                    <div className="flex items-center gap-2 mt-2">
                      <Badge className="bg-wellness-500/20 text-wellness-200 border-wellness-400/30">#{userStats.rank} au classement</Badge>
                      <Badge className="bg-motivation-500/20 text-motivation-200 border-motivation-400/30">{userStats.totalPoints} pts</Badge>
                    </div>
                  </div>
                </div>
              </CardHeader>
            </Card>

            {/* Statistiques de poids */}
            <Card className="glassmorphism">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2 text-heading-4 text-white">
                  <Scale className="h-5 w-5 text-wellness-500" />
                  <span>Progression du poids</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-3 bg-white/10 backdrop-blur-sm border border-wellness-400/30 rounded-lg">
                    <div className="text-heading-3 font-bold text-wellness-300">{userStats.currentWeight}kg</div>
                    <div className="text-body-sm text-white/70">Poids actuel</div>
                  </div>
                  <div className="text-center p-3 bg-white/10 backdrop-blur-sm border border-motivation-400/30 rounded-lg">
                    <div className="text-heading-3 font-bold text-motivation-300">{userStats.previousWeight}kg</div>
                    <div className="text-body-sm text-white/70">Semaine passée</div>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-body-sm">
                    <span className="text-white/70">Progression vers l'objectif</span>
                    <span className="font-medium text-white">{Math.round(weightLossProgress)}%</span>
                  </div>
                  <Progress value={weightLossProgress} className="h-2 bg-white/20" />
                  <div className="flex justify-between text-body-sm text-white/70">
                    <span>Départ: {userStats.startWeight}kg</span>
                    <span>Objectif: {userStats.goalWeight}kg</span>
                  </div>
                </div>

                <div className="flex items-center justify-between p-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg">
                  <div className="flex items-center gap-2">
                    <TrendingDown className="h-5 w-5 text-wellness-500" />
                    <span className="text-body font-medium text-white">Changement cette semaine</span>
                  </div>
                  <div className={`text-body font-bold ${weeklyChange > 0 ? "text-wellness-300" : "text-red-300"}`}>
                    {weeklyChange > 0 ? "-" : "+"}{Math.abs(weeklyChange)}kg
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Statistiques du défi */}
            <Card className="glassmorphism">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2 text-heading-4 text-white">
                  <Trophy className="h-5 w-5 text-yellow-500" />
                  <span>Statistiques du défi</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="text-center p-3 bg-white/10 backdrop-blur-sm border border-yellow-400/30 rounded-lg">
                    <div className="text-heading-3 font-bold text-yellow-300">{userStats.totalPoints}</div>
                    <div className="text-body-sm text-white/70">Points total</div>
                  </div>
                  <div className="text-center p-3 bg-white/10 backdrop-blur-sm border border-energy-400/30 rounded-lg">
                    <div className="text-heading-3 font-bold text-energy-300">{userStats.weeklyPoints}</div>
                    <div className="text-body-sm text-white/70">Cette semaine</div>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg">
                    <div className="flex items-center gap-2">
                      <Medal className="h-5 w-5 text-motivation-500" />
                      <span className="text-body text-white">Classement actuel</span>
                    </div>
                    <span className="text-body font-bold text-motivation-300">#{userStats.rank}</span>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg">
                    <div className="flex items-center gap-2">
                      <TrendingDown className="h-5 w-5 text-wellness-500" />
                      <span className="text-body text-white">Poids perdu au total</span>
                    </div>
                    <span className="text-body font-bold text-wellness-300">{userStats.weightLost}kg</span>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg">
                    <div className="flex items-center gap-2">
                      <Target className="h-5 w-5 text-energy-500" />
                      <span className="text-body text-white">Semaines parfaites</span>
                    </div>
                    <span className="text-body font-bold text-energy-300">{userStats.perfectWeeks}/{userStats.totalWeeks}</span>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-5 w-5 text-motivation-500" />
                      <span className="text-body text-white">Durée de participation</span>
                    </div>
                    <span className="text-body font-bold text-motivation-300">{userStats.totalWeeks} semaines</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Objectifs personnels */}
            <Card className="glassmorphism border-wellness-400/30">
              <CardHeader className="pb-4">
                <CardTitle className="text-heading-4 flex items-center gap-2 text-white">
                  <Target className="h-6 w-6 text-wellness-400" />
                  Vos objectifs
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-body text-white/70">Poids objectif</span>
                    <span className="text-body font-bold text-white">{userStats.goalWeight}kg</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-body text-white/70">Reste à perdre</span>
                    <span className="text-body font-bold text-white">{userStats.currentWeight - userStats.goalWeight}kg</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-body text-white/70">Progression</span>
                    <span className="text-body font-bold text-white">{Math.round(weightLossProgress)}%</span>
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

export default Profile;