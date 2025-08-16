"use client";

import { useState, useEffect, useCallback } from 'react';
import { Compass, Home, Info, Loader2 } from 'lucide-react';
import { vastuShastraInformation, VastuShastraInformationOutput } from '@/ai/flows/vastu-shastra-information';
import Image from 'next/image';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { CompassComponent } from '@/components/compass';

const VastuCard = ({ info, isLoading }: { info: string | null; isLoading: boolean }) => (
  <Card className="w-full max-w-md mt-8 shadow-lg">
    <CardHeader>
      <CardTitle className="flex items-center gap-2">
        <Home className="w-5 h-5 text-primary" />
        Vastu Shastra Insight
      </CardTitle>
    </CardHeader>
    <CardContent>
      {isLoading ? (
        <div className="space-y-2">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-[80%]" />
        </div>
      ) : (
        <p className="text-sm text-muted-foreground">{info || "Point your device in a direction to get Vastu insights."}</p>
      )}
    </CardContent>
  </Card>
);

export default function TrueNorthPage() {
  const [heading, setHeading] = useState<number | null>(null);
  const [permissionState, setPermissionState] = useState<'prompt' | 'granted' | 'denied' | 'unsupported'>('prompt');
  const [vastuInfo, setVastuInfo] = useState<string | null>(null);
  const [isLoadingVastu, setIsLoadingVastu] = useState(false);
  const [currentThemeIndex, setCurrentThemeIndex] = useState(0);

  useEffect(() => {
    if (typeof window.DeviceOrientationEvent === 'undefined') {
      setPermissionState('unsupported');
    }
  }, []);

  const handleOrientation = (event: DeviceOrientationEvent) => {
    // webkitCompassHeading is for iOS
    const newHeading = (event as any).webkitCompassHeading || (360 - event.alpha!);
    setHeading(Math.round(newHeading));
  };

  const requestPermission = async () => {
    const DOE = DeviceOrientationEvent as any;
    if (typeof DOE.requestPermission === 'function') {
      try {
        const permission = await DOE.requestPermission();
        if (permission === 'granted') {
          window.addEventListener('deviceorientation', handleOrientation);
          setPermissionState('granted');
        } else {
          setPermissionState('denied');
        }
      } catch (error) {
        setPermissionState('denied');
      }
    } else {
      // For non-iOS 13+ devices
      window.addEventListener('deviceorientation', handleOrientation);
      setPermissionState('granted');
    }
  };

  const getVastuInfo = useCallback(async (currentHeading: number) => {
    setIsLoadingVastu(true);
    try {
      const result: VastuShastraInformationOutput = await vastuShastraInformation({ direction: currentHeading });
      setVastuInfo(result.vastuInfo);
    } catch (error) {
      console.error("Error fetching Vastu info:", error);
      setVastuInfo("Could not retrieve Vastu information at this time.");
    }
    setIsLoadingVastu(false);
  }, []);

  useEffect(() => {
    if (heading === null || permissionState !== 'granted') return;

    const handler = setTimeout(() => {
      getVastuInfo(heading);
    }, 1000); // 1-second debounce

    return () => {
      clearTimeout(handler);
    };
  }, [heading, permissionState, getVastuInfo]);
  
  const handleThemeChange = (direction: 'next' | 'prev') => {
    setCurrentThemeIndex(prev => {
      const totalThemes = 2; // Corresponds to the number of themes in CompassComponent
      if (direction === 'next') {
        return (prev + 1) % totalThemes;
      } else {
        return (prev - 1 + totalThemes) % totalThemes;
      }
    });
  }
  
  const DirectionIndicator = () => (
    <div
      className="absolute top-[-30px] w-0 h-0
        border-l-[10px] border-l-transparent
        border-r-[10px] border-r-transparent
        border-b-[20px] border-b-destructive
        drop-shadow-lg z-10"
      style={{ left: '50%', transform: 'translateX(-50%)' }}
     />
  );

  const renderContent = () => {
    switch (permissionState) {
      case 'granted':
        return (
          <>
            <div className="relative flex items-center justify-center">
              <DirectionIndicator />
              <CompassComponent
                heading={heading}
                themeIndex={currentThemeIndex}
                onThemeChange={handleThemeChange}
              />
            </div>

            <VastuCard info={vastuInfo} isLoading={isLoadingVastu} />
          </>
        );
      case 'prompt':
        return (
          <div className="text-center p-8 border-2 border-dashed rounded-xl">
            <h2 className="text-2xl font-bold mb-4">Welcome to Shiv Astro Vastu</h2>
            <p className="text-muted-foreground mb-6 max-w-sm">Click the button below to activate the compass and allow orientation sensor access.</p>
            <Button size="lg" onClick={requestPermission}>
              <Compass className="mr-2 h-5 w-5" /> Start Compass
            </Button>
          </div>
        );
      case 'denied':
        return (
          <div className="text-center p-8 bg-card rounded-xl shadow-md">
            <Info className="mx-auto h-12 w-12 text-destructive mb-4" />
            <h2 className="text-2xl font-bold mb-2">Permission Denied</h2>
            <p className="text-muted-foreground">You have denied access to the device orientation sensor. Please enable it in your browser settings to use the compass.</p>
          </div>
        );
      case 'unsupported':
         return (
          <div className="text-center p-8 bg-card rounded-xl shadow-md">
            <Info className="mx-auto h-12 w-12 text-destructive mb-4" />
            <h2 className="text-2xl font-bold mb-2">Sensor Not Supported</h2>
            <p className="text-muted-foreground">Your browser or device does not support the necessary orientation sensors for this application.</p>
          </div>
        );
      default:
        return <Loader2 className="h-12 w-12 animate-spin" />;
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-background font-body">
      <header className="flex items-center justify-start p-4 border-b relative">
        <Image 
          src="/images/logo.png"
          data-ai-hint="logo"
          alt="Logo"
          width={50}
          height={50}
        />
        <h1 className="text-2xl font-bold absolute left-1/2 -translate-x-1/2">Shiv Astro Vastu</h1>
      </header>
      <main className="flex flex-1 w-full flex-col items-center justify-center p-4">
        {renderContent()}
      </main>
    </div>
  );
}
