import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Heart, Footprints, Droplets, Utensils, Dumbbell, Ban, Apple, Moon } from "lucide-react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ChallengeCarousel } from "@/components/ChallengeCarousel";
import { MobileWeeklyProgress } from "@/components/MobileWeeklyProgress";
import { MobileHeader } from "@/components/MobileHeader";
import { QuickChallengeIcons } from "@/components/QuickChallengeIcons";
import { NutriBot } from "@/components/NutriBot";
import { FeyButton } from "@/components/ui/fey-button";
import { useAuth } from "@/contexts/AuthContext";
import { challengeService } from "@/lib/supabase";
import { leaderboardService } from "@/lib/leaderboard";
import { toast } from "@/components/ui/sonner";

const Index = () => {
  const { user } = useAuth();
  const [completedChallenges, setCompletedChallenges] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(true);
  const [challengeRules, setChallengeRules] = useState<any[]>([]);

  // Obtenir la date du jour au format YYYY-MM-DD
  const getTodayDate = () => {
    return new Date().toISOString().split('T')[0];
  };

  const weeklyFocus = {
    title: "Semaine du Bien-être",
    description: "7 défis simples pour transformer votre quotidien",
    progress: (completedChallenges.size / 7) * 100,
    daysLeft: 5
  };

  // Définition des défis avec points dynamiques
  const [challenges, setChallenges] = useState([
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
      points: 10,
      color: "hydration",
      tips: "Gardez une bouteille d'eau près de vous, mettez des rappels sur votre téléphone"
    },
    {
      id: "healthy-meal",
      title: "Repas sain",
      description: "Préparez un repas équilibré",
      icon: Utensils,
      difficulty: "Moyen",
      points: 10,
      color: "nutrition",
      tips: "Privilégiez les légumes, protéines maigres et céréales complètes. Planifiez vos repas à l'avance"
    },
    {
      id: "exercise",
      title: "10 min d'exercice",
      description: "Faites 10 minutes d'activité physique",
      icon: Dumbbell,
      difficulty: "Facile",
      points: 10,
      color: "fitness",
      tips: "Yoga, étirements, marche rapide ou exercices de renforcement. Commencez petit !"
    },
    {
      id: "no-sugar",
      title: "Journée sans sucre",
      description: "Évitez le sucre ajouté aujourd'hui",
      icon: Ban,
      difficulty: "Moyen",
      points: 10,
      color: "detox",
      tips: "Lisez les étiquettes, privilégiez les fruits frais, préparez des collations saines"
    },
    {
      id: "fruits-veggies",
      title: "5 fruits & légumes",
      description: "Consommez 5 portions de fruits et légumes",
      icon: Apple,
      difficulty: "Moyen",
      points: 10,
      color: "vitamins",
      tips: "Variez les couleurs pour plus de nutriments. Ajoutez des légumes à chaque repas"
    },
    {
      id: "sleep",
      title: "8h de sommeil",
      description: "Dormez au moins 8 heures",
      icon: Moon,
      difficulty: "Moyen",
      points: 10,
      color: "rest",
      tips: "Éteignez les écrans 1h avant le coucher, créez une routine relaxante"
    }
  ]);

  // Charger les règles de points et les défis complétés
  useEffect(() => {
    const loadData = async () => {
      if (!user) {
        setIsLoading(false);
        return;
      }

      try {
        console.log('🔄 Chargement des données...');
        
        // Charger les règles de points et les défis complétés en parallèle
        const [rules, completedChallengeIds] = await Promise.all([
          leaderboardService.getChallengeRules(),
          challengeService.getCompletedChallenges(user.id, getTodayDate())
        ]);

        console.log('✅ Règles chargées:', rules);
        console.log('✅ Défis complétés aujourd\'hui:', completedChallengeIds);

        setChallengeRules(rules);
        setCompletedChallenges(new Set(completedChallengeIds));

        // Mettre à jour les points des défis avec les valeurs de la base de données
        const challengeCompletionRule = rules.find(rule => rule.rule_type === 'challenge_completion');
        if (challengeCompletionRule) {
          setChallenges(prevChallenges => 
            prevChallenges.map(challenge => ({
              ...challenge,
              points: challengeCompletionRule.points
            }))
          );
        }

      } catch (error) {
        console.error('❌ Erreur lors du chargement des données:', error);
        toast.error("Erreur lors du chargement des données");
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [user]);

  const toggleChallenge = async (challengeId: string) => {
    if (!user) {
      toast.error("Vous devez être connecté pour enregistrer vos défis");
      return;
    }

    const todayDate = getTodayDate();
    const isCurrentlyCompleted = completedChallenges.has(challengeId);
    const newCompletionStatus = !isCurrentlyCompleted;

    // Mise à jour optimiste de l'UI
    const newCompleted = new Set(completedChallenges);
    if (newCompletionStatus) {
      newCompleted.add(challengeId);
    } else {
      newCompleted.delete(challengeId);
    }
    setCompletedChallenges(newCompleted);

    try {
      console.log(`🎯 ${newCompletionStatus ? 'Complétion' : 'Annulation'} du défi:`, challengeId);
      
      const success = await challengeService.toggleChallenge(
        user.id, 
        challengeId, 
        todayDate, 
        newCompletionStatus
      );

      if (!success) {
        // Revenir à l'état précédent en cas d'erreur
        setCompletedChallenges(completedChallenges);
        toast.error("Erreur lors de la sauvegarde du défi");
        return;
      }

      // Afficher un message de succès avec les points dynamiques
      const challenge = challenges.find(c => c.id === challengeId);
      if (newCompletionStatus) {
        let message = `✅ Défi "${challenge?.title}" complété ! +${challenge?.points} points`;
        
        // Vérifier si c'est une journée parfaite
        if (newCompleted.size === challenges.length) {
          const perfectDayRule = challengeRules.find(rule => rule.rule_type === 'daily_perfect_bonus');
          const bonusPoints = perfectDayRule?.points || 10;
          message += ` + ${bonusPoints} points bonus (journée parfaite) !`;
        }
        
        toast.success(message);
      } else {
        toast.success(`↩️ Défi "${challenge?.title}" annulé`);
      }

      console.log('✅ Défi sauvegardé avec succès');
    } catch (error) {
      console.error('❌ Erreur lors de la sauvegarde du défi:', error);
      
      // Revenir à l'état précédent
      setCompletedChallenges(completedChallenges);
      toast.error("Erreur lors de la sauvegarde du défi");
    }
  };

  const totalPoints = challenges
    .filter(challenge => completedChallenges.has(challenge.id))
    .reduce((sum, challenge) => sum + challenge.points, 0);

  // Ajouter le bonus de journée parfaite si applicable
  const finalTotalPoints = completedChallenges.size === challenges.length 
    ? totalPoints + (challengeRules.find(rule => rule.rule_type === 'daily_perfect_bonus')?.points || 10)
    : totalPoints;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-foreground">Chargement des défis...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Effets de fond adaptatifs - utilise la variable CSS */}
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

      {/* Header mobile avec style adapté */}
      <div className="relative z-20">
        <MobileHeader 
          totalPoints={finalTotalPoints}
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
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-foreground/10 backdrop-blur-sm border border-border text-foreground rounded-full text-sm font-medium mb-4">
              <span className="text-lg">✨</span>
              Votre transformation commence ici
            </div>
            
            <h1 className="text-3xl font-bold text-foreground mb-3">
              Ta discipline est ta plus grande force.
            </h1>
            
            <p className="text-muted-foreground leading-relaxed">
              Chaque petit pas vous rapproche de vos objectifs
            </p>
            
            {/* Affichage de la date */}
            <div className="mt-2 text-muted-foreground text-sm">
              {new Date().toLocaleDateString('fr-FR', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </div>
          </motion.div>

          {/* Accès rapide aux défis - adapté au thème sombre */}
          <div className="mb-8">
            <QuickChallengeIcons 
              challenges={challenges}
              completedChallenges={completedChallenges}
              onToggle={toggleChallenge}
            />
          </div>

          {/* Bouton d'analyse - DÉPLACÉ ICI, au-dessus du carrousel */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="mb-4 flex justify-center"
          >
            <Link to="/analytics">
              <FeyButton className="text-foreground">
                + d'infos
              </FeyButton>
            </Link>
          </motion.div>

          {/* Carrousel de défis - SANS marge bottom et padding réduit */}
          <div className="mb-4">
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
            <Card className="border-0 shadow-2xl glassmorphism text-foreground">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg flex items-center gap-2 text-foreground">
                  <Heart className="h-6 w-6" />
                  Résumé de la journée
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <div className="text-2xl font-bold text-foreground">{finalTotalPoints}</div>
                    <div className="text-sm text-muted-foreground">Points</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-foreground">{completedChallenges.size}</div>
                    <div className="text-sm text-muted-foreground">Défis</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-foreground">
                      {Math.round((completedChallenges.size / challenges.length) * 100)}%
                    </div>
                    <div className="text-sm text-muted-foreground">Progression</div>
                  </div>
                </div>
                
                {/* Message de motivation basé sur la progression */}
                {completedChallenges.size === challenges.length && (
                  <div className="mt-4 p-3 bg-wellness-500/20 border border-wellness-400/30 rounded-lg text-center">
                    <p className="text-wellness-600 dark:text-wellness-200 text-sm font-medium">
                      🎉 Félicitations ! Journée parfaite ! Vous avez gagné un bonus de {challengeRules.find(rule => rule.rule_type === 'daily_perfect_bonus')?.points || 10} points !
                    </p>
                  </div>
                )}
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