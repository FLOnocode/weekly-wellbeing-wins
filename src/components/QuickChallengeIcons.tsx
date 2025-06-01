
import { cn } from "@/lib/utils";
import { Check, Footprints, Droplets, Utensils, Dumbbell, Ban, Apple, Moon } from "lucide-react";

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

const colorClasses = {
  wellness: "from-wellness-400 to-wellness-600",
  energy: "from-energy-400 to-energy-600", 
  motivation: "from-motivation-400 to-motivation-600",
  hydration: "from-blue-400 to-blue-600",
  nutrition: "from-green-400 to-green-600",
  fitness: "from-orange-400 to-orange-600",
  detox: "from-red-400 to-red-600",
  vitamins: "from-emerald-400 to-emerald-600",
  rest: "from-indigo-400 to-indigo-600"
};

const iconColors = {
  wellness: "text-wellness-500",
  energy: "text-energy-500", 
  motivation: "text-motivation-500",
  hydration: "text-blue-500",
  nutrition: "text-green-500",
  fitness: "text-orange-500",
  detox: "text-red-500",
  vitamins: "text-emerald-500",
  rest: "text-indigo-500"
};

export const QuickChallengeIcons = ({ challenges, completedChallenges, onToggle }: QuickChallengeIconsProps) => {
  return (
    <div className="mb-6 px-2">
      <h3 className="text-body font-medium text-gray-700 mb-3 text-center">
        Accès rapide aux défis
      </h3>
      
      <div className="grid grid-cols-4 gap-3 max-w-xs mx-auto">
        {challenges.map((challenge) => {
          const Icon = challenge.icon;
          const isCompleted = completedChallenges.has(challenge.id);
          
          return (
            <button
              key={challenge.id}
              onClick={() => onToggle(challenge.id)}
              className={cn(
                "relative p-3 rounded-xl transition-all duration-300 active:scale-95 touch-manipulation",
                "backdrop-blur-md bg-white/70 border border-white/30 shadow-lg hover:shadow-xl active:shadow-md",
                "h-12 w-12 flex items-center justify-center"
              )}
            >
              {/* Icône du défi */}
              <Icon 
                className={cn(
                  "h-5 w-5 transition-colors",
                  iconColors[challenge.color as keyof typeof iconColors]
                )} 
              />
              
              {/* Indicateur de complétion */}
              {isCompleted && (
                <div className="absolute -top-1 -right-1 h-4 w-4 bg-wellness-500 rounded-full flex items-center justify-center animate-scale-in">
                  <Check className="h-2.5 w-2.5 text-white" />
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};
