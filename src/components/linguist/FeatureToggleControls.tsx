'use client';

import type { FeatureToggleState } from '@/lib/types';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ListFilter } from 'lucide-react';

interface FeatureToggleControlsProps {
  toggles: FeatureToggleState;
  onToggleChange: (toggles: FeatureToggleState) => void;
}

export function FeatureToggleControls({ toggles, onToggleChange }: FeatureToggleControlsProps) {
  const handleToggle = (key: keyof FeatureToggleState) => {
    onToggleChange({ ...toggles, [key]: !toggles[key] });
  };

  return (
    <Card className="shadow-md">
      <CardHeader>
        <CardTitle className="text-xl font-headline flex items-center gap-2">
          <ListFilter className="h-5 w-5 text-primary" />
          Opciones de Visualización
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between space-x-2 p-2 rounded-md hover:bg-muted/50 transition-colors">
          <Label htmlFor="showSynonyms" className="text-base cursor-pointer">
            Mostrar Sinónimos
          </Label>
          <Switch
            id="showSynonyms"
            checked={toggles.showSynonyms}
            onCheckedChange={() => handleToggle('showSynonyms')}
            aria-label="Mostrar u ocultar sinónimos"
          />
        </div>
        <div className="flex items-center justify-between space-x-2 p-2 rounded-md hover:bg-muted/50 transition-colors">
          <Label htmlFor="showUsageTips" className="text-base cursor-pointer">
            Mostrar Consejos de Uso
          </Label>
          <Switch
            id="showUsageTips"
            checked={toggles.showUsageTips}
            onCheckedChange={() => handleToggle('showUsageTips')}
            aria-label="Mostrar u ocultar consejos de uso"
          />
        </div>
        <div className="flex items-center justify-between space-x-2 p-2 rounded-md hover:bg-muted/50 transition-colors">
          <Label htmlFor="focusOnVerbs" className="text-base cursor-pointer">
            Enfocar en Verbos
          </Label>
          <Switch
            id="focusOnVerbs"
            checked={toggles.focusOnVerbs}
            onCheckedChange={() => handleToggle('focusOnVerbs')}
            aria-label="Enfocar el análisis solo en verbos"
          />
        </div>
      </CardContent>
    </Card>
  );
}
