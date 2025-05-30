'use client';

import type { AnalyzeSentenceOutput } from '@/ai/flows/analyze-sentence';
import type { FeatureToggleState } from '@/lib/types';
import { WordCard } from './WordCard';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { CheckCircle2, BookMarked, ListTree } from 'lucide-react';

interface AnalysisDisplayProps {
  analysis: AnalyzeSentenceOutput;
  featureToggles: FeatureToggleState;
}

export function AnalysisDisplay({ analysis, featureToggles }: AnalysisDisplayProps) {
  const { tense, grammarBreakdown, wordAnalysis } = analysis;

  const filteredWordAnalysis = featureToggles.focusOnVerbs
    ? wordAnalysis.filter(word => word.role.toLowerCase().includes('verb'))
    : wordAnalysis;

  if (!analysis) return null;

  return (
    <div className="space-y-6">
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl font-headline flex items-center gap-2">
            <CheckCircle2 className="h-6 w-6 text-primary" />
            Resumen del Análisis
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h3 className="text-lg font-semibold font-headline text-foreground/90">Tiempo Verbal:</h3>
            <p className="text-muted-foreground">{tense}</p>
          </div>
          <div>
            <h3 className="text-lg font-semibold font-headline text-foreground/90">Análisis Gramatical General:</h3>
            <p className="text-muted-foreground">{grammarBreakdown}</p>
          </div>
        </CardContent>
      </Card>

      {filteredWordAnalysis.length > 0 && (
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl font-headline flex items-center gap-2">
              <ListTree className="h-6 w-6 text-primary" />
              Análisis Detallado por Palabra
            </CardTitle>
            <CardDescription>
              {featureToggles.focusOnVerbs ? "Mostrando solo verbos." : "Haz clic en cada palabra para ver detalles."}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Accordion type="multiple" className="w-full space-y-3">
              {filteredWordAnalysis.map((wordData, index) => (
                <AccordionItem key={index} value={`item-${index}`} className="border-b-0">
                  <AccordionTrigger className="bg-card hover:bg-muted/50 p-4 rounded-md shadow font-semibold text-lg">
                    {wordData.word}
                  </AccordionTrigger>
                  <AccordionContent className="p-1 pt-2">
                    <WordCard wordAnalysis={wordData} featureToggles={featureToggles} />
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </CardContent>
        </Card>
      )}
       {featureToggles.focusOnVerbs && filteredWordAnalysis.length === 0 && (
        <Card className="shadow-lg">
          <CardContent className="p-6">
             <p className="text-muted-foreground text-center">No se encontraron verbos en esta oración o el análisis no identificó verbos.</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
