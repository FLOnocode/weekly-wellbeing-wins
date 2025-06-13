import React, { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
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

      {/* Carrousel avec hauteur ajustée */}
      <Carousel className="w-full min-h-[442px]" setApi={setApi}>
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

        {/* Flèches repositionnées : au-dessus des dots sur mobile, côtés sur desktop */}
        <CarouselPrevious className={`
          ${isMobile 
            ? "absolute bottom-0 left-1/4 -translate-x-1/2" 
            : "absolute -left-12 top-1/2 -translate-y-1/2"
          } 
          bg-white/10 border-white/20 md:hover:bg-white/20 md:active:bg-wellness-500 md:active:text-black text-white backdrop-blur-sm transition-all duration-200
        `} />
        <CarouselNext className={`
          ${isMobile 
            ? "absolute bottom-0 right-1/4 translate-x-1/2" 
            : "absolute -right-12 top-1/2 -translate-y-1/2"
          } 
          bg-white/10 border-white/20 md:hover:bg-white/20 md:active:bg-wellness-500 md:active:text-black text-white backdrop-blur-sm transition-all duration-200
        `} />
      </Carousel>

      {/* Indicateurs de progression */}
      <motion.div 
        className="flex justify-center mt-3 space-x-2"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
      >
        {challenges.map((challenge, index) => {
          const isActive = index === current;
          const isCompleted = completedChallenges.has(challenge.id);
          
          let dotClass = "h-1.5 w-1.5 rounded-full transition-all duration-300";
          
          if (isActive) {
            if (isCompleted) {
              dotClass += " bg-wellness-400";
            } else {
              dotClass += " bg-gray-400";
            }
          } else {
            if (isCompleted) {
              dotClass += " bg-wellness-200/50";
            } else {
              dotClass += " bg-white/30";
            }
          }
          
          return (
            <div
              key={challenge.id}
              className={dotClass}
            />
          );
        })}
      </motion.div>
    </div>
  );
};