import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, Heart, Bell, Utensils, Clock, Calendar, Leaf, ChevronRight, Footprints, Droplets, Dumbbell, Ban, Apple, Moon } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";

interface Challenge {
  id: string;
  title: string;
  description: string;
  icon: typeof Heart;
  difficulty: string;
  points: number;
  color: string;
  tips: string;
}

interface MobileChallengeCardProps {
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

export const MobileChallengeCard = ({ challenge, isCompleted, onToggle }: MobileChallengeCardProps) => {
  const [showTips, setShowTips] = useState(false);
  const Icon = challenge.icon;
  
  return (
    <Card className={cn(
      "relative overflow-hidden transition-all duration-300 active:scale-[0.98] touch-manipulation",
      isCompleted 
        ? "ring-2 ring-wellness-400 bg-wellness-50/50 shadow-lg" 
        : "hover:shadow-xl border-gray-200 active:shadow-lg"
    )}>
      {/* Background gradient overlay */}
      <div className={cn(
        "absolute inset-0 bg-gradient-to-br opacity-5 transition-opacity",
        colorClasses[challenge.color as keyof typeof colorClasses]
      )} />
      
      {/* Completion indicator */}
      {isCompleted && (
        <div className="absolute top-3 right-3 h-8 w-8 bg-wellness-500 rounded-full flex items-center justify-center animate-scale-in shadow-lg">
          <Check className="h-5 w-5 text-white" />
        </div>
      )}

      <CardHeader className="relative pb-3">
        <div className="flex items-start justify-between mb-3">
          <div className={cn(
            "p-3 rounded-xl bg-gradient-to-br shadow-lg relative",
            colorClasses[challenge.color as keyof typeof colorClasses]
          )}>
            <Icon className="h-6 w-6 text-white" />
          </div>
          <div className="flex flex-col gap-2 items-end">
            <Badge 
              variant="secondary" 
              className={cn("text-xs font-medium", difficultyColors[challenge.difficulty as keyof typeof difficultyColors])}
            >
              {challenge.difficulty}
            </Badge>
            <Badge variant="outline" className="text-xs font-bold">
              +{challenge.points} pts
            </Badge>
          </div>
        </div>
        
        <CardTitle className="text-heading-4 font-semibold text-gray-900 leading-tight">
          {challenge.title}
        </CardTitle>
        <CardDescription className="text-body text-gray-600 leading-relaxed">
          {challenge.description}
        </CardDescription>
      </CardHeader>

      <CardContent className="relative pt-0">
        <div className="space-y-4">
          {/* Bouton pour afficher les conseils */}
          <button
            onClick={() => setShowTips(!showTips)}
            className="w-full p-3 bg-gray-50 rounded-lg flex items-center justify-between touch-manipulation active:bg-gray-100 transition-colors"
          >
            <div className="flex items-center gap-2">
              <span className="text-body-sm font-medium text-gray-700">💡 Conseil</span>
            </div>
            <ChevronRight 
              className={cn(
                "h-4 w-4 text-gray-500 transition-transform",
                showTips && "rotate-90"
              )} 
            />
          </button>
          
          {/* Conseils expandables */}
          {showTips && (
            <div className="p-3 bg-gray-50 rounded-lg animate-fade-in border-l-4 border-wellness-400">
              <p className="text-body-sm text-gray-600 leading-relaxed">{challenge.tips}</p>
            </div>
          )}
          
          {/* Bouton d'action principal */}
          <Button 
            variant={isCompleted ? "secondary" : "default"}
            size="lg"
            className={cn(
              "w-full h-12 transition-all duration-200 touch-manipulation font-medium",
              isCompleted 
                ? "bg-wellness-100 text-wellness-700 hover:bg-wellness-200 active:bg-wellness-200" 
                : "bg-gradient-to-r hover:shadow-md active:shadow-sm text-white",
              !isCompleted && colorClasses[challenge.color as keyof typeof colorClasses]
            )}
            onClick={(e) => {
              e.stopPropagation();
              onToggle(challenge.id);
            }}
          >
            {isCompleted ? (
              <>
                <Check className="h-5 w-5 mr-2" />
                Terminé !
              </>
            ) : (
              "Commencer le défi"
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
