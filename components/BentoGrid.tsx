import React from 'react';
import { CardData } from '../types';
import { BentoCard } from './BentoCard';

interface BentoGridProps {
  cards: CardData[];
}

export const BentoGrid: React.FC<BentoGridProps> = ({ cards }) => {
  return (
    // Changed auto-rows from 200px to 100px for compactness
    // Reduced gap from gap-4/6 to gap-3
    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 auto-rows-[100px] gap-3 p-4 max-w-[1600px] mx-auto">
      {cards.map((card, idx) => (
        <BentoCard key={card.id} data={card} index={idx} />
      ))}
    </div>
  );
};