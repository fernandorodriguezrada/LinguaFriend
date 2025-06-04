
'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Languages, Loader2 } from 'lucide-react';
import { translateSentence, type TranslateSentenceInput } from '@/ai/flows/translate-sentence-flow';

interface TranslationDisplayProps {
  originalSentence: string;
}

export const TranslationDisplay = React.forwardRef<HTMLDivElement, TranslationDisplayProps>(
  ({ originalSentence }, ref) => {
    const [showTranslation, setShowTranslation] = useState(false);
    const [translatedText, setTranslatedText] = useState('');
    const [isTranslating, setIsTranslating] = useState(false);
    const [translationError, setTranslationError] = useState<string | null>(null);

    useEffect(() => {
      // Reset translation when original sentence changes or showTranslation is toggled off
      // and fetch new one if toggled on.
      if (!originalSentence) {
        setTranslatedText('');
        setTranslationError(null);
        setIsTranslating(false);
        setShowTranslation(false); // Ensure it's reset if sentence is cleared
        return;
      }

      if (showTranslation) {
        const performTranslation = async () => {
          setIsTranslating(true);
          setTranslationError(null);
          setTranslatedText('Traduciendo...'); 
          try {
            const input: TranslateSentenceInput = { sentence: originalSentence, targetLanguage: 'Spanish' };
            const result = await translateSentence(input);
            if (result && result.translatedSentence) {
              setTranslatedText(result.translatedSentence);
            } else {
              setTranslatedText(originalSentence); 
              setTranslationError('No se pudo obtener la traducción.');
            }
          } catch (error) {
            console.error('Translation error:', error);
            setTranslatedText(originalSentence); 
            setTranslationError('Ocurrió un error durante la traducción.');
          } finally {
            setIsTranslating(false);
          }
        };
        performTranslation();
      } else {
        // If not showing translation, display the original sentence.
        setTranslatedText(originalSentence);
        setTranslationError(null);
        setIsTranslating(false); 
      }
    }, [originalSentence, showTranslation]);

    const handleToggleTranslation = () => {
      setShowTranslation(!showTranslation);
    };

    // Do not render the card at all if there is no original sentence
    if (!originalSentence) {
      return null;
    }

    return (
      <Card ref={ref} className="shadow-lg">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-xl font-headline flex items-center gap-2">
            <Languages className="h-5 w-5 text-primary" />
            Traducción
          </CardTitle>
          <Button
            variant="outline"
            onClick={handleToggleTranslation}
            disabled={isTranslating && showTranslation} // Only disable if actively translating *to* Spanish
          >
            {isTranslating && showTranslation ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : null}
            {showTranslation ? 'Mostrar Original' : 'Traducir a Español'}
          </Button>
        </CardHeader>
        <CardContent>
          {translationError && (
            <p className="text-destructive text-sm mb-2">{translationError}</p>
          )}
          <p className="text-muted-foreground text-lg">
            {(isTranslating && showTranslation) ? 'Traduciendo...' : translatedText}
          </p>
        </CardContent>
      </Card>
    );
  }
);

TranslationDisplay.displayName = 'TranslationDisplay';
