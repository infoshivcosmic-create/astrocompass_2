"use client";

import { useState, useEffect, useCallback, useRef } from 'react';
import { useGeolocated } from "react-geolocated";
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
  const [rotation, setRotation] = useState<number>(0);
  const [permissionState, setPermissionState] = useState<'prompt' | 'granted' | 'denied' | 'unsupported'>('prompt');
  const [vastuInfo, setVastuInfo] = useState<string | null>(null);
  const [isLoadingVastu, setIsLoadingVastu] = useState(false);
  const [currentThemeIndex, setCurrentThemeIndex] = useState(0);
  const [pointDegree, setPointDegree] = useState(0);
  const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  const rotationRef = useRef(0);
  const lastHeadingRef = useRef<number | null>(null);

  const { coords, isGeolocationAvailable, isGeolocationEnabled } =
    useGeolocated({
      positionOptions: {
        enableHighAccuracy: false,
      },
      userDecisionTimeout: 5000,
    });

  const calcDegreeToPoint = (latitude: number, longitude: number) => {
    // Qibla geolocation
    const point = {
      lat: 21.422487,
      lng: 39.826206,
    };

    const phiK = (point.lat * Math.PI) / 180.0;
    const lambdaK = (point.lng * Math.PI) / 180.0;
    const phi = (latitude * Math.PI) / 180.0;
    const lambda = (longitude * Math.PI) / 180.0;
    const psi =
      (180.0 / Math.PI) *
      Math.atan2(
        Math.sin(lambdaK - lambda),
        Math.cos(phi) * Math.tan(phiK) -
          Math.sin(phi) * Math.cos(lambdaK - lambda)
      );
    return Math.round(psi);
  };

  const locationHandler = (coords: { latitude: number; longitude: number }) => {
    const { latitude, longitude } = coords;
    const resP = calcDegreeToPoint(latitude, longitude);
    console.log("resP", resP);
    if (resP < 0) {
      setPointDegree(resP + 360);
    } else {
      setPointDegree(resP);
    }
  };

  useEffect(() => {
    if (!isGeolocationAvailable) {
      alert("Your browser does not support Geolocation");
    } else if (!isGeolocationEnabled) {
      alert(
        "Geolocation is not enabled, Please allow the location check your setting"
      );
    } else if (coords) {
      locationHandler(coords);
    }
  }, [coords, isGeolocationAvailable, isGeolocationEnabled]);

  useEffect(() => {
    if (typeof window.DeviceOrientationEvent === 'undefined') {
      setPermissionState('unsupported');
    }
  }, []);

  const handleOrientation = useCallback((event: DeviceOrientationEvent) => {
    let rawHeading: number | null = null;

    // iOS
    const webkitCompassHeading = (event as any).webkitCompassHeading;
    if (typeof webkitCompassHeading !== 'undefined') {
      rawHeading = webkitCompassHeading;
    } 
    // Android & other modern browsers
    else if (event.alpha !== null) {
      // The alpha value is the direction the device is pointed in degrees, where 0 is North.
      // We use absolute orientation to avoid issues with device tilting.
      rawHeading = event.absolute ? event.alpha : null;
      if (rawHeading === null) {
        // Fallback for devices that don't support absolute orientation
        rawHeading = event.alpha;
      }
    }

    if (rawHeading !== null) {
      const currentHeading = Math.round(rawHeading);

      // Only update if the heading has changed to a new whole degree
      if (lastHeadingRef.current !== currentHeading) {
        setHeading(currentHeading);
        
        const lastHeading = lastHeadingRef.current ?? currentHeading;
        let diff = currentHeading - lastHeading;

        // Find the shortest path for rotation
        if (diff > 180) {
          diff -= 360; // shortest path is counter-clockwise
        } else if (diff < -180) {
          diff += 360; // shortest path is clockwise
        }

        const newRotation = rotationRef.current + diff;
        rotationRef.current = newRotation;
        lastHeadingRef.current = currentHeading;
        
        // We set the state that will be passed to the component for CSS rotation
        setRotation(newRotation);
      }
    }
  }, []);
  
  const requestPermission = async () => {
    const DOE = DeviceOrientationEvent as unknown as DeviceOrientationEventiOS;
    if (typeof DOE.requestPermission === 'function') {
      try {
        const permission = await DOE.requestPermission();
        if (permission === 'granted') {
          setPermissionState('granted');
          // Prefer 'deviceorientationabsolute' for more accurate readings on supported devices
          if ('ondeviceorientationabsolute' in window) {
            window.addEventListener('deviceorientationabsolute', handleOrientation, true);
          } else {
            window.addEventListener('deviceorientation', handleOrientation, true);
          }
        } else {
          setPermissionState('denied');
        }
      } catch {
        setPermissionState('denied');
      }
    } else {
      // For browsers that don't require permission (like Android Chrome)
      setPermissionState('granted');
      if ('ondeviceorientationabsolute' in window) {
        window.addEventListener('deviceorientationabsolute', handleOrientation, true);
      } else {
        window.addEventListener('deviceorientation', handleOrientation, true);
      }
    }
  };

  const getVastuInfo = useCallback(async (currentHeading: number) => {
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }
    
    debounceTimeoutRef.current = setTimeout(async () => {
      setIsLoadingVastu(true);
      try {
        const result: VastuShastraInformationOutput = await vastuShastraInformation({ direction: Math.round(currentHeading) });
        setVastuInfo(result.vastuInfo);
      } catch (error) {
        console.error("Error fetching Vastu info:", error);
        setVastuInfo("Could not retrieve Vastu information at this time.");
      }
      setIsLoadingVastu(false);
    }, 500);
  }, []);

  useEffect(() => {
    if (heading === null || permissionState !== 'granted') return;
    getVastuInfo(heading);

    return () => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
    };
  }, [heading, permissionState, getVastuInfo]);
  
  useEffect(() => {
    // Cleanup function to remove event listeners
    return () => {
      window.removeEventListener('deviceorientation', handleOrientation, true);
      window.removeEventListener('deviceorientationabsolute', handleOrientation, true);
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
    };
  }, [handleOrientation]);

  const handleThemeChange = (direction: 'next' | 'prev') => {
    setCurrentThemeIndex(prev => {
      const totalThemes = 3; 
      if (direction === 'next') {
        return (prev + 1) % totalThemes;
      } else {
        return (prev - 1 + totalThemes) % totalThemes;
      }
    });
  }
  
  const renderContent = () => {
    switch (permissionState) {
      case 'granted':
        return (
          <>
            <div className="relative flex items-center justify-center">
              <CompassComponent
                heading={heading}
                themeIndex={currentThemeIndex}
                onThemeChange={handleThemeChange}
              />
              <div className="my-point" style={{ transform: `rotate(${pointDegree}deg) translateX(-50%)` }} />
              <div className="my-point" style={{ transform: `rotate(${pointDegree}deg) translateX(-50%)` }} />
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
