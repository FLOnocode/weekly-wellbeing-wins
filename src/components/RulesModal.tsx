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
import { HelpCircle, Trophy, TrendingDown, TrendingUp, Calendar, Target, Zap, CheckCircle, Minus } from "lucide-react";
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
        return <Target className="h-5 w-5 text-wellness-400" />;
      case 'daily_perfect_bonus':
        return <CheckCircle className="h-5 w-5 text-wellness-400" />;
      case 'weight_loss_per_kg':
        return <TrendingDown className="h-5 w-5 text-wellness-500" />;
      case 'weight_gain_per_kg':
        return <TrendingUp className="h-5 w-5 text-red-500" />;
      case 'no_weight_change':
        return <Minus className="h-5 w-5 text-gray-400" />;
      case 'missed_weigh_in':
        return <Calendar className="h-5 w-5 text-red-500" />;
      case 'burner_of_week_bonus':
        return <Zap className="h-5 w-5 text-orange-500" />;
      default:
        return <Target className="h-5 w-5" />;
    }
  };

  const getRuleColor = (points: number) => {
    if (points > 0) {
      return "text-wellness-300 border-wellness-400/30";
    } else if (points < 0) {
      return "text-red-300 border-red-400/30";
    }
    return "text-gray-300 border-gray-400/30";
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
            Règles du Challenge Fit Together
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
                Le Challenge Fit Together est conçu pour vous aider à adopter des habitudes saines 
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
                      <div className="flex items-center gap-3 flex-1">
                        {getRuleIcon(rule.rule_type)}
                        <div className="flex-1">
                          <div className="text-white font-medium">{rule.description}</div>
                          {rule.details && (
                            <div className="text-sm text-white/60 mt-1">{rule.details}</div>
                          )}
                        </div>
                      </div>
                      <div className="flex-shrink-0 ml-4">
                        <Badge 
                          variant="outline" 
                          className={`${getRuleColor(rule.points)} font-bold text-center min-w-[80px] justify-center`}
                        >
                          {rule.points > 0 ? '+' : ''}{rule.points} pts
                        </Badge>
                      </div>
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
                <h4 className="font-semibold text-white">✅ Viser la journée parfaite</h4>
                <p className="text-sm">
                  Complétez TOUS les défis d'une journée pour obtenir le bonus de 10 points.
                  C'est le nouveau système qui remplace les bonus hebdomadaires !
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
                <h4 className="font-semibold text-white">📈 Progression constante</h4>
                <p className="text-sm">
                  Tous les défis valent maintenant le même nombre de points (10 points chacun).
                  Concentrez-vous sur la régularité plutôt que sur la difficulté.
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
                  <span className="font-semibold text-red-300">Prise de poids (-15 pts/kg)</span>
                </div>
                <p className="text-sm text-red-200">
                  Chaque kilogramme pris vous fait perdre 15 points. Restez motivé et 
                  n'abandonnez pas si cela arrive !
                </p>
              </div>
              
              <div className="p-3 bg-red-500/10 border border-red-400/30 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Calendar className="h-5 w-5 text-red-400" />
                  <span className="font-semibold text-red-300">Pesée manquée le lundi (-30 pts)</span>
                </div>
                <p className="text-sm text-red-200">
                  Ne pas se peser le lundi coûte 30 points. Programmez un rappel pour 
                  ne jamais l'oublier !
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Nouveautés du système */}
          <Card className="glassmorphism border-wellness-400/30">
            <CardHeader>
              <CardTitle className="text-lg text-wellness-300">
                🆕 Nouveautés du Système de Points
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-white/80">
              <div className="p-3 bg-wellness-500/10 border border-wellness-400/30 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle className="h-5 w-5 text-wellness-400" />
                  <span className="font-semibold text-wellness-300">Bonus journée parfaite</span>
                </div>
                <p className="text-sm text-wellness-200">
                  Nouveau ! Complétez 100% des défis d'une journée pour gagner 10 points bonus.
                  Plus accessible que l'ancien bonus hebdomadaire !
                </p>
              </div>
              
              <div className="p-3 bg-blue-500/10 border border-blue-400/30 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Target className="h-5 w-5 text-blue-400" />
                  <span className="font-semibold text-blue-300">Égalité des défis</span>
                </div>
                <p className="text-sm text-blue-200">
                  Tous les défis quotidiens valent maintenant 10 points, qu'ils soient faciles ou difficiles.
                  L'important est la régularité !
                </p>
              </div>

              <div className="p-3 bg-gray-500/10 border border-gray-400/30 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Minus className="h-5 w-5 text-gray-400" />
                  <span className="font-semibold text-gray-300">Stabilité du poids</span>
                </div>
                <p className="text-sm text-gray-200">
                  Nouveau ! Si votre poids reste stable d'une semaine à l'autre, vous gagnez 0 point.
                  Ni bonus, ni pénalité - la stabilité est neutre.
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