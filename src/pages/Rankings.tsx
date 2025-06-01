
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Trophy, Flame, Crown, Medal, Award, ArrowLeft } from "lucide-react";
import { MobileHeader } from "@/components/MobileHeader";
import { Link } from "react-router-dom";

interface LeaderboardEntry {
  id: string;
  name: string;
  avatar?: string;
  totalScore: number;
  weeklyScore: number;
  weightLost: number;
  rank: number;
  isBurnerOfWeek?: boolean;
}

const Rankings = () => {
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
      name: "Vous",
      totalScore: 240,
      weeklyScore: 35,
      weightLost: 2.2,
      rank: 4,
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
        return <span className="text-body-sm font-bold text-gray-600">#{rank}</span>;
    }
  };

  const burnerOfWeek = leaderboardData.find((entry) => entry.isBurnerOfWeek);

  return (
    <div className="min-h-screen bg-gradient-to-br from-wellness-50 via-white to-motivation-50">
      <MobileHeader 
        totalPoints={240}
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
              <h1 className="text-heading-2 font-bold text-gradient">Le Classement</h1>
              <p className="text-body text-gray-600">Votre position dans le défi</p>
            </div>
          </div>

          <div className="space-y-4">
            {/* Brûleur de la semaine */}
            {burnerOfWeek && (
              <Card className="bg-gradient-to-r from-energy-50 to-energy-100 border-energy-200 shadow-lg">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center gap-2 text-heading-4">
                    <Flame className="h-6 w-6 text-energy-500" />
                    <span className="text-energy-700">Brûleur de la semaine</span>
                  </CardTitle>
                  <CardDescription className="text-energy-600">Plus de poids perdu cette semaine</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-4">
                    <Avatar className="h-12 w-12 border-2 border-energy-300">
                      <AvatarImage src={burnerOfWeek.avatar || "/placeholder.svg"} />
                      <AvatarFallback className="bg-energy-100 text-energy-700">
                        {burnerOfWeek.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="font-semibold text-energy-900">{burnerOfWeek.name}</div>
                      <div className="text-body-sm text-energy-700">A perdu {burnerOfWeek.weightLost}kg cette semaine</div>
                    </div>
                    <Badge className="bg-energy-500 hover:bg-energy-600 text-white">{burnerOfWeek.weeklyScore} pts</Badge>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Classement général */}
            <Card className="border-0 shadow-lg">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2 text-heading-4">
                  <Trophy className="h-5 w-5 text-yellow-500" />
                  <span>Classement du défi</span>
                </CardTitle>
                <CardDescription>Positions actuelles pour la Transformation de Janvier</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {leaderboardData.map((entry) => (
                    <div
                      key={entry.id}
                      className={`flex items-center gap-4 p-3 rounded-lg transition-colors ${
                        entry.name === "Vous" 
                          ? "bg-gradient-to-r from-motivation-50 to-wellness-50 border border-motivation-200" 
                          : "bg-gray-50 hover:bg-gray-100"
                      }`}
                    >
                      <div className="flex items-center justify-center w-8">{getRankIcon(entry.rank)}</div>

                      <Avatar className="h-10 w-10">
                        <AvatarImage src={entry.avatar || "/placeholder.svg"} />
                        <AvatarFallback className="bg-wellness-100 text-wellness-700">
                          {entry.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </AvatarFallback>
                      </Avatar>

                      <div className="flex-1">
                        <div className={`font-medium ${entry.name === "Vous" ? "text-motivation-900" : "text-gray-900"}`}>
                          {entry.name}
                          {entry.name === "Vous" && (
                            <Badge variant="outline" className="ml-2 text-xs border-motivation-200 text-motivation-700">
                              Vous
                            </Badge>
                          )}
                        </div>
                        <div className="text-body-sm text-gray-600">{entry.weightLost}kg perdus</div>
                      </div>

                      <div className="text-right">
                        <div className="font-semibold text-gray-900">{entry.totalScore}</div>
                        <div className="text-body-sm text-gray-600">pts total</div>
                      </div>

                      <div className="text-right">
                        <div className="text-body-sm font-medium text-wellness-600">+{entry.weeklyScore}</div>
                        <div className="text-body-sm text-gray-600">cette semaine</div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Système de points */}
            <Card className="border-0 shadow-lg">
              <CardHeader className="pb-4">
                <CardTitle className="text-heading-4">Comment ça marche</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-body-sm">
                  <div className="flex justify-between">
                    <span>Perte de poids (par kg)</span>
                    <span className="font-medium text-wellness-600">15 points</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Mission hebdomadaire réalisée</span>
                    <span className="font-medium text-motivation-600">5 points</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Semaine parfaite (toutes les missions)</span>
                    <span className="font-medium text-energy-600">+10 bonus</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Brûleur de la semaine</span>
                    <span className="font-medium text-energy-600">+25 bonus</span>
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
