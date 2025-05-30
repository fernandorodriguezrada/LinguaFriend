'use client';

import type { AnalyzeSentenceOutput } from '@/ai/flows/analyze-sentence';
import type { FeatureToggleState } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BookOpenText } from 'lucide-react';

interface WordCardProps {
  wordAnalysis: AnalyzeSentenceOutput['wordAnalysis'][0];
  featureToggles: FeatureToggleState;
}

export function WordCard({ wordAnalysis, featureToggles }: WordCardProps) {
  const { word, role, definition, synonyms, usageTips } = wordAnalysis;

  return (
    <Card className="bg-card/80 shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-xl font-headline">
           <BookOpenText className="h-5 w-5 text-primary" />
          {word}
          <Badge variant="secondary" className="ml-auto font-normal">{role}</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div>
          <h4 className="font-semibold text-foreground/90">Definición:</h4>
          <p className="text-muted-foreground">{definition}</p>
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
            <p className="text-muted-foreground">{usageTips}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
