
'use client';

import React, { useState, useTransition, useCallback } from 'react';
import { Header } from '@/components/layout/Header';
import { SentenceInputForm } from '@/components/linguist/SentenceInputForm';
import { AnalysisDisplay } from '@/components/linguist/AnalysisDisplay';
import { TranslationDisplay } from '@/components/linguist/TranslationDisplay';
import { FeatureToggleControls } from '@/components/linguist/FeatureToggleControls';
import type { FeatureToggleState, AnalysisResult } from '@/lib/types';
import { handleAnalyzeSentence, type ActionState } from './actions';
import { Loader2, AlertTriangle } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

const initialActionState: ActionState = {
  data: null,
  error: null,
  originalSentence: '',
};

export default function LinguaFriendPage() {
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult>(null);
  const [currentSentence, setCurrentSentence] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  const [featureToggles, setFeatureToggles] = useState<FeatureToggleState>({
    showSynonyms: true,
    showUsageTips: true,
    focusOnVerbs: false,
  });

  const [isPending, startTransition] = useTransition();

  const handleAnalysisFormSubmit = useCallback((result: ActionState) => {
    startTransition(() => {
      if (result.error) {
        setError(result.error);
        setAnalysisResult(null);
        setCurrentSentence(result.originalSentence || '');
      } else if (result.data) {
        setAnalysisResult(result.data);
        setCurrentSentence(result.originalSentence || '');
        setError(null);
      } else {
        // This block is hit if result.error is null AND result.data is null.
        // Only set an error if an actual submission likely occurred.
        if (result.originalSentence && result.originalSentence !== '') {
          // An original sentence was provided, but no data or error came back.
          setError("Respuesta inesperada del servidor.");
          setAnalysisResult(null);
          setCurrentSentence(result.originalSentence);
        } else {
          // No original sentence, no data, no error. This is likely the initial state.
          // Do not set an error. Ensure UI remains in a clean initial state.
          setError(null);
          setAnalysisResult(null);
          setCurrentSentence('');
        }
      }
    });
  }, [startTransition]);


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

            {!isPending && !error && analysisResult && (
              <>
                <TranslationDisplay originalSentence={currentSentence} />
                <AnalysisDisplay analysis={analysisResult} featureToggles={featureToggles} />
              </>
            )}

            {!isPending && !error && !analysisResult && (
                <Card className="shadow-md">
                    <CardContent className="p-10 text-center">
                        <h2 className="text-2xl font-headline text-foreground/80">Bienvenido a LinguaFriend</h2>
                        <p className="mt-2 text-muted-foreground">
                            Escribe una oración en inglés en el panel de la izquierda y presiona "Analizar Oración" para comenzar.
                        </p>
                         <img src="https://placehold.co/600x400.png" alt="Image illustrating confusing English words" data-ai-hint="english words" className="mt-6 rounded-[10px] mx-auto shadow-lg border-2 border-primary/90" />
                    </CardContent>
                </Card>
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

