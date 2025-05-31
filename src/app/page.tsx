
'use client';

import React, { useState, useTransition, useCallback, useRef, useEffect } from 'react';
import { Header } from '@/components/layout/Header';
import { SentenceInputForm } from '@/components/linguist/SentenceInputForm';
import { AnalysisDisplay } from '@/components/linguist/AnalysisDisplay';
import { TranslationDisplay } from '@/components/linguist/TranslationDisplay';
import { FeatureToggleControls } from '@/components/linguist/FeatureToggleControls';
import type { FeatureToggleState, AnalysisResult, ImprovementResult } from '@/lib/types';
import { CommonMistakesDisplay } from '@/components/linguist/CommonMistakesDisplay';
import { handleAnalyzeSentence, type ActionState } from './actions';
import { Loader2, AlertTriangle } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

const initialActionState: ActionState = {
  data: null,
  improvementData: null,
  error: null,
  originalSentence: '',
};

const initialFeatureToggles: FeatureToggleState = {
  showSynonyms: true,
  showUsageTips: true,
  focusOnVerbs: false,
  eli5Mode: false,
};

export default function LinguaFriendPage() {
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult>(null);
  const [improvementResult, setImprovementResult] = useState<ImprovementResult>(null);
  const [currentSentence, setCurrentSentence] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  const [featureToggles, setFeatureToggles] = useState<FeatureToggleState>(initialFeatureToggles);

  const [isPending, startTransition] = useTransition();
  const resultsContainerRef = useRef<HTMLDivElement>(null);

  const handleAnalysisFormSubmit = useCallback((result: ActionState) => {
    startTransition(() => {
      setCurrentSentence(result.originalSentence || '');
      if (result.error) {
        setError(result.error);
        setAnalysisResult(null);
        setImprovementResult(null);
      } else {
        setAnalysisResult(result.data);
        setImprovementResult(result.improvementData);
        setError(null);
      }
    });
  }, [startTransition]);

  useEffect(() => {
    if (resultsContainerRef.current && !isPending && !error && (analysisResult || improvementResult?.hasImprovements)) {
      resultsContainerRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [analysisResult, improvementResult, error, isPending]);


  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-8 md:px-6 md:py-12">
        <div className="grid gap-12 lg:grid-cols-3">
          <div className="lg:col-span-1 space-y-6">
            <Card className="shadow-xl">
              <CardContent className="p-6">
                <SentenceInputForm
                  onAnalysisResult={handleAnalysisFormSubmit}
                  initialState={initialActionState}
                  serverAction={handleAnalyzeSentence}
                  currentFeatureToggles={featureToggles}
                />
              </CardContent>
            </Card>
            <FeatureToggleControls toggles={featureToggles} onToggleChange={setFeatureToggles} />
          </div>

          <div className="lg:col-span-2 space-y-8">
            {isPending && (
              <div className="flex flex-col items-center justify-center p-10 bg-card rounded-lg shadow-md">
                <Loader2 className="h-12 w-12 animate-spin text-primary" />
                <p className="mt-4 text-lg text-muted-foreground">Analizando tu oración...</p>
              </div>
            )}

            {!isPending && error && (
              <Card className="border-destructive bg-destructive/10 shadow-md">
                <CardContent className="p-6 flex flex-col items-center text-center">
                  <AlertTriangle className="h-12 w-12 text-destructive" />
                  <h3 className="mt-4 text-xl font-semibold text-destructive font-headline">Error en el Análisis</h3>
                  <p className="mt-2 text-destructive/90">{error}</p>
                </CardContent>
              </Card>
            )}
            
            {!isPending && !error && (
              <div ref={resultsContainerRef}>
                {(analysisResult || improvementResult?.hasImprovements) ? (
                  <div className="space-y-8">
                    <TranslationDisplay originalSentence={currentSentence} />
                    {improvementResult && improvementResult.hasImprovements && (
                      <CommonMistakesDisplay improvement={improvementResult} />
                    )}
                    {analysisResult && (
                      <AnalysisDisplay 
                        analysis={analysisResult} 
                        featureToggles={featureToggles} 
                      />
                    )}
                  </div>
                ) : (
                  <Card className="shadow-md">
                      <CardContent className="p-10 text-center">
                          <h2 className="text-2xl font-headline text-foreground/80">Bienvenido a LinguaFriend</h2>
                          <p className="mt-2 text-muted-foreground">
                              Escribe una oración en inglés en el panel de la izquierda y presiona "Analizar Oración" para comenzar.
                          </p>
                           <img 
                             src="https://placehold.co/600x400.png" 
                             alt="Image illustrating confusing English words or grammar concepts" 
                             data-ai-hint="english learning grammar" 
                             className="mt-6 rounded-[10px] mx-auto shadow-lg border-2 border-primary/90"
                             style={{borderColor: 'hsl(210deg 100% 75% / 90%)'}}
                           />
                      </CardContent>
                  </Card>
                )}
              </div>
            )}
          </div>
        </div>
      </main>
      <footer className="py-6 text-center text-sm text-muted-foreground border-t border-border/40">
        © {new Date().getFullYear()} LinguaFriend. Hecho con ❤️ para aprender inglés.
      </footer>
    </div>
  );
}
