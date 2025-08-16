"use client";

import React from 'react';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const themes = [
  { src: "/images/1.png", alt: "Compass Theme 1", hint: "abstract compass" },
  { src: "/images/2.png", alt: "Compass Theme 2", hint: "modern compass" },
];

interface CompassComponentProps {
  heading: number | null;
  themeIndex: number;
  onThemeChange: (direction: 'next' | 'prev') => void;
}

const DirectionIndicator = () => (
    <div
      className="absolute top-[-40px] h-[20px] w-[2px] bg-destructive drop-shadow-lg z-10"
      style={{ left: '50%', transform: 'translateX(-50%)' }}
    />
  );

export const CompassComponent: React.FC<CompassComponentProps> = ({ heading, themeIndex, onThemeChange }) => {
  const activeTheme = themes[themeIndex];
  const [isMounted, setIsMounted] = React.useState(false);

  React.useEffect(() => {
    setIsMounted(true);
  }, []);
  
  return (
    <div className="flex flex-col items-center">
      <div className="flex items-center justify-center gap-4 w-full">
        <Button variant="outline" size="icon" onClick={() => onThemeChange('prev')} aria-label="Previous theme">
          <ArrowLeft className="h-5 w-5" />
        </Button>

        <div className={cn(
            "relative w-[400px] h-[400px] transition-all duration-500 ease-in-out transform-gpu",
            isMounted ? "scale-100 opacity-100" : "scale-75 opacity-0"
          )}>
          <div
            className="w-full h-full transition-transform duration-500 ease-in-out origin-center"
            style={{ transform: `rotate(${-1 * (heading || 0)}deg)` }}
          >
            <div className="relative w-full h-full">
               <Image
                src={activeTheme.src}
                data-ai-hint={activeTheme.hint}
                alt={activeTheme.alt}
                width={400}
                height={400}
                priority
               />
            </div>
          </div>
          <DirectionIndicator />
        </div>

        <Button variant="outline" size="icon" onClick={() => onThemeChange('next')} aria-label="Next theme">
          <ArrowRight className="h-5 w-5" />
        </Button>
      </div>

      <div className="mt-6 text-center relative z-10">
        <p className="text-4xl font-bold font-mono tracking-tighter text-foreground pl-[5px]">
          {heading !== null ? `${Math.round(heading)}°` : '0°'}
        </p>
      </div>
    </div>
  );
};
