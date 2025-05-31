
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock } from "lucide-react";

interface WeeklyProgressProps {
  weeklyFocus: {
    title: string;
    description: string;
    progress: number;
    daysLeft: number;
  };
  completedCount: number;
  totalCount: number;
}

export const WeeklyProgress = ({ weeklyFocus, completedCount, totalCount }: WeeklyProgressProps) => {
  return (
    <Card className="mb-8 border-0 shadow-xl bg-gradient-to-r from-white to-gray-50 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-r from-wellness-500/5 to-motivation-500/5" />
      <CardHeader className="relative">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-gradient-wellness rounded-xl shadow-lg">
              <Calendar className="h-6 w-6 text-white" />
            </div>
            <div>
              <CardTitle className="text-heading-3 font-bold text-gray-900">
                {weeklyFocus.title}
              </CardTitle>
              <CardDescription className="text-body text-gray-600 mt-1">
                {weeklyFocus.description}
              </CardDescription>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {weeklyFocus.daysLeft} jours restants
            </Badge>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="relative">
        <div className="space-y-4">
          <div className="flex items-center justify-between text-body-sm">
            <span className="font-medium text-gray-700">Progression hebdomadaire</span>
            <span className="font-bold text-gray-900">
              {completedCount}/{totalCount} défis
            </span>
          </div>
          
          <div className="space-y-2">
            <Progress 
              value={weeklyFocus.progress} 
              className="h-3 bg-gray-200"
            />
            <div className="flex justify-between text-caption text-gray-500">
              <span>0%</span>
              <span className="font-medium text-wellness-600">
                {Math.round(weeklyFocus.progress)}% complété
              </span>
              <span>100%</span>
            </div>
          </div>
          
          {weeklyFocus.progress >= 70 && (
            <div className="p-3 bg-wellness-50 border border-wellness-200 rounded-lg animate-fade-in">
              <p className="text-body-sm text-wellness-700 font-medium">
                🎉 Excellent travail ! Vous êtes sur la bonne voie pour terminer cette semaine !
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
