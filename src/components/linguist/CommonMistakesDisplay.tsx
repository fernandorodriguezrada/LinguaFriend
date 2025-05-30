
'use client';

import type { ImproveSentenceOutput } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Lightbulb, AlertCircle } from 'lucide-react';

interface CommonMistakesDisplayProps {
  improvement: ImproveSentenceOutput;
}

export function CommonMistakesDisplay({ improvement }: CommonMistakesDisplayProps) {
  if (!improvement || !improvement.hasImprovements) {
    // If no improvements or data, can optionally render nothing or a "all good" message
    // For now, let's only render if there are actual improvements to show.
    // The parent component can decide to show a "No mistakes found!" message if desired.
    return null; 
  }

  return (
    <Card className="shadow-lg border-yellow-500/50 bg-yellow-500/10">
      <CardHeader>
        <CardTitle className="text-xl font-headline flex items-center gap-2 text-yellow-700 dark:text-yellow-400">
          {improvement.hasImprovements ? <Lightbulb className="h-5 w-5" /> : <AlertCircle className="h-5 w-5" />}
          Sugerencias y Correcciones
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {improvement.hasImprovements && (
          <div>
            <h4 className="font-semibold text-yellow-800 dark:text-yellow-300">Oración Sugerida:</h4>
            <p className="text-yellow-700 dark:text-yellow-400 text-lg font-medium">{improvement.improvedSentence}</p>
          </div>
        )}
        <div>
          <h4 className="font-semibold text-yellow-800 dark:text-yellow-300">Explicación:</h4>
          <p className="text-yellow-700 dark:text-yellow-400 whitespace-pre-line">{improvement.explanation}</p>
        </div>
      </CardContent>
    </Card>
  );
}
