import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import { Heart, CheckCircle, Circle } from "lucide-react";

interface Challenge {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<any>;
  difficulty: string;
  points: number;
  color: string;
  tips: string;
}

interface GlassChallengeCardProps {
  challenge: Challenge;
  isCompleted: boolean;
  onToggle: (challengeId: string) => void;
}

export const GlassChallengeCard = ({ 
  challenge, 
  isCompleted, 
  onToggle 
}: GlassChallengeCardProps) => {
  const { icon: Icon } = challenge;

  // Mapping des couleurs pour les icônes (identique à QuickChallengeIcons)
  const iconColorsMap = {
    wellness: "text-wellness-400",
    energy: "text-energy-400",
    motivation: "text-motivation-400",
    hydration: "text-blue-400",
    nutrition: "text-green-400",
    fitness: "text-orange-400",
    detox: "text-red-400",
    vitamins: "text-emerald-400",
    rest: "text-indigo-400",
    pink: "text-pink-400",
  };

  const iconColor = iconColorsMap[challenge.color as keyof typeof iconColorsMap] || iconColorsMap.pink;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      <Card className={`
        relative overflow-visible glassmorphism
        shadow-xl border transition-all duration-300 hover:shadow-2xl
        ${isCompleted ? 'ring-2 ring-green-400/50' : ''}
      `}>
        {/* Effet de brillance glassmorphisme */}
        <div className="absolute inset-0 bg-gradient-to-r from-white/10 via-transparent to-white/5 pointer-events-none" />
        
        <CardHeader className="relative pb-3">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className={`
                p-3 rounded-xl bg-white/20 backdrop-blur-sm border border-white/30
                ${isCompleted ? 'bg-green-400/30 border-green-400/50' : ''}
              `}>
                <Icon className={`h-6 w-6 ${isCompleted ? 'text-wellness-400' : iconColor}`} />
              </div>
              <div>
                <CardTitle className="text-lg font-bold text-white">
                  {challenge.title}
                </CardTitle>
                <div className="flex items-center gap-2 mt-1">
                  <Badge 
                    variant="secondary" 
                    className="bg-white/20 text-white border-white/30 text-xs"
                  >
                    {challenge.difficulty}
                  </Badge>
                  <Badge 
                    variant="secondary" 
                    className="bg-wellness-500/20 text-wellness-200 border-wellness-400/30 text-xs"
                  >
                    {challenge.points} pts
                  </Badge>
                </div>
              </div>
            </div>
            
            <motion.div
              animate={{ 
                scale: isCompleted ? [1, 1.2, 1] : 1,
                rotate: isCompleted ? [0, 360] : 0 
              }}
              transition={{ duration: 0.5 }}
            >
              {isCompleted ? (
                <CheckCircle className="h-6 w-6 text-green-400" />
              ) : (
                <Circle className="h-6 w-6 text-white/60" />
              )}
            </motion.div>
          </div>
        </CardHeader>

        <CardContent className="relative pt-0">
          <p className="text-white/90 text-sm mb-4 leading-relaxed">
            {challenge.description}
          </p>
          
          {/* Conseils */}
          <div className="mb-4 p-3 bg-white/10 backdrop-blur-sm rounded-lg border border-white/20">
            <div className="flex items-center gap-2 mb-1">
              <Heart className="h-4 w-4 text-wellness-300" />
              <span className="text-xs font-medium text-wellness-200">Conseil</span>
            </div>
            <p className="text-xs text-white/80 leading-relaxed">
              {challenge.tips}
            </p>
          </div>

          <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Button
              variant={isCompleted ? "secondary" : "default"}
              size="lg"
              className={`
                w-full relative overflow-visible font-medium transition-all duration-300
                ${isCompleted 
                  ? 'bg-green-500/80 hover:bg-green-500/90 text-white border-green-400/50' 
                  : 'bg-white/20 hover:bg-white/30 text-white border-white/30 backdrop-blur-sm'
                }
              `}
              onClick={(e) => {
                e.stopPropagation();
                onToggle(challenge.id);
              }}
            >
              {/* Effet de brillance sur le bouton */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent transform translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
              
              <span className="relative flex items-center gap-2">
                {isCompleted ? (
                  <>
                    <CheckCircle className="h-4 w-4" />
                    Terminé !
                  </>
                ) : (
                  <>
                    <Circle className="h-4 w-4" />
                    Commencer
                  </>
                )}
              </span>
            </Button>
          </motion.div>
        </CardContent>
      </Card>
    </motion.div>
  );
};