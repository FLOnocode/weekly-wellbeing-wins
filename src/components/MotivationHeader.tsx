
import { Badge } from "@/components/ui/badge";
import { Heart, Star, Calendar } from "lucide-react";

interface MotivationHeaderProps {
  totalPoints: number;
  completedChallenges: number;
  totalChallenges: number;
}

export const MotivationHeader = ({ 
  totalPoints, 
  completedChallenges, 
  totalChallenges 
}: MotivationHeaderProps) => {
  const getMotivationMessage = () => {
    const percentage = (completedChallenges / totalChallenges) * 100;
    
    if (percentage === 0) {
      return {
        message: "Prêt pour une nouvelle journée de défis ?",
        emoji: "🌅"
      };
    } else if (percentage < 30) {
      return {
        message: "C'est parti ! Chaque petit pas compte",
        emoji: "🚀"
      };
    } else if (percentage < 70) {
      return {
        message: "Vous progressez bien ! Continuez sur cette lancée",
        emoji: "💪"
      };
    } else if (percentage < 100) {
      return {
        message: "Presque fini ! Vous êtes incroyable",
        emoji: "🔥"
      };
    } else {
      return {
        message: "Mission accomplie ! Vous êtes un champion",
        emoji: "🏆"
      };
    }
  };

  const motivation = getMotivationMessage();

  return (
    <div className="text-center mb-12">
      <div className="inline-flex items-center gap-2 px-4 py-2 bg-wellness-100 text-wellness-700 rounded-full text-body-sm font-medium mb-4 animate-fade-in">
        <Star className="h-4 w-4" />
        Challenge Wellness Weekly
      </div>
      
      <h1 className="text-display font-bold text-gradient mb-4 animate-fade-in">
        Transformez-vous
      </h1>
      
      <div className="flex items-center justify-center gap-2 mb-6 animate-fade-in">
        <span className="text-heading-2">{motivation.emoji}</span>
        <p className="text-heading-4 text-gray-700 font-medium">
          {motivation.message}
        </p>
      </div>

      <div className="flex items-center justify-center gap-6 mb-8">
        <div className="flex items-center gap-2 px-4 py-2 bg-white rounded-xl shadow-sm border">
          <Heart className="h-5 w-5 text-wellness-500" />
          <div className="text-left">
            <div className="text-heading-4 font-bold text-gray-900">{totalPoints}</div>
            <div className="text-caption text-gray-500">Points aujourd'hui</div>
          </div>
        </div>
        
        <div className="flex items-center gap-2 px-4 py-2 bg-white rounded-xl shadow-sm border">
          <Calendar className="h-5 w-5 text-motivation-500" />
          <div className="text-left">
            <div className="text-heading-4 font-bold text-gray-900">
              {completedChallenges}/{totalChallenges}
            </div>
            <div className="text-caption text-gray-500">Défis réalisés</div>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto">
        <p className="text-body-lg text-gray-600 leading-relaxed">
          Chaque défi est une opportunité de vous rapprocher de vos objectifs. 
          Commencez petit, restez constant, et observez les résultats extraordinaires.
        </p>
      </div>
    </div>
  );
};
