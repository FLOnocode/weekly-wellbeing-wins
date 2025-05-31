import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Check, Calendar, Heart, Utensils, Clock, Bell, Leaf, Footprints, Droplets, Dumbbell, X, Apple, Moon } from "lucide-react";
import { MobileChallengeCard } from "@/components/MobileChallengeCard";
import { MobileWeeklyProgress } from "@/components/MobileWeeklyProgress";
import { MobileHeader } from "@/components/MobileHeader";

const Index = () => {
  const [completedChallenges, setCompletedChallenges] = useState<Set<string>>(new Set());

  const weeklyFocus = {
    title: "Semaine du Bien-être",
    description: "7 défis simples pour transformer votre quotidien",
    progress: (completedChallenges.size / 7) * 100,
    daysLeft: 5
  };

  const challenges = [
    {
      id: "steps",
      title: "10 000 pas",
      description: "Marchez 10 000 pas aujourd'hui",
      icon: Footprints,
      difficulty: "Facile",
      points: 10,
      color: "wellness",
      tips: "Prenez les escaliers, marchez pendant vos appels, descendez un arrêt plus tôt"
    },
    {
      id: "water",
      title: "1,5L d'eau",
      description: "Buvez au moins 1,5 litres d'eau",
      icon: Droplets,
      difficulty: "Facile",
      points: 8,
      color: "hydration",
      tips: "Gardez une bouteille d'eau près de vous, mettez des rappels sur votre téléphone"
    },
    {
      id: "healthy-meal",
      title: "Repas sain",
      description: "Préparez un repas équilibré",
      icon: Utensils,
      difficulty: "Moyen",
      points: 15,
      color: "nutrition",
      tips: "Privilégiez les légumes, protéines maigres et céréales complètes. Planifiez vos repas à l'avance"
    },
    {
      id: "exercise",
      title: "10 min d'exercice",
      description: "Faites 10 minutes d'activité physique",
      icon: Dumbbell,
      difficulty: "Facile",
      points: 12,
      color: "fitness",
      tips: "Yoga, étirements, marche rapide ou exercices de renforcement. Commencez petit !"
    },
    {
      id: "no-sugar",
      title: "Journée sans sucre",
      description: "Évitez le sucre ajouté aujourd'hui",
      icon: X,
      difficulty: "Difficile",
      points: 20,
      color: "detox",
      tips: "Lisez les étiquettes, privilégiez les fruits frais, préparez des collations saines"
    },
    {
      id: "fruits-veggies",
      title: "5 fruits & légumes",
      description: "Consommez 5 portions de fruits et légumes",
      icon: Apple,
      difficulty: "Moyen",
      points: 15,
      color: "vitamins",
      tips: "Variez les couleurs pour plus de nutriments. Ajoutez des légumes à chaque repas"
    },
    {
      id: "sleep",
      title: "8h de sommeil",
      description: "Dormez au moins 8 heures",
      icon: Moon,
      difficulty: "Moyen",
      points: 12,
      color: "rest",
      tips: "Éteignez les écrans 1h avant le coucher, créez une routine relaxante"
    }
  ];

  const toggleChallenge = (challengeId: string) => {
    const newCompleted = new Set(completedChallenges);
    if (newCompleted.has(challengeId)) {
      newCompleted.delete(challengeId);
    } else {
      newCompleted.add(challengeId);
    }
    setCompletedChallenges(newCompleted);
  };

  const totalPoints = challenges
    .filter(challenge => completedChallenges.has(challenge.id))
    .reduce((sum, challenge) => sum + challenge.points, 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-wellness-50 via-white to-motivation-50">
      {/* Header mobile fixe */}
      <MobileHeader 
        totalPoints={totalPoints}
        completedChallenges={completedChallenges.size}
        totalChallenges={challenges.length}
      />

      {/* Contenu principal avec padding pour le header fixe */}
      <div className="pt-20 pb-6">
        <div className="container mx-auto px-4 max-w-lg">
          {/* Message de motivation */}
          <div className="text-center mb-6 px-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-wellness-100 text-wellness-700 rounded-full text-body-sm font-medium mb-3">
              <span className="text-lg">✨</span>
              Votre transformation commence ici
            </div>
            
            <h1 className="text-heading-2 font-bold text-gradient mb-2">
              Défis du jour
            </h1>
            
            <p className="text-body text-gray-600 leading-relaxed">
              Chaque petit pas vous rapproche de vos objectifs
            </p>
          </div>

          {/* Progression hebdomadaire */}
          <div className="mb-6">
            <MobileWeeklyProgress 
              weeklyFocus={weeklyFocus}
              completedCount={completedChallenges.size}
              totalCount={challenges.length}
            />
          </div>

          {/* Liste des défis */}
          <div className="space-y-4 mb-6">
            {challenges.map((challenge) => (
              <MobileChallengeCard
                key={challenge.id}
                challenge={challenge}
                isCompleted={completedChallenges.has(challenge.id)}
                onToggle={toggleChallenge}
              />
            ))}
          </div>

          {/* Résumé quotidien */}
          <Card className="border-0 shadow-lg bg-gradient-to-r from-wellness-500 to-motivation-500 text-white">
            <CardHeader className="pb-4">
              <CardTitle className="text-heading-4 flex items-center gap-2">
                <Heart className="h-6 w-6" />
                Résumé de la journée
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <div className="text-heading-3 font-bold">{totalPoints}</div>
                  <div className="text-body-sm opacity-90">Points</div>
                </div>
                <div>
                  <div className="text-heading-3 font-bold">{completedChallenges.size}</div>
                  <div className="text-body-sm opacity-90">Défis</div>
                </div>
                <div>
                  <div className="text-heading-3 font-bold">
                    {Math.round((completedChallenges.size / challenges.length) * 100)}%
                  </div>
                  <div className="text-body-sm opacity-90">Progression</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Index;
