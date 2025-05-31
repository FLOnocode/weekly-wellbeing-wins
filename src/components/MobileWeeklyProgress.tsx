
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, TrendingUp, Target } from "lucide-react";

interface MobileWeeklyProgressProps {
  weeklyFocus: {
    title: string;
    description: string;
    progress: number;
    daysLeft: number;
  };
  completedCount: number;
  totalCount: number;
}

export const MobileWeeklyProgress = ({ weeklyFocus, completedCount, totalCount }: MobileWeeklyProgressProps) => {
  const progressPercentage = Math.round(weeklyFocus.progress);
  
  return (
    <Card className="border-0 shadow-xl bg-gradient-to-r from-white to-gray-50 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-r from-wellness-500/5 to-motivation-500/5" />
      
      <CardHeader className="relative pb-4">
        <div className="flex items-center gap-3 mb-3">
          <div className="p-3 bg-gradient-wellness rounded-xl shadow-lg">
            <Calendar className="h-6 w-6 text-white" />
          </div>
          <div className="flex-1">
            <CardTitle className="text-heading-4 font-bold text-gray-900 leading-tight">
              {weeklyFocus.title}
            </CardTitle>
            <CardDescription className="text-body-sm text-gray-600 mt-1">
              {weeklyFocus.description}
            </CardDescription>
          </div>
        </div>
        
        <div className="flex items-center justify-between">
          <Badge variant="outline" className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            {weeklyFocus.daysLeft} jours restants
          </Badge>
          <Badge variant="secondary" className="flex items-center gap-1">
            <Target className="h-3 w-3" />
            {completedCount}/{totalCount} défis
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="relative">
        <div className="space-y-4">
          {/* Progress bar */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-body-sm font-medium text-gray-700">Progression</span>
              <span className="text-heading-4 font-bold text-wellness-600">
                {progressPercentage}%
              </span>
            </div>
            
            <Progress 
              value={weeklyFocus.progress} 
              className="h-4 bg-gray-200"
            />
          </div>
          
          {/* Stats rapides */}
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 bg-wellness-50 rounded-lg text-center">
              <div className="flex items-center justify-center gap-1 mb-1">
                <TrendingUp className="h-4 w-4 text-wellness-500" />
                <span className="text-caption text-wellness-600 font-medium">Aujourd'hui</span>
              </div>
              <div className="text-heading-4 font-bold text-wellness-600">
                {completedCount}
              </div>
            </div>
            
            <div className="p-3 bg-motivation-50 rounded-lg text-center">
              <div className="flex items-center justify-center gap-1 mb-1">
                <Target className="h-4 w-4 text-motivation-500" />
                <span className="text-caption text-motivation-600 font-medium">Objectif</span>
              </div>
              <div className="text-heading-4 font-bold text-motivation-600">
                {totalCount}
              </div>
            </div>
          </div>
          
          {/* Message de motivation */}
          {weeklyFocus.progress >= 70 && (
            <div className="p-4 bg-gradient-to-r from-wellness-50 to-motivation-50 border border-wellness-200 rounded-lg animate-fade-in">
              <p className="text-body-sm text-center font-medium">
                <span className="text-2xl mr-2">🎉</span>
                <span className="text-wellness-700">
                  Excellent travail ! Vous êtes sur la bonne voie !
                </span>
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
