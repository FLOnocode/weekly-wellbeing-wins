import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Heart, Menu, Star, Trophy, Scale, Medal, User, BarChart, MessageSquare, Settings } from "lucide-react";
import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import { FeedbackForm } from "@/components/FeedbackForm";

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
  const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);
  const location = useLocation();
  
  const progressPercentage = Math.round((completedChallenges / totalChallenges) * 100);

  const handleFeedbackClick = () => {
    setIsMenuOpen(false); // Fermer le menu
    setIsFeedbackOpen(true); // Ouvrir le feedback
  };

  // Déterminer la destination du bouton paramètres
  const settingsDestination = location.pathname === '/settings' ? '/' : '/settings';

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 bg-foreground/5 backdrop-blur-xl border border-border shadow-lg">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            {/* Logo et titre */}
            <Link to="/" className="flex items-center gap-2">
              <div className="p-2 bg-gradient-wellness rounded-lg">
                <Heart className="h-5 w-5 text-white" />
              </div>
              <div>
                <h1 className="text-heading-4 font-bold text-foreground">Fit Together</h1>
                <p className="text-caption text-muted-foreground">SSM 2K25 Challenge</p>
              </div>
            </Link>

            {/* Stats rapides et boutons */}
            <div className="flex items-center gap-3">
              <div className="text-center">
                <div className="text-body font-bold text-wellness-500">{totalPoints}</div>
                <div className="text-caption text-muted-foreground">pts</div>
              </div>
              <div className="text-center">
                <div className="text-body font-bold text-motivation-500">{progressPercentage}%</div>
                <div className="text-caption text-muted-foreground">fini</div>
              </div>
              
              {/* Bouton Paramètres avec logique de basculement */}
              <Link to={settingsDestination}>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className={`text-foreground hover:bg-muted hover:text-foreground ${
                    location.pathname === '/settings' ? 'bg-muted' : ''
                  }`}
                >
                  <Settings className="h-5 w-5" />
                </Button>
              </Link>
              
              {/* Menu burger */}
              <Sheet open={isMenuOpen} onOpenChange={setIsMenuOpen}>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon" className="text-foreground hover:bg-muted hover:text-foreground">
                    <Menu className="h-5 w-5" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="w-80 bg-background backdrop-blur-xl border-border overflow-y-auto">
                  <SheetHeader>
                    <SheetTitle className="flex items-center gap-2 text-foreground">
                      <Trophy className="h-5 w-5 text-yellow-500" />
                      Navigation
                    </SheetTitle>
                    <SheetDescription className="text-muted-foreground">
                      Accédez à toutes les fonctionnalités
                    </SheetDescription>
                  </SheetHeader>
                  
                  <div className="mt-6 space-y-3">
                    {/* Séparateur horizontal */}
                    <Separator className="my-2 bg-border" />
                    
                    {/* Navigation principale */}
                    <div className="space-y-2">
                      <Link 
                        to="/" 
                        onClick={() => setIsMenuOpen(false)}
                        className="flex items-center gap-3 p-3 rounded-lg hover:bg-wellness-500/20 transition-colors text-foreground"
                      >
                        <Heart className="h-5 w-5 text-wellness-400" />
                        <span className="text-body font-medium">Défis du jour</span>
                      </Link>
                      
                      <Link 
                        to="/weigh-in" 
                        onClick={() => setIsMenuOpen(false)}
                        className="flex items-center gap-3 p-3 rounded-lg hover:bg-motivation-500/20 transition-colors text-foreground"
                      >
                        <Scale className="h-5 w-5 text-motivation-400" />
                        <span className="text-body font-medium">Mon Poids</span>
                      </Link>
                      
                      <Link 
                        to="/rankings" 
                        onClick={() => setIsMenuOpen(false)}
                        className="flex items-center gap-3 p-3 rounded-lg hover:bg-energy-500/20 transition-colors text-foreground"
                      >
                        <Medal className="h-5 w-5 text-energy-400" />
                        <span className="text-body font-medium">Le Classement</span>
                      </Link>

                      <Link 
                        to="/analytics" 
                        onClick={() => setIsMenuOpen(false)}
                        className="flex items-center gap-3 p-3 rounded-lg hover:bg-pink-500/20 transition-colors text-foreground"
                      >
                        <BarChart className="h-5 w-5 text-pink-400" />
                        <span className="text-body font-medium">Analyse</span>
                      </Link>

                      <Link 
                        to="/settings" 
                        onClick={() => setIsMenuOpen(false)}
                        className="flex items-center gap-3 p-3 rounded-lg hover:bg-purple-500/20 transition-colors text-foreground"
                      >
                        <Settings className="h-5 w-5 text-purple-400" />
                        <span className="text-body font-medium">Paramètres</span>
                      </Link>
                      
                      <Link 
                        to="/profile" 
                        onClick={() => setIsMenuOpen(false)}
                        className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted transition-colors text-foreground"
                      >
                        <User className="h-5 w-5 text-muted-foreground" />
                        <span className="text-body font-medium">Profil</span>
                      </Link>

                      {/* Séparateur avant le feedback */}
                      <Separator className="my-3 bg-border" />

                      {/* Bouton Feedback avec style spécial */}
                      <motion.button
                        onClick={handleFeedbackClick}
                        className="w-full flex items-center gap-3 p-3 rounded-lg bg-motivation-500 hover:bg-motivation-600 transition-all duration-200 text-white shadow-lg"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <motion.div
                          animate={{ 
                            rotate: [0, -10, 10, -10, 0],
                            scale: [1, 1.1, 1]
                          }}
                          transition={{ 
                            duration: 2,
                            repeat: Infinity,
                            repeatDelay: 3
                          }}
                        >
                          <MessageSquare className="h-5 w-5 text-white" />
                        </motion.div>
                        <span className="text-body font-medium">Feedback</span>
                        <Badge className="ml-auto bg-white/20 text-white border-white/30 text-xs">
                          Nouveau
                        </Badge>
                      </motion.button>
                    </div>

                    {/* Statistiques */}
                    <div className="pt-4 border-t border-border space-y-3">
                      <h3 className="text-body-sm font-medium text-muted-foreground px-3">Vos Statistiques</h3>
                      
                      <div className="p-4 bg-wellness-500/10 backdrop-blur-sm border border-wellness-400/20 rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-body-sm font-medium text-wellness-600 dark:text-wellness-300">Points aujourd'hui</span>
                          <Star className="h-4 w-4 text-wellness-400" />
                        </div>
                        <div className="text-heading-2 font-bold text-wellness-600 dark:text-wellness-300">{totalPoints}</div>
                      </div>
                      
                      <div className="p-4 bg-motivation-500/10 backdrop-blur-sm border border-motivation-400/20 rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-body-sm font-medium text-motivation-600 dark:text-motivation-300">Défis réalisés</span>
                          <Trophy className="h-4 w-4 text-motivation-400" />
                        </div>
                        <div className="text-heading-2 font-bold text-motivation-600 dark:text-motivation-300">
                          {completedChallenges}/{totalChallenges}
                        </div>
                      </div>
                      
                      <div className="p-4 bg-energy-500/10 backdrop-blur-sm border border-energy-400/20 rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-body-sm font-medium text-energy-600 dark:text-energy-300">Progression</span>
                          <Heart className="h-4 w-4 text-energy-400" />
                        </div>
                        <div className="text-heading-2 font-bold text-energy-600 dark:text-energy-300">{progressPercentage}%</div>
                      </div>
                    </div>
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </div>
      </header>

      {/* Composant FeedbackForm */}
      <FeedbackForm 
        isOpen={isFeedbackOpen} 
        onClose={() => setIsFeedbackOpen(false)} 
      />
    </>
  );
};