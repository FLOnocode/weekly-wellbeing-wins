
import React from 'react';
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

      {/* Carrousel */}
      <Carousel className="w-full">
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
        
        {/* Boutons de navigation personnalisés */}
        <CarouselPrevious className="absolute -left-12 top-1/2 -translate-y-1/2 bg-white/10 border-white/20 hover:bg-white/20 text-white backdrop-blur-sm" />
        <CarouselNext className="absolute -right-12 top-1/2 -translate-y-1/2 bg-white/10 border-white/20 hover:bg-white/20 text-white backdrop-blur-sm" />
      </Carousel>

      {/* Indicateurs de progression */}
      <motion.div 
        className="flex justify-center mt-6 space-x-2"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
      >
        {challenges.map((_, index) => (
          <div
            key={index}
            className="h-1.5 w-1.5 rounded-full bg-white/30"
          />
        ))}
      </motion.div>
    </div>
  );
};
