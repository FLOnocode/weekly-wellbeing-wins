import React, { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel";
import { GlassChallengeCard } from './GlassChallengeCard';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import type { CarouselApi } from "@/components/ui/carousel";
import { useIsMobile } from "@/hooks/use-mobile";

interface Challenge {
  id: string;
  title: string;
  description: string;
  icon: any;
  difficulty: string;
  points: number;
  color: string;
  tips: string;
}

interface ChallengeCarouselProps {
  challenges: Challenge[];
  completedChallenges: Set<string>;
  onToggle: (challengeId: string) => void;
}

export const ChallengeCarousel = ({ challenges, completedChallenges, onToggle }: ChallengeCarouselProps) => {
  const [api, setApi] = useState<CarouselApi>();
  const [current, setCurrent] = useState(0);
  const isMobile = useIsMobile();

  const onSelect = useCallback(() => {
    if (!api) return;
    setCurrent(api.selectedScrollSnap());
  }, [api]);

  React.useEffect(() => {
    if (!api) return;
    
    onSelect();
    api.on("select", onSelect);
    
    return () => {
      api.off("select", onSelect);
    };
  }, [api, onSelect]);

  return (
    <div className="relative w-full max-w-sm mx-auto">
      {/* Titre du carrousel */}
      <motion.div 
        className="text-center mb-6"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <h2 className="text-xl font-bold text-white mb-2">
          Défis du jour
        </h2>
        <p className="text-white/60 text-sm">
          Glissez pour découvrir tous les défis
        </p>
      </motion.div>

      {/* Carrousel SANS hauteur minimale - s'adapte au contenu */}
      <Carousel className="w-full" setApi={setApi}>
        <CarouselContent className="-ml-2 md:-ml-4">
          {challenges.map((challenge, index) => (
            <CarouselItem key={challenge.id} className="pl-2 md:pl-4">
              <motion.div 
                className="h-[400px]"
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <GlassChallengeCard
                  challenge={challenge}
                  isCompleted={completedChallenges.has(challenge.id)}
                  onToggle={onToggle}
                />
              </motion.div>
            </CarouselItem>
          ))}
        </CarouselContent>
        
        {/* Les flèches par défaut ont été supprimées - plus de CarouselPrevious et CarouselNext */}
      </Carousel>

      {/* Flèches en position relative sous le carrousel - en flexbox vertical */}
      <motion.div 
        className="flex flex-col items-center mt-4 space-y-3"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
      >
        <div className="flex items-center space-x-4">
          <button
            onClick={() => api?.scrollPrev()}
            className="p-3 bg-white/10 border border-white/20 rounded-full text-white backdrop-blur-sm transition-all duration-200 md:hover:bg-white/20 active:bg-wellness-500 active:text-black"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          
          <span className="text-white/70 text-sm font-medium">
            {current + 1} / {challenges.length}
          </span>
          
          <button
            onClick={() => api?.scrollNext()}
            className="p-3 bg-white/10 border border-white/20 rounded-full text-white backdrop-blur-sm transition-all duration-200 md:hover:bg-white/20 active:bg-wellness-500 active:text-black"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>
      </motion.div>
    </div>
  );
};