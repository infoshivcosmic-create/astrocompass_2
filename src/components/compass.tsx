"use client";

import React from 'react';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const themes = [
  { src: "/images/11.png", alt: "Compass Theme 1", hint: "classic compass" },
  { src: "/images/22.png", alt: "Compass Theme 2", hint: "modern compass" },
  { src: "/images/33.png", alt: "Compass Theme 3", hint: "vintage compass" },
];

interface CompassComponentProps {
  heading: number | null;
  rotation: number;
  themeIndex: number;
  onThemeChange: (direction: 'next' | 'prev') => void;
}

const DirectionIndicator = () => (
    <div
      className="absolute top-[-10px] h-[34px] w-[3px] bg-destructive drop-shadow-lg z-10"
      style={{ left: 'calc(50% - 0.6px)', transform: 'translateX(-50%)' }}
    />
  );

const getDirection = (heading: number | null): string => {
  if (heading === null) return '...';
  const directions = [
    'N1', 'N2', 'N3', 'N4', 'N5', 'N6', 'N7', 'N8',
    'E1', 'E2', 'E3', 'E4', 'E5', 'E6', 'E7', 'E8',
    'S1', 'S2', 'S3', 'S4', 'S5', 'S6', 'S7', 'S8',
    'W1', 'W2', 'W3', 'W4', 'W5', 'W6', 'W7', 'W8'
  ];
  // To align with the 32 zones, we offset the heading so that N1 starts at 0 degrees.
  // The zone N1 is from 354.375° to 5.625°. We shift the circle by 5.625 degrees.
  const correctedHeading = (heading + 5.625) % 360;
  const index = Math.floor(correctedHeading / 11.25);
  return directions[index] || 'North';
}

export const CompassComponent: React.FC<CompassComponentProps> = ({ heading, rotation, themeIndex, onThemeChange }) => {
  const activeTheme = themes[themeIndex];
  const [isMounted, setIsMounted] = React.useState(false);

  React.useEffect(() => {
    setIsMounted(true);
  }, []);

  const displayHeading = heading !== null ? Math.round(heading) : 0;
  
  return (
    <div className="flex flex-col items-center">
      <div className="flex items-center justify-center w-full">
        <Button variant="outline" size="icon" onClick={() => onThemeChange('prev')} aria-label="Previous theme" className="mr-2">
          <ArrowLeft className="h-5 w-5" />
        </Button>

        <div className={cn(
            "relative w-[400px] h-[400px] transition-all duration-500 ease-in-out transform-gpu",
            isMounted ? "scale-100 opacity-100" : "scale-75 opacity-0"
          )}>
          <div
            className="w-full h-full origin-center transition-transform duration-50 ease-linear"
            style={{ transform: `rotate(${-rotation}deg)` }}
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

        <Button variant="outline" size="icon" onClick={() => onThemeChange('next')} aria-label="Next theme" className="ml-2">
          <ArrowRight className="h-5 w-5" />
        </Button>
      </div>

      <div className="mt-6 text-center relative z-10">
        <p className="text-4xl font-bold font-mono tracking-tighter text-foreground pl-[5px]">
          {`${displayHeading}°`}
        </p>
        <p className="text-xl font-medium text-muted-foreground mt-1">
          {getDirection(heading)}
        </p>
      </div>
    </div>
  );
};
