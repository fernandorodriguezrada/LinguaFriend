
'use client';

import { useState, useEffect, useCallback } from 'react';
import { Sparkles, ZoomIn } from 'lucide-react';
import { ThemeToggle } from '@/components/ThemeToggle';
import { Button } from '@/components/ui/button';

export function Header() {
  const [isPageInFocusMode, setIsPageInFocusMode] = useState(false);

  const handleZoomClick = useCallback(() => {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('zoomToAnalysisContent'));
    }
  }, []);

  useEffect(() => {
    const handleFocusModeChange = (event: Event) => {
      const customEvent = event as CustomEvent<{ isFocusModeActive: boolean }>;
      if (customEvent.detail && typeof customEvent.detail.isFocusModeActive === 'boolean') {
        setIsPageInFocusMode(customEvent.detail.isFocusModeActive);
      }
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('focusModeStateChange', handleFocusModeChange);
    }

    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('focusModeStateChange', handleFocusModeChange);
      }
    };
  }, []);

  return (
    <header className="py-4 px-6 border-b border-border/40">
      <div className="container mx-auto flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles className="h-7 w-7 text-primary" />
          <h1 className="text-2xl font-headline font-semibold text-foreground">
            LinguaFriend
          </h1>
        </div>
        <div className="flex items-center gap-2">
          {!isPageInFocusMode && (
            <Button variant="ghost" size="icon" onClick={handleZoomClick} aria-label="Enfocar contenido de análisis">
              <ZoomIn className="h-[1.2rem] w-[1.2rem]" />
            </Button>
          )}
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
