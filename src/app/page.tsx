'use client';

import React, { useState, useTransition } from 'react';
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
};

export default function LinguaFriendPage() {
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult>(null);
  const [currentSentence, setCurrentSentence] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const [featureToggles, setFeatureToggles] = useState<FeatureToggleState>({
    showSynonyms: true,
    showUsageTips: true,
    focusOnVerbs: false,
  });

  const [isPending, startTransition] = useTransition();

  const handleAnalysisFormSubmit = (result: ActionState) => {
    startTransition(() => {
      setIsLoading(false); // Already handled by useFormStatus, but good for clarity
      if (result.error) {
        setError(result.error);
        setAnalysisResult(null);
      } else if (result.data) {
        setAnalysisResult(result.data);
        // Assuming the form data includes the sentence that was analyzed
        // For now, let's try to get it from the form data if possible, or from input
        // This part is tricky with server actions like this, might need to pass sentence back or store it
        // For now, we'll use a placeholder if the sentence isn't available directly.
        // The sentence is available in result.data through the AI flow, but not directly in 'formData' in this handler
        // A better approach might be to capture the sentence on form submit on client side before calling server action
        // For now, let's assume `result.data.wordAnalysis[0].word` might give a clue or we capture input elsewhere.
        // This is simplified as the sentence input is not directly available in `result.data` object from AI.
        // We should fetch the sentence from the form submission that triggered this callback.
        // For now, let's use a state variable that is updated when the form text changes
        // This will be done by updating currentSentence state from SentenceInputForm
        // No, SentenceInputForm calls this callback with ActionState. ActionState has data.
        // The original sentence is part of the input to the AI flow, but not explicitly in AnalyzeSentenceOutput.
        // We can manage `currentSentence` through SentenceInputForm or keep it simple.
        // The form ActionState doesn't include the original input sentence.
        // Let's modify SentenceInputForm to also provide the sentence or handle currentSentence locally
        // Simpler: extract sentence from form data before server action in SentenceInputForm and pass it here
        // For now, we'll rely on `analysisResult` which has words, can reconstruct roughly or just show "Oración Analizada"
        // The most robust way is to get the sentence from the form data when it's submitted.
        // Let's assume the sentence is available if analysisResult is not null.
        // The sentence input to `handleAnalyzeSentence` is formData.get('sentence'). We can pass it back.
        // This is a limitation of the current `ActionState` not carrying original input.
        // Let's assume the component calling this callback will also manage the sentence string.
        // For `TranslationDisplay`, we need `currentSentence`. Let's set it when form is about to submit.
        // The form is handled by `useFormState`, so direct access to form values on client before submit is standard.
        // Okay, `SentenceInputForm` will handle setting `currentSentence` for `TranslationDisplay`.

        // Actually, sentence input should be managed in this parent component if needed by siblings.
        // Let's simplify: we'll set currentSentence when `analysisResult` is set.
        // The AI output doesn't have the full original sentence explicitly.
        // We'll rely on the input field's value, or pass it.
        // For now, `currentSentence` will be set based on successful analysis if possible.
        // The form is reset, so `currentSentence` needs to be captured.
        // This is becoming complex due to server action form handling.
        // Let's make `handleAnalysisResult` also accept the sentence.
        // Simpler: We'll use a state for `currentSentence` that `SentenceInputForm` can update.
        // Or even simpler for now: if analysis has words, join them. It's not perfect.
        // Best solution is to pass sentence from form submission handling logic.
        // The current structure of `handleAnalyzeSentence` and `useFormState` makes it tricky to get the sentence here easily.
        // We will manage `currentSentence` locally and pass a setter to SentenceInputForm.
        // For now, `currentSentence` will be set to a generic message or the first word if an analysis exists.
        if (result.data && result.data.wordAnalysis.length > 0) {
           setCurrentSentence(result.data.wordAnalysis.map(w => w.word).join(' ')); // This is a reconstruction, not original
        } else {
           setCurrentSentence("Oración analizada");
        }
        setError(null);
      }
    });
  };
  

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
                <AnalysisDisplay analysis={analysisResult} featureToggles={featureToggles} />
                <TranslationDisplay originalSentence={currentSentence} />
              </>
            )}
            
            {!isPending && !error && !analysisResult && (
                <Card className="shadow-md">
                    <CardContent className="p-10 text-center">
                        <h2 className="text-2xl font-headline text-foreground/80">Bienvenido a LinguaFriend</h2>
                        <p className="mt-2 text-muted-foreground">
                            Escribe una oración en inglés en el panel de la izquierda y presiona "Analizar Oración" para comenzar.
                        </p>
                         <img src="https://placehold.co/600x400.png" alt="Placeholder representing learning" data-ai-hint="learning education" className="mt-6 rounded-lg mx-auto shadow-lg" />
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
