import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { HelpCircle, Trophy, TrendingDown, TrendingUp, Calendar, Target, Zap } from "lucide-react";
import { leaderboardService, ChallengeRule } from "@/lib/leaderboard";

interface RulesModalProps {
  trigger?: React.ReactNode;
}

export const RulesModal = ({ trigger }: RulesModalProps) => {
  const [rules, setRules] = useState<ChallengeRule[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRules = async () => {
      try {
        const rulesData = await leaderboardService.getChallengeRules();
        setRules(rulesData);
      } catch (error) {
        console.error('Erreur lors du chargement des règles:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchRules();
  }, []);

  const getRuleIcon = (ruleType: string) => {
    switch (ruleType) {
      case 'challenge_completion':
      case 'challenge_completion_difficult':
        return <Target className="h-5 w-5" />;
      case 'weight_loss_per_kg':
        return <TrendingDown className="h-5 w-5 text-green-500" />;
      case 'weight_gain_per_kg':
        return <TrendingUp className="h-5 w-5 text-red-500" />;
      case 'missed_weigh_in':
        return <Calendar className="h-5 w-5 text-red-500" />;
      case 'perfect_week_bonus':
        return <Trophy className="h-5 w-5 text-yellow-500" />;
      case 'burner_of_week_bonus':
        return <Zap className="h-5 w-5 text-orange-500" />;
      default:
        return <Target className="h-5 w-5" />;
    }
  };

  const getRuleColor = (points: number) => {
    if (points > 0) {
      return "text-green-300";
    } else if (points < 0) {
      return "text-red-300";
    }
    return "text-white";
  };

  const defaultTrigger = (
    <Button variant="ghost" size="icon" className="text-white hover:bg-white/20">
      <HelpCircle className="h-5 w-5" />
    </Button>
  );

  return (
    <Dialog>
      <DialogTrigger asChild>
        {trigger || defaultTrigger}
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto bg-black/90 border-white/20 text-white">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl text-white">
            <Trophy className="h-6 w-6 text-yellow-500" />
            Règles du Challenge Wellness Weekly
          </DialogTitle>
          <DialogDescription className="text-white/70">
            Découvrez comment gagner des points et maximiser votre score
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Introduction */}
          <Card className="glassmorphism border-wellness-400/30">
            <CardHeader>
              <CardTitle className="text-lg text-wellness-300">
                🎯 Objectif du Challenge
              </CardTitle>
            </CardHeader>
            <CardContent className="text-white/80 space-y-2">
              <p>
                Le Challenge Wellness Weekly est conçu pour vous aider à adopter des habitudes saines 
                de manière progressive et durable. Chaque action positive vous rapporte des points !
              </p>
              <p className="text-wellness-200 font-medium">
                Plus vous êtes régulier et constant, plus vous gagnez de points et progressez dans le classement.
              </p>
            </CardContent>
          </Card>

          {/* Système de points */}
          <Card className="glassmorphism">
            <CardHeader>
              <CardTitle className="text-lg text-white">
                📊 Système de Points
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center text-white/70 py-4">
                  Chargement des règles...
                </div>
              ) : (
                <div className="space-y-3">
                  {rules.map((rule) => (
                    <div
                      key={rule.id}
                      className="flex items-center justify-between p-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        {getRuleIcon(rule.rule_type)}
                        <div>
                          <div className="text-white font-medium">{rule.description}</div>
                          {rule.details && (
                            <div className="text-sm text-white/60 mt-1">{rule.details}</div>
                          )}
                        </div>
                      </div>
                      <Badge 
                        variant="outline" 
                        className={`${getRuleColor(rule.points)} border-current font-bold`}
                      >
                        {rule.points > 0 ? '+' : ''}{rule.points} pts
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Conseils pour maximiser les points */}
          <Card className="glassmorphism border-energy-400/30">
            <CardHeader>
              <CardTitle className="text-lg text-energy-300">
                💡 Conseils pour Maximiser vos Points
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-white/80">
              <div className="space-y-2">
                <h4 className="font-semibold text-white">🎯 Régularité avant tout</h4>
                <p className="text-sm">
                  Complétez vos défis quotidiens chaque jour. La constance est plus importante 
                  que l'intensité ponctuelle.
                </p>
              </div>
              
              <div className="space-y-2">
                <h4 className="font-semibold text-white">⚖️ Pesée hebdomadaire</h4>
                <p className="text-sm">
                  N'oubliez jamais votre pesée du lundi ! Une pesée manquée vous coûte 30 points.
                  Même si le poids n'a pas bougé, enregistrez-le.
                </p>
              </div>
              
              <div className="space-y-2">
                <h4 className="font-semibold text-white">🏆 Viser la semaine parfaite</h4>
                <p className="text-sm">
                  Complétez tous les défis de la semaine pour obtenir le bonus de 10 points.
                  Cela peut faire la différence dans le classement !
                </p>
              </div>
              
              <div className="space-y-2">
                <h4 className="font-semibold text-white">🔥 Défis difficiles</h4>
                <p className="text-sm">
                  Les défis marqués comme "Difficile" (ex: journée sans sucre) rapportent 
                  plus de points. Relevez le défi !
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Pénalités importantes */}
          <Card className="glassmorphism border-red-400/30">
            <CardHeader>
              <CardTitle className="text-lg text-red-300">
                ⚠️ Attention aux Pénalités
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="p-3 bg-red-500/10 border border-red-400/30 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="h-5 w-5 text-red-400" />
                  <span className="font-semibold text-red-300">Prise de poids</span>
                </div>
                <p className="text-sm text-red-200">
                  Chaque kilogramme pris vous fait perdre 15 points. Restez motivé et 
                  n'abandonnez pas si cela arrive !
                </p>
              </div>
              
              <div className="p-3 bg-red-500/10 border border-red-400/30 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Calendar className="h-5 w-5 text-red-400" />
                  <span className="font-semibold text-red-300">Pesée manquée</span>
                </div>
                <p className="text-sm text-red-200">
                  Ne pas se peser le lundi coûte 30 points. Programmez un rappel pour 
                  ne jamais l'oublier !
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Motivation finale */}
          <Card className="glassmorphism border-wellness-400/30">
            <CardContent className="p-4 text-center">
              <div className="text-2xl mb-2">🌟</div>
              <p className="text-wellness-200 font-medium">
                Rappelez-vous : chaque petit effort compte ! Le challenge n'est pas une course, 
                mais un marathon vers une meilleure version de vous-même.
              </p>
              <p className="text-white/70 text-sm mt-2">
                Bonne chance et amusez-vous bien ! 💪
              </p>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
};