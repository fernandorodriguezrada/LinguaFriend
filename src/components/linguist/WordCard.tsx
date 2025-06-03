
'use client';

import type { WordAnalysisDetail } from '@/lib/types';
import type { FeatureToggleState } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
// Removed Checkbox and Label as word-level selection is removed
import { BookOpenText, Volume2 } from 'lucide-react';

interface WordCardProps {
  wordAnalysis: WordAnalysisDetail;
  featureToggles: FeatureToggleState;
  // Removed selectable, isSelected, onSelectToggle
}

export function WordCard({ 
  wordAnalysis, 
  featureToggles,
}: WordCardProps) {
  const { word, role, definition, synonyms, usageTips } = wordAnalysis;

  const handlePronunciation = () => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(word);
      utterance.lang = 'en-US';
      window.speechSynthesis.speak(utterance);
    } else {
      alert(`Pronunciación para "${word}" (funcionalidad no implementada o no soportada por el navegador).`);
    }
  };

  // Removed handleCheckboxChange and uniqueId as checkbox is removed

  return (
    <Card className="bg-card/80 shadow-lg">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-xl font-headline">
            <BookOpenText className="h-5 w-5 text-primary" />
            {word}
          </CardTitle>
          <div className="flex items-center gap-2">
            {/* Removed Checkbox and Label */}
            <Badge variant="secondary" className="font-normal">{role}</Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div>
          <h4 className="font-semibold text-foreground/90">Definición:</h4>
          <p className="text-muted-foreground whitespace-pre-line">{definition}</p>
        </div>
        {featureToggles.showSynonyms && synonyms && synonyms.length > 0 && (
          <div>
            <h4 className="font-semibold text-foreground/90">Sinónimos:</h4>
            <div className="flex flex-wrap gap-2">
              {synonyms.map((synonym, index) => (
                <Badge key={index} variant="outline">{synonym}</Badge>
              ))}
            </div>
          </div>
        )}
        {featureToggles.showUsageTips && usageTips && (
          <div>
            <h4 className="font-semibold text-foreground/90">Consejos de Uso:</h4>
            <p className="text-muted-foreground whitespace-pre-line">{usageTips}</p>
          </div>
        )}
        <div className="pt-2">
          <Button variant="outline" size="sm" onClick={handlePronunciation} className="flex items-center gap-2">
            <Volume2 className="h-4 w-4" />
            Escuchar
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
