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
  const normalizedHeading = ((heading % 360) + 360) % 360;
  const directions = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
  const index = Math.round(normalizedHeading / 45) % 8;
  return directions[index];
}

export const CompassComponent: React.FC<CompassComponentProps> = ({ heading, themeIndex, onThemeChange }) => {
  const activeTheme = themes[themeIndex];
  const [isMounted, setIsMounted] = React.useState(false);
  const [rotation, setRotation] = React.useState(0);
  const isFirstRun = React.useRef(true);

  React.useEffect(() => {
    setIsMounted(true);
  }, []);

  React.useEffect(() => {
    if (heading === null) return;

    if (isFirstRun.current) {
      setRotation(-heading);
      isFirstRun.current = false;
      return;
    }

    setRotation(prevRotation => {
      const targetRotation = -heading;
      const currentNormalized = prevRotation % 360;
      let diff = targetRotation - currentNormalized;

      if (diff > 180) {
        diff -= 360;
      } else if (diff < -180) {
        diff += 360;
      }

      return prevRotation + diff;
    });
  }, [heading]);

  const displayHeading = heading !== null ? Math.round(((heading % 360) + 360) % 360) : 0;

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
            className="w-full h-full origin-center transition-transform duration-100 ease-linear"
            style={{ transform: `rotate(${rotation}deg)` }}
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
