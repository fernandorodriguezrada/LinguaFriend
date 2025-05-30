
'use client';

import type { ExtendedAnalyzeSentenceOutput } from '@/lib/types';
import type { FeatureToggleState } from '@/lib/types';
import { WordCard } from './WordCard';
import { ColorCodedSentence, GrammarLegend } from './ColorCodedSentence';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { CheckCircle2, BookMarked, ListTree, MessageSquareQuote } from 'lucide-react';

interface AnalysisDisplayProps {
  analysis: ExtendedAnalyzeSentenceOutput;
  featureToggles: FeatureToggleState;
}

export function AnalysisDisplay({ analysis, featureToggles }: AnalysisDisplayProps) {
  const { tense, grammarBreakdown, wordAnalysis, sentenceParts, idiomExplanation } = analysis;

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
          {sentenceParts && sentenceParts.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold font-headline text-foreground/90 mb-1">Oración Analizada:</h3>
              <ColorCodedSentence sentenceParts={sentenceParts} />
              <GrammarLegend />
            </div>
          )}
          <div>
            <h3 className="text-lg font-semibold font-headline text-foreground/90 mt-3">Tiempo Verbal:</h3>
            <p className="text-muted-foreground whitespace-pre-line">{tense}</p>
          </div>
          <div>
            <h3 className="text-lg font-semibold font-headline text-foreground/90 mt-3">Análisis Gramatical General:</h3>
            <p className="text-muted-foreground whitespace-pre-line">{grammarBreakdown}</p>
          </div>
          {idiomExplanation && (
            <div>
              <h3 className="text-lg font-semibold font-headline text-foreground/90 mt-3 flex items-center gap-2">
                <MessageSquareQuote className="h-5 w-5 text-primary" />
                Contexto Cultural / Modismos:
              </h3>
              <p className="text-muted-foreground whitespace-pre-line">{idiomExplanation}</p>
            </div>
          )}
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
