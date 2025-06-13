import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import {
  Check,
  Footprints,
  Droplets,
  Utensils,
  Dumbbell,
  Ban,
  Apple,
  Moon,
} from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";

interface Challenge {
  id: string;
  title: string;
  icon: typeof Footprints;
  color: string;
}

interface QuickChallengeIconsProps {
  challenges: Challenge[];
  completedChallenges: Set<string>;
  onToggle: (challengeId: string) => void;
}

const iconColors = {
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

export const QuickChallengeIcons = ({
  challenges,
  completedChallenges,
  onToggle,
}: QuickChallengeIconsProps) => {
  const isMobile = useIsMobile();

  return (
    <motion.div 
      className="mb-6 px-2"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.2 }}
    >
      <h3 className="text-sm font-medium text-white/80 mb-4 text-center">
        Accès rapide aux défis
      </h3>

      <div className="grid grid-cols-4 gap-3 max-w-xs mx-auto">
        {challenges.map((challenge, index) => {
          const Icon = challenge.icon;
          const isCompleted = completedChallenges.has(challenge.id);

          return (
            <motion.button
              key={challenge.id}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onToggle(challenge.id);
              }}
              className={cn(
                "relative p-3 rounded-xl transition-all duration-300 touch-manipulation group",
                "bg-white/10 backdrop-blur-sm border border-white/20 shadow-lg md:hover:shadow-xl active:shadow-md",
                "h-12 w-12 flex items-center justify-center cursor-pointer select-none",
                "focus:outline-none focus:ring-2 focus:ring-wellness-400/50 focus:ring-offset-2 focus:ring-offset-black",
                "md:hover:bg-white/20 active:scale-95 md:hover:border-white/30",
                isCompleted && "bg-wellness-500/20 border-wellness-400/50",
              )}
              type="button"
              style={{ touchAction: "manipulation" }}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
              whileHover={!isMobile ? { scale: 1.05 } : {}}
              whileTap={!isMobile ? { scale: 0.95 } : {}}
            >
              {/* Effet de lueur sur hover */}
              <motion.div 
                className="absolute inset-0 rounded-xl bg-gradient-to-br from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"
              />

              {/* Icône du défi */}
              <Icon
                className={cn(
                  "h-5 w-5 transition-colors relative z-10",
                  iconColors[challenge.color as keyof typeof iconColors],
                  isCompleted && "text-wellness-300"
                )}
              />

              {/* Indicateur de complétion */}
              {isCompleted && (
                <motion.div 
                  className="absolute -top-1 -right-1 h-4 w-4 bg-wellness-500 rounded-full flex items-center justify-center shadow-lg"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 400, damping: 25 }}
                >
                  <Check className="h-2.5 w-2.5 text-white" />
                </motion.div>
              )}
            </motion.button>
          );
        })}
      </div>
    </motion.div>
  );
};