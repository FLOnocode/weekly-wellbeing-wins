
import React, { useState } from 'react';
import { motion, useMotionValue, useTransform } from 'framer-motion';
import { Check, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface Challenge {
  id: string;
  title: string;
  description: string;
  icon: typeof Check;
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

const difficultyColors = {
  "Facile": "bg-wellness-100 text-wellness-700",
  "Moyen": "bg-energy-100 text-energy-700",
  "Difficile": "bg-red-100 text-red-700"
};

const colorClasses = {
  wellness: "from-wellness-400 to-wellness-600",
  energy: "from-energy-400 to-energy-600", 
  motivation: "from-motivation-400 to-motivation-600",
  hydration: "from-blue-400 to-blue-600",
  nutrition: "from-green-400 to-green-600",
  fitness: "from-orange-400 to-orange-600",
  detox: "from-red-400 to-red-600",
  vitamins: "from-emerald-400 to-emerald-600",
  rest: "from-indigo-400 to-indigo-600",
  pink: "from-pink-400 to-pink-600"
};

export const GlassChallengeCard = ({ challenge, isCompleted, onToggle }: GlassChallengeCardProps) => {
  const [showTips, setShowTips] = useState(false);
  const Icon = challenge.icon;

  // Animation pour l'effet 3D
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const rotateX = useTransform(mouseY, [-200, 200], [5, -5]);
  const rotateY = useTransform(mouseX, [-200, 200], [-5, 5]);

  const handleMouseMove = (e: React.MouseEvent) => {
    const rect = e.currentTarget.getBoundingClientRect();
    mouseX.set(e.clientX - rect.left - rect.width / 2);
    mouseY.set(e.clientY - rect.top - rect.height / 2);
  };

  const handleMouseLeave = () => {
    mouseX.set(0);
    mouseY.set(0);
  };

  return (
    <motion.div
      className="relative h-full w-full"
      style={{ perspective: 1000 }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <motion.div
        className="relative h-full"
        style={{ rotateX, rotateY }}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        whileHover={{ z: 10 }}
      >
        <div className="relative group h-full">
          {/* Effet de lueur autour de la carte */}
          <motion.div 
            className="absolute -inset-[1px] rounded-2xl opacity-0 group-hover:opacity-70 transition-opacity duration-700"
            animate={{
              boxShadow: [
                "0 0 10px 2px rgba(34, 197, 94, 0.1)",
                "0 0 20px 5px rgba(34, 197, 94, 0.2)",
                "0 0 10px 2px rgba(34, 197, 94, 0.1)"
              ],
            }}
            transition={{ 
              duration: 4, 
              repeat: Infinity, 
              ease: "easeInOut", 
              repeatType: "mirror" 
            }}
          />

          {/* Effets de lumière animés sur les bordures */}
          <div className="absolute -inset-[1px] rounded-2xl overflow-hidden">
            {/* Faisceau lumineux du haut */}
            <motion.div 
              className="absolute top-0 left-0 h-[2px] w-[40%] bg-gradient-to-r from-transparent via-wellness-400 to-transparent opacity-60"
              animate={{ 
                left: ["-40%", "100%"],
                opacity: [0.3, 0.8, 0.3],
              }}
              transition={{ 
                left: {
                  duration: 3, 
                  ease: "easeInOut", 
                  repeat: Infinity,
                  repeatDelay: 2
                },
                opacity: {
                  duration: 1.5,
                  repeat: Infinity,
                  repeatType: "mirror"
                }
              }}
            />
          </div>

          {/* Carte principale avec effet glassmorphisme */}
          <div className="relative bg-black/30 backdrop-blur-xl rounded-2xl p-6 border border-white/10 shadow-2xl overflow-hidden h-full flex flex-col">
            {/* Motif subtil en arrière-plan */}
            <div className="absolute inset-0 opacity-[0.02]" 
              style={{
                backgroundImage: `linear-gradient(135deg, white 0.5px, transparent 0.5px), linear-gradient(45deg, white 0.5px, transparent 0.5px)`,
                backgroundSize: '20px 20px'
              }}
            />

            {/* En-tête avec icône et badges */}
            <div className="relative flex items-start justify-between mb-4">
              <motion.div 
                className={cn(
                  "p-3 rounded-xl bg-gradient-to-br shadow-lg relative overflow-hidden",
                  colorClasses[challenge.color as keyof typeof colorClasses]
                )}
                whileHover={{ scale: 1.05 }}
                transition={{ type: "spring", stiffness: 400, damping: 25 }}
              >
                <Icon className="h-6 w-6 text-white relative z-10" />
                {/* Effet de lueur interne */}
                <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent opacity-50" />
              </motion.div>
              
              <div className="flex flex-col gap-2 items-end">
                <Badge 
                  variant="secondary" 
                  className={cn(
                    "text-xs font-medium backdrop-blur-sm bg-white/10 border-white/20",
                    difficultyColors[challenge.difficulty as keyof typeof difficultyColors]
                  )}
                >
                  {challenge.difficulty}
                </Badge>
                <Badge 
                  variant="outline" 
                  className="text-xs font-bold bg-white/5 border-white/20 text-white backdrop-blur-sm"
                >
                  +{challenge.points} pts
                </Badge>
              </div>
            </div>

            {/* Titre et description */}
            <div className="flex-1 space-y-3">
              <div className="flex items-center gap-3">
                <h3 className="text-lg font-semibold text-white leading-tight flex-1">
                  {challenge.title}
                </h3>
                {isCompleted && (
                  <motion.div 
                    className="h-6 w-6 bg-wellness-500 rounded-full flex items-center justify-center shadow-lg"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 400, damping: 25 }}
                  >
                    <Check className="h-4 w-4 text-white" />
                  </motion.div>
                )}
              </div>
              
              <p className="text-white/70 text-sm leading-relaxed">
                {challenge.description}
              </p>

              {/* Section conseils expandable */}
              <motion.button
                onClick={() => setShowTips(!showTips)}
                className="w-full p-3 bg-white/5 rounded-lg flex items-center justify-between border border-white/10 hover:bg-white/10 transition-all duration-300"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-white/80">💡 Conseil</span>
                </div>
                <ChevronRight 
                  className={cn(
                    "h-4 w-4 text-white/60 transition-transform duration-300",
                    showTips && "rotate-90"
                  )} 
                />
              </motion.button>
              
              {/* Conseils avec animation */}
              <motion.div
                initial={false}
                animate={{ height: showTips ? "auto" : 0, opacity: showTips ? 1 : 0 }}
                transition={{ duration: 0.3, ease: "easeInOut" }}
                className="overflow-hidden"
              >
                <div className="p-3 bg-white/5 rounded-lg border-l-4 border-wellness-400 mt-2">
                  <p className="text-sm text-white/70 leading-relaxed">{challenge.tips}</p>
                </div>
              </motion.div>
            </div>

            {/* Bouton d'action */}
            <motion.div className="mt-6">
              <Button 
                variant={isCompleted ? "secondary" : "default"}
                size="lg"
                className={cn(
                  "w-full h-12 transition-all duration-300 font-medium relative group/button overflow-hidden",
                  isCompleted 
                    ? "bg-wellness-500/20 text-wellness-300 border-wellness-400/30 hover:bg-wellness-500/30" 
                    : "bg-white text-black hover:bg-white/90",
                )}
                onClick={(e) => {
                  e.stopPropagation();
                  onToggle(challenge.id);
                }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                {/* Effet d'animation sur le bouton */}
                {!isCompleted && (
                  <motion.div 
                    className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/30 to-white/0"
                    animate={{ 
                      x: ['-100%', '100%'],
                    }}
                    transition={{ 
                      duration: 2, 
                      ease: "easeInOut", 
                      repeat: Infinity,
                      repeatDelay: 3
                    }}
                  />
                )}
                
                {isCompleted ? (
                  <>
                    <Check className="h-5 w-5 mr-2" />
                    Terminé !
                  </>
                ) : (
                  "Commencer le défi"
                )}
              </Button>
            </motion.div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};
