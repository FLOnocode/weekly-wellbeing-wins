import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useId } from "react";
import { ListFilter, Footprints, Droplets, Utensils, Dumbbell, Ban, Apple, Moon } from "lucide-react";

interface Challenge {
  id: string;
  title: string;
  icon: React.ComponentType<any>;
  color: string;
}

interface AnalyticsFilterProps {
  challenges: Challenge[];
  selectedChallenges: string[];
  onChallengeToggle: (challengeId: string) => void;
  onClearAll: () => void;
  onSelectAll: () => void;
}

export function AnalyticsFilter({ 
  challenges, 
  selectedChallenges, 
  onChallengeToggle, 
  onClearAll, 
  onSelectAll 
}: AnalyticsFilterProps) {
  const id = useId();

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

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button 
          variant="outline" 
          size="sm" 
          className="bg-white/10 border-white/20 text-white hover:bg-white/20"
        >
          <ListFilter size={16} strokeWidth={2} className="mr-2" />
          Filtrer par défi
          {selectedChallenges.length > 0 && (
            <span className="ml-2 bg-wellness-500 text-white text-xs px-1.5 py-0.5 rounded-full">
              {selectedChallenges.length}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-64 p-3 bg-black/90 border-white/20 text-white">
        <div className="space-y-3">
          <div className="text-xs font-medium text-white/70">Filtrer par défis</div>
          <form className="space-y-3">
            {challenges.map((challenge) => {
              const Icon = challenge.icon;
              const iconColor = iconColors[challenge.color as keyof typeof iconColors] || iconColors.pink;
              
              return (
                <div key={challenge.id} className="flex items-center gap-3">
                  <Checkbox 
                    id={`${id}-${challenge.id}`}
                    checked={selectedChallenges.includes(challenge.id)}
                    onCheckedChange={() => onChallengeToggle(challenge.id)}
                    className="border-white/30 data-[state=checked]:bg-wellness-500 data-[state=checked]:border-wellness-500"
                  />
                  <Icon className={`h-4 w-4 ${iconColor}`} />
                  <Label 
                    htmlFor={`${id}-${challenge.id}`} 
                    className="font-normal text-white text-sm flex-1 cursor-pointer"
                  >
                    {challenge.title}
                  </Label>
                </div>
              );
            })}
            
            <div
              role="separator"
              aria-orientation="horizontal"
              className="-mx-3 my-1 h-px bg-white/20"
            />
            
            <div className="flex justify-between gap-2">
              <Button 
                size="sm" 
                variant="outline" 
                className="h-7 px-2 bg-white/10 border-white/20 text-white hover:bg-white/20"
                onClick={onClearAll}
                type="button"
              >
                Effacer
              </Button>
              <Button 
                size="sm" 
                className="h-7 px-2 bg-wellness-500 hover:bg-wellness-600"
                onClick={onSelectAll}
                type="button"
              >
                Tout
              </Button>
            </div>
          </form>
        </div>
      </PopoverContent>
    </Popover>
  );
}