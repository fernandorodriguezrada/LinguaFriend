
'use client';

import type { FeatureToggleState } from '@/lib/types';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ListFilter, Brain, Wand2 } from 'lucide-react'; // Added Wand2 for suggestions

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
          <Label htmlFor="showSynonyms" className="text-base cursor-pointer flex items-center gap-2">
            Mostrar Sinónimos
          </Label>
          <Switch
            id="showSynonyms"
            name="showSynonyms"
            checked={toggles.showSynonyms}
            onCheckedChange={() => handleToggle('showSynonyms')}
            aria-label="Mostrar u ocultar sinónimos"
          />
        </div>
        <div className="flex items-center justify-between space-x-2 p-2 rounded-md hover:bg-muted/50 transition-colors">
          <Label htmlFor="showUsageTips" className="text-base cursor-pointer flex items-center gap-2">
            Mostrar Consejos de Uso
          </Label>
          <Switch
            id="showUsageTips"
            name="showUsageTips"
            checked={toggles.showUsageTips}
            onCheckedChange={() => handleToggle('showUsageTips')}
            aria-label="Mostrar u ocultar consejos de uso"
          />
        </div>
        <div className="flex items-center justify-between space-x-2 p-2 rounded-md hover:bg-muted/50 transition-colors">
          <Label htmlFor="focusOnVerbs" className="text-base cursor-pointer flex items-center gap-2">
            Enfocar en Verbos
          </Label>
          <Switch
            id="focusOnVerbs"
            name="focusOnVerbs"
            checked={toggles.focusOnVerbs}
            onCheckedChange={() => handleToggle('focusOnVerbs')}
            aria-label="Enfocar el análisis solo en verbos"
          />
        </div>
        <div className="flex items-center justify-between space-x-2 p-2 rounded-md hover:bg-muted/50 transition-colors">
          <Label htmlFor="eli5Mode" className="text-base cursor-pointer flex items-center gap-2">
            <Brain className="h-4 w-4 text-blue-500" /> Explicación Sencilla (ELI5)
          </Label>
          <Switch
            id="eli5Mode"
            name="eli5Mode"
            checked={toggles.eli5Mode}
            onCheckedChange={() => handleToggle('eli5Mode')}
            aria-label="Activar modo de explicación sencilla"
          />
        </div>
        <div className="flex items-center justify-between space-x-2 p-2 rounded-md hover:bg-muted/50 transition-colors">
          <Label htmlFor="showImprovementSuggestions" className="text-base cursor-pointer flex items-center gap-2">
            <Wand2 className="h-4 w-4 text-purple-500" /> Mostrar Sugerencias de Mejora
          </Label>
          <Switch
            id="showImprovementSuggestions"
            name="showImprovementSuggestions"
            checked={toggles.showImprovementSuggestions}
            onCheckedChange={() => handleToggle('showImprovementSuggestions')}
            aria-label="Mostrar u ocultar sugerencias de mejora de oración"
          />
        </div>
      </CardContent>
    </Card>
  );
}
