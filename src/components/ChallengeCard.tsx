import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, Heart, Bell, Utensils, Clock, Calendar, Leaf, Footprints, Droplets, Dumbbell, Ban, Apple, Moon } from "lucide-react";
import { cn } from "@/lib/utils";

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

interface ChallengeCardProps {
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

export const ChallengeCard = ({ challenge, isCompleted, onToggle }: ChallengeCardProps) => {
  const Icon = challenge.icon;
  
  return (
    <Card className={cn(
      "relative overflow-hidden transition-all duration-300 hover-lift cursor-pointer group",
      isCompleted 
        ? "ring-2 ring-wellness-400 bg-wellness-50/50" 
        : "hover:shadow-xl border-gray-200"
    )}
    onClick={() => onToggle(challenge.id)}
    >
      {/* Background gradient overlay */}
      <div className={cn(
        "absolute inset-0 bg-gradient-to-br opacity-5 group-hover:opacity-10 transition-opacity",
        colorClasses[challenge.color as keyof typeof colorClasses]
      )} />
      
      {/* Completion indicator */}
      {isCompleted && (
        <div className="absolute top-4 right-4 h-6 w-6 bg-wellness-500 rounded-full flex items-center justify-center animate-scale-in">
          <Check className="h-4 w-4 text-white" />
        </div>
      )}

      <CardHeader className="relative">
        <div className="flex items-start justify-between">
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
            <Badge variant="outline" className="text-xs">
              +{challenge.points} pts
            </Badge>
          </div>
        </div>
        
        <CardTitle className="text-heading-4 font-semibold text-gray-900 group-hover:text-gray-700 transition-colors">
          {challenge.title}
        </CardTitle>
        <CardDescription className="text-body text-gray-600">
          {challenge.description}
        </CardDescription>
      </CardHeader>

      <CardContent className="relative">
        <div className="space-y-4">
          <div className="p-3 bg-gray-50 rounded-lg">
            <p className="text-body-sm text-gray-700 font-medium mb-1">💡 Conseil</p>
            <p className="text-body-sm text-gray-600">{challenge.tips}</p>
          </div>
          
          <Button 
            variant={isCompleted ? "secondary" : "default"}
            size="sm"
            className={cn(
              "w-full transition-all duration-200",
              isCompleted 
                ? "bg-wellness-100 text-wellness-700 hover:bg-wellness-200" 
                : "bg-gradient-to-r hover:shadow-md",
              !isCompleted && colorClasses[challenge.color as keyof typeof colorClasses]
            )}
            onClick={(e) => {
              e.stopPropagation();
              onToggle(challenge.id);
            }}
          >
            {isCompleted ? (
              <>
                <Check className="h-4 w-4 mr-2" />
                Terminé !
              </>
            ) : (
              "Commencer"
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
