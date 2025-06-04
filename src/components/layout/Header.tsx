
import { Sparkles, ZoomIn } from 'lucide-react';
import { ThemeToggle } from '@/components/ThemeToggle';
import { Button } from '@/components/ui/button';

export function Header() {
  const handleZoomClick = () => {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('zoomToAnalysisContent'));
    }
  };

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
          <Button variant="ghost" size="icon" onClick={handleZoomClick} aria-label="Zoom to content">
            <ZoomIn className="h-[1.2rem] w-[1.2rem]" />
          </Button>
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
