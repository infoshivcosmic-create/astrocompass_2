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
  if (heading === null) return 'North';
  const directions = [
    'North', 'North-North-East', 'North-East', 'East-North-East',
    'East', 'East-South-East', 'South-East', 'South-South-East',
    'South', 'South-South-West', 'South-West', 'West-South-West',
    'West', 'West-North-West', 'North-West', 'North-North-West'
  ];
  const index = Math.floor(((heading + 11.25) % 360) / 22.5);
  return directions[index];
}

export const CompassComponent: React.FC<CompassComponentProps> = ({ heading, themeIndex, onThemeChange }) => {
  const activeTheme = themes[themeIndex];
  const [isMounted, setIsMounted] = React.useState(false);
  const prevHeadingRef = React.useRef<number | null>(null);

  React.useEffect(() => {
    setIsMounted(true);
  }, []);

  const displayHeading = heading !== null ? Math.round(heading) : 0;
  
  // Logic to prevent jarring jump from 359 to 0 degrees
  const headingJump =
    prevHeadingRef.current !== null &&
    heading !== null &&
    Math.abs(heading - prevHeadingRef.current) > 180;

  React.useEffect(() => {
    prevHeadingRef.current = heading;
  }, [heading]);

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
            className={cn(
              "w-full h-full origin-center",
              headingJump
                ? "transition-none"
                : "transition-transform duration-50 ease-linear"
            )}
            style={{ transform: `rotate(${-(heading || 0)}deg)` }}
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
