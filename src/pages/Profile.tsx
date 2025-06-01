
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { User, Scale, Trophy, TrendingDown, Calendar, ArrowLeft, Medal, Target } from "lucide-react";
import { MobileHeader } from "@/components/MobileHeader";
import { Link } from "react-router-dom";

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
    <div className="min-h-screen bg-gradient-to-br from-wellness-50 via-white to-motivation-50">
      <MobileHeader 
        totalPoints={userStats.totalPoints}
        completedChallenges={5}
        totalChallenges={7}
      />

      <div className="pt-20 pb-6">
        <div className="container mx-auto px-4 max-w-lg">
          {/* Header avec retour */}
          <div className="flex items-center gap-3 mb-6">
            <Link to="/">
              <Button variant="ghost" size="icon" className="text-wellness-600">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <div>
              <h1 className="text-heading-2 font-bold text-gradient">Profil</h1>
              <p className="text-body text-gray-600">Votre progression personnelle</p>
            </div>
          </div>

          <div className="space-y-4">
            {/* Profil utilisateur */}
            <Card className="border-0 shadow-lg">
              <CardHeader className="pb-4">
                <div className="flex items-center gap-4">
                  <Avatar className="h-16 w-16 border-2 border-wellness-300">
                    <AvatarImage src="/placeholder.svg" />
                    <AvatarFallback className="bg-wellness-100 text-wellness-700 text-heading-4">
                      VP
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <CardTitle className="text-heading-4 text-gray-900">{userStats.name}</CardTitle>
                    <CardDescription>Membre depuis le {new Date(userStats.joinDate).toLocaleDateString("fr-FR")}</CardDescription>
                    <div className="flex items-center gap-2 mt-2">
                      <Badge className="bg-wellness-100 text-wellness-700">#{userStats.rank} au classement</Badge>
                      <Badge className="bg-motivation-100 text-motivation-700">{userStats.totalPoints} pts</Badge>
                    </div>
                  </div>
                </div>
              </CardHeader>
            </Card>

            {/* Statistiques de poids */}
            <Card className="border-0 shadow-lg">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2 text-heading-4">
                  <Scale className="h-5 w-5 text-wellness-500" />
                  <span>Progression du poids</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-3 bg-wellness-50 rounded-lg">
                    <div className="text-heading-3 font-bold text-wellness-600">{userStats.currentWeight}kg</div>
                    <div className="text-body-sm text-gray-600">Poids actuel</div>
                  </div>
                  <div className="text-center p-3 bg-motivation-50 rounded-lg">
                    <div className="text-heading-3 font-bold text-motivation-600">{userStats.previousWeight}kg</div>
                    <div className="text-body-sm text-gray-600">Semaine passée</div>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-body-sm">
                    <span>Progression vers l'objectif</span>
                    <span className="font-medium">{Math.round(weightLossProgress)}%</span>
                  </div>
                  <Progress value={weightLossProgress} className="h-2" />
                  <div className="flex justify-between text-body-sm text-gray-600">
                    <span>Départ: {userStats.startWeight}kg</span>
                    <span>Objectif: {userStats.goalWeight}kg</span>
                  </div>
                </div>

                <div className="flex items-center justify-between p-3 bg-gradient-to-r from-wellness-50 to-motivation-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <TrendingDown className="h-5 w-5 text-wellness-500" />
                    <span className="text-body font-medium">Changement cette semaine</span>
                  </div>
                  <div className={`text-body font-bold ${weeklyChange > 0 ? "text-wellness-600" : "text-red-600"}`}>
                    {weeklyChange > 0 ? "-" : "+"}{Math.abs(weeklyChange)}kg
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Statistiques du défi */}
            <Card className="border-0 shadow-lg">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2 text-heading-4">
                  <Trophy className="h-5 w-5 text-yellow-500" />
                  <span>Statistiques du défi</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="text-center p-3 bg-yellow-50 rounded-lg">
                    <div className="text-heading-3 font-bold text-yellow-600">{userStats.totalPoints}</div>
                    <div className="text-body-sm text-gray-600">Points total</div>
                  </div>
                  <div className="text-center p-3 bg-energy-50 rounded-lg">
                    <div className="text-heading-3 font-bold text-energy-600">{userStats.weeklyPoints}</div>
                    <div className="text-body-sm text-gray-600">Cette semaine</div>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-2">
                      <Medal className="h-5 w-5 text-motivation-500" />
                      <span className="text-body">Classement actuel</span>
                    </div>
                    <span className="text-body font-bold text-motivation-600">#{userStats.rank}</span>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-2">
                      <TrendingDown className="h-5 w-5 text-wellness-500" />
                      <span className="text-body">Poids perdu au total</span>
                    </div>
                    <span className="text-body font-bold text-wellness-600">{userStats.weightLost}kg</span>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-2">
                      <Target className="h-5 w-5 text-energy-500" />
                      <span className="text-body">Semaines parfaites</span>
                    </div>
                    <span className="text-body font-bold text-energy-600">{userStats.perfectWeeks}/{userStats.totalWeeks}</span>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-5 w-5 text-motivation-500" />
                      <span className="text-body">Durée de participation</span>
                    </div>
                    <span className="text-body font-bold text-motivation-600">{userStats.totalWeeks} semaines</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Objectifs personnels */}
            <Card className="border-0 shadow-lg bg-gradient-to-r from-wellness-500 to-motivation-500 text-white">
              <CardHeader className="pb-4">
                <CardTitle className="text-heading-4 flex items-center gap-2">
                  <Target className="h-6 w-6" />
                  Vos objectifs
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-body">Poids objectif</span>
                    <span className="text-body font-bold">{userStats.goalWeight}kg</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-body">Reste à perdre</span>
                    <span className="text-body font-bold">{userStats.currentWeight - userStats.goalWeight}kg</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-body">Progression</span>
                    <span className="text-body font-bold">{Math.round(weightLossProgress)}%</span>
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
