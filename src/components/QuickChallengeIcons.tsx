
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
                "relative p-4 rounded-2xl transition-all duration-300 active:scale-95 touch-manipulation shadow-lg",
                isCompleted
                  ? "bg-wellness-100 ring-2 ring-wellness-400"
                  : "bg-gradient-to-br hover:shadow-xl active:shadow-md",
                !isCompleted && colorClasses[challenge.color as keyof typeof colorClasses]
              )}
            >
              {/* Icône du défi */}
              <Icon 
                className={cn(
                  "h-6 w-6 mx-auto transition-colors",
                  isCompleted ? "text-wellness-600" : "text-white"
                )} 
              />
              
              {/* Indicateur de complétion */}
              {isCompleted && (
                <div className="absolute -top-1 -right-1 h-5 w-5 bg-wellness-500 rounded-full flex items-center justify-center animate-scale-in">
                  <Check className="h-3 w-3 text-white" />
                </div>
              )}
              
              {/* Titre du défi (petit) */}
              <div className={cn(
                "text-xs font-medium mt-1 leading-tight",
                isCompleted ? "text-wellness-700" : "text-white/90"
              )}>
                {challenge.title.split(' ').slice(0, 2).join(' ')}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
