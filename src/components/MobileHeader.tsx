
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Heart, Menu, Star, Trophy, Scale, Medal, User } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

interface MobileHeaderProps {
  totalPoints: number;
  completedChallenges: number;
  totalChallenges: number;
}

export const MobileHeader = ({ 
  totalPoints, 
  completedChallenges, 
  totalChallenges 
}: MobileHeaderProps) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  
  const progressPercentage = Math.round((completedChallenges / totalChallenges) * 100);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-b shadow-sm">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          {/* Logo et titre */}
          <Link to="/" className="flex items-center gap-2">
            <div className="p-2 bg-gradient-wellness rounded-lg">
              <Heart className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="text-heading-4 font-bold text-gray-900">SSM 2K25</h1>
              <p className="text-caption text-gray-500">Challenge Weekly</p>
            </div>
          </Link>

          {/* Stats rapides */}
          <div className="flex items-center gap-3">
            <div className="text-center">
              <div className="text-body font-bold text-wellness-600">{totalPoints}</div>
              <div className="text-caption text-gray-500">pts</div>
            </div>
            <div className="text-center">
              <div className="text-body font-bold text-motivation-600">{progressPercentage}%</div>
              <div className="text-caption text-gray-500">fini</div>
            </div>
            
            {/* Menu burger */}
            <Sheet open={isMenuOpen} onOpenChange={setIsMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="ml-2">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-80">
                <SheetHeader>
                  <SheetTitle className="flex items-center gap-2">
                    <Trophy className="h-5 w-5 text-wellness-500" />
                    Navigation
                  </SheetTitle>
                  <SheetDescription>
                    Accédez à toutes les fonctionnalités
                  </SheetDescription>
                </SheetHeader>
                
                <div className="mt-6 space-y-3">
                  {/* Navigation principale */}
                  <div className="space-y-2">
                    <h3 className="text-body-sm font-medium text-gray-700 px-3">Navigation</h3>
                    
                    <Link 
                      to="/" 
                      onClick={() => setIsMenuOpen(false)}
                      className="flex items-center gap-3 p-3 rounded-lg hover:bg-wellness-50 transition-colors"
                    >
                      <Heart className="h-5 w-5 text-wellness-500" />
                      <span className="text-body font-medium">Défis du jour</span>
                    </Link>
                    
                    <Link 
                      to="/weigh-in" 
                      onClick={() => setIsMenuOpen(false)}
                      className="flex items-center gap-3 p-3 rounded-lg hover:bg-motivation-50 transition-colors"
                    >
                      <Scale className="h-5 w-5 text-motivation-500" />
                      <span className="text-body font-medium">Mon Poids</span>
                    </Link>
                    
                    <Link 
                      to="/rankings" 
                      onClick={() => setIsMenuOpen(false)}
                      className="flex items-center gap-3 p-3 rounded-lg hover:bg-energy-50 transition-colors"
                    >
                      <Medal className="h-5 w-5 text-energy-500" />
                      <span className="text-body font-medium">Le Classement</span>
                    </Link>
                    
                    <Link 
                      to="/profile" 
                      onClick={() => setIsMenuOpen(false)}
                      className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <User className="h-5 w-5 text-gray-500" />
                      <span className="text-body font-medium">Profil</span>
                    </Link>
                  </div>

                  {/* Statistiques */}
                  <div className="pt-4 border-t space-y-3">
                    <h3 className="text-body-sm font-medium text-gray-700 px-3">Vos Statistiques</h3>
                    
                    <div className="p-4 bg-wellness-50 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-body-sm font-medium text-wellness-700">Points aujourd'hui</span>
                        <Star className="h-4 w-4 text-wellness-500" />
                      </div>
                      <div className="text-heading-2 font-bold text-wellness-600">{totalPoints}</div>
                    </div>
                    
                    <div className="p-4 bg-motivation-50 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-body-sm font-medium text-motivation-700">Défis réalisés</span>
                        <Trophy className="h-4 w-4 text-motivation-500" />
                      </div>
                      <div className="text-heading-2 font-bold text-motivation-600">
                        {completedChallenges}/{totalChallenges}
                      </div>
                    </div>
                    
                    <div className="p-4 bg-energy-50 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-body-sm font-medium text-energy-700">Progression</span>
                        <Heart className="h-4 w-4 text-energy-500" />
                      </div>
                      <div className="text-heading-2 font-bold text-energy-600">{progressPercentage}%</div>
                    </div>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
};
