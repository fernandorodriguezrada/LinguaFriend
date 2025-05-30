import { Sparkles } from 'lucide-react';
import { ThemeToggle } from '@/components/ThemeToggle';

export function Header() {
  return (
    <header className="py-4 px-6 border-b border-border/40">
      <div className="container mx-auto flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles className="h-7 w-7 text-primary" />
          <h1 className="text-2xl font-headline font-semibold text-foreground">
            LinguaFriend
          </h1>
        </div>
        <ThemeToggle />
      </div>
    </header>
  );
}
