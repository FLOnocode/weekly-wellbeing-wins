
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Heart, Footprints, Droplets, Utensils, Dumbbell, Ban, Apple, Moon } from "lucide-react";
import { motion } from "framer-motion";
import { ChallengeCarousel } from "@/components/ChallengeCarousel";
import { MobileWeeklyProgress } from "@/components/MobileWeeklyProgress";
import { MobileHeader } from "@/components/MobileHeader";
import { QuickChallengeIcons } from "@/components/QuickChallengeIcons";
import { NutriBot } from "@/components/NutriBot";

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
      color: "pink",
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
      icon: Ban,
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
    <div className="min-h-screen bg-black relative overflow-hidden">
      {/* Effets de fond similaires au sign-in-card */}
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

      {/* Header mobile avec style adapté */}
      <div className="relative z-20">
        <MobileHeader 
          totalPoints={totalPoints}
          completedChallenges={completedChallenges.size}
          totalChallenges={challenges.length}
        />
      </div>

      {/* Contenu principal avec marge ajustée pour éviter les conflits */}
      <div className="relative z-10 pt-24 pb-6">
        <div className="container mx-auto px-4 max-w-lg">
          {/* Message de motivation avec style glassmorphisme */}
          <motion.div 
            className="text-center mb-8 px-2"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm border border-white/20 text-white rounded-full text-sm font-medium mb-4">
              <span className="text-lg">✨</span>
              Votre transformation commence ici
            </div>
            
            <h1 className="text-3xl font-bold text-white mb-3">
              Défis du jour
            </h1>
            
            <p className="text-white/70 leading-relaxed">
              Chaque petit pas vous rapproche de vos objectifs
            </p>
          </motion.div>

          {/* Accès rapide aux défis - adapté au thème sombre */}
          <div className="mb-8">
            <QuickChallengeIcons 
              challenges={challenges}
              completedChallenges={completedChallenges}
              onToggle={toggleChallenge}
            />
          </div>

          {/* Nouveau carrousel de défis */}
          <div className="mb-8">
            <ChallengeCarousel 
              challenges={challenges}
              completedChallenges={completedChallenges}
              onToggle={toggleChallenge}
            />
          </div>

          {/* Résumé quotidien avec style glassmorphisme */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            <Card className="border-0 shadow-2xl bg-white/10 backdrop-blur-xl border border-white/20 text-white">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg flex items-center gap-2 text-white">
                  <Heart className="h-6 w-6" />
                  Résumé de la journée
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <div className="text-2xl font-bold text-white">{totalPoints}</div>
                    <div className="text-sm text-white/70">Points</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-white">{completedChallenges.size}</div>
                    <div className="text-sm text-white/70">Défis</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-white">
                      {Math.round((completedChallenges.size / challenges.length) * 100)}%
                    </div>
                    <div className="text-sm text-white/70">Progression</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>

      {/* NutriBot - Conseiller nutrition */}
      <NutriBot />
    </div>
  );
};

export default Index;
