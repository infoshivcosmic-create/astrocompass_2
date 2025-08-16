"use client";

import React from 'react';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

// --- THEME 1: CLASSIC DIAL ---
const ClassicDial = () => (
  <svg width="100%" height="100%" viewBox="0 0 400 400">
    <circle cx="200" cy="200" r="198" fill="hsl(var(--card))" stroke="hsl(var(--foreground))" strokeOpacity="0.5" strokeWidth="4" />
    <circle cx="200" cy="200" r="180" stroke="hsl(var(--border))" strokeWidth="1" />
    {/* Cardinal Directions */}
    <text x="190" y="45" fontSize="32" fontWeight="bold" fill="hsl(var(--primary))" textAnchor="middle">N</text>
    <text x="365" y="208" fontSize="32" fontWeight="bold" fill="hsl(var(--foreground))" textAnchor="middle">E</text>
    <text x="200" y="375" fontSize="32" fontWeight="bold" fill="hsl(var(--foreground))" textAnchor="middle">S</text>
    <text x="35" y="208" fontSize="32" fontWeight="bold" fill="hsl(var(--foreground))" textAnchor="middle">W</text>
    {/* Ticks */}
    {Array.from({ length: 72 }).map((_, i) => (
      <line
        key={i}
        x1="200"
        y1={i % 9 === 0 ? "20" : "30"}
        x2="200"
        y2="40"
        stroke="hsl(var(--foreground))"
        strokeWidth={i % 9 === 0 ? "3" : "1"}
        transform={`rotate(${i * 5}, 200, 200)`}
      />
    ))}
  </svg>
);

// --- THEME 2: MINIMALIST DIAL ---
const MinimalistDial = () => (
  <svg width="100%" height="100%" viewBox="0 0 400 400">
    <circle cx="200" cy="200" r="198" fill="hsl(var(--background))" />
    <circle cx="200" cy="200" r="190" fill="hsl(var(--card))" stroke="hsl(var(--border))" strokeWidth="2" />
    {/* Ticks */}
    {Array.from({ length: 120 }).map((_, i) => (
      <line
        key={i}
        x1="200"
        y1={i % 15 === 0 ? "25" : "35"}
        x2="200"
        y2="40"
        stroke={i % 15 === 0 ? "hsl(var(--primary))" : "hsl(var(--muted-foreground))"}
        strokeWidth={i % 15 === 0 ? "2" : "1"}
        transform={`rotate(${i * 3}, 200, 200)`}
      />
    ))}
  </svg>
);

// --- THEME 3: MODERN DIAL ---
const ModernDial = () => {
  const radius = 150;
  const center = 200;
  return (
    <svg width="100%" height="100%" viewBox="0 0 400 400">
      <circle cx="200" cy="200" r="198" fill="hsl(var(--foreground))" />
      <circle cx="200" cy="200" r="10" fill="hsl(var(--primary))" />
      {Array.from({ length: 12 }).map((_, i) => {
        const angle = i * 30;
        const x = center + radius * Math.sin((angle * Math.PI) / 180);
        const y = center - radius * Math.cos((angle * Math.PI) / 180);
        return (
          <text
            key={angle}
            x={x}
            y={y}
            fontSize="24"
            fill={angle === 0 ? 'hsl(var(--primary))' : 'hsl(var(--primary-foreground))'}
            textAnchor="middle"
            dominantBaseline="middle"
          >
            {angle}
          </text>
        );
      })}
    </svg>
  );
};

const themes = [ClassicDial, MinimalistDial, ModernDial];

interface CompassComponentProps {
  heading: number | null;
  themeIndex: number;
  onThemeChange: (direction: 'next' | 'prev') => void;
}

export const CompassComponent: React.FC<CompassComponentProps> = ({ heading, themeIndex, onThemeChange }) => {
  const DialComponent = themes[themeIndex];
  
  return (
    <div className="flex flex-col items-center">
      <div className="flex items-center justify-center gap-4 w-full max-w-sm sm:max-w-md">
        <Button variant="outline" size="icon" onClick={() => onThemeChange('prev')} aria-label="Previous theme">
          <ArrowLeft className="h-5 w-5" />
        </Button>

        <div className="relative w-[400px] h-[400px]">
          {/* Compass Dial */}
          <div
            className="w-full h-full transition-transform duration-500 ease-in-out"
            style={{ transform: `rotate(${-1 * (heading || 0)}deg)` }}
          >
            <div>
              <DialComponent />
            </div>
          </div>
          
          {/* Direction Indicator */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-0 h-0
            border-l-[15px] border-l-transparent
            border-r-[15px] border-r-transparent
            border-t-[25px] border-t-destructive
            drop-shadow-lg"
            style={{ transform: 'translateX(-50%) translateY(-20px) rotate(180deg)' }}
          />
        </div>

        <Button variant="outline" size="icon" onClick={() => onThemeChange('next')} aria-label="Next theme">
          <ArrowRight className="h-5 w-5" />
        </Button>
      </div>

      {/* Bearing Display */}
      <div className="mt-6 text-center">
        <p className="text-sm text-muted-foreground">Bearing</p>
        <p className="text-5xl font-bold font-mono tracking-tighter text-foreground">
          {heading !== null ? `${Math.round(heading)}°` : '...'}
        </p>
      </div>
    </div>
  );
};
