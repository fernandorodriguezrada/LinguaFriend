'use client';

import * as React from 'react';
import { Moon, Sun } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function ThemeToggle() {
  const [theme, setThemeState] = React.useState<'theme-light' | 'dark' | 'system'>('system');

  React.useEffect(() => {
    const isDarkMode = document.documentElement.classList.contains('dark');
    setThemeState(isDarkMode ? 'dark' : 'theme-light');
  }, []);

  React.useEffect(() => {
    const isDark =
      theme === 'dark' ||
      (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
    document.documentElement.classList[isDark ? 'add' : 'remove']('dark');
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setThemeState(prevTheme => (prevTheme === 'dark' ? 'theme-light' : 'dark'));
  };

  return (
    <Button variant="ghost" size="icon" onClick={toggleTheme} aria-label="Toggle theme">
      {theme === 'dark' ? (
        <Sun className="h-[1.2rem] w-[1.2rem]" />
      ) : (
        <Moon className="h-[1.2rem] w-[1.2rem]" />
      )}
    </Button>
  );
}
