
'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Languages, Loader2 } from 'lucide-react';
import { translateSentence, type TranslateSentenceInput } from '@/ai/flows/translate-sentence-flow';

interface TranslationDisplayProps {
  originalSentence: string;
}

export function TranslationDisplay({ originalSentence }: TranslationDisplayProps) {
  const [showTranslation, setShowTranslation] = useState(false);
  const [translatedText, setTranslatedText] = useState('');
  const [isTranslating, setIsTranslating] = useState(false);
  const [translationError, setTranslationError] = useState<string | null>(null);

  useEffect(() => {
    if (showTranslation && originalSentence) {
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
    } else if (originalSentence) {
      setTranslatedText(originalSentence);
      setTranslationError(null);
      setIsTranslating(false); 
    } else {
        setTranslatedText('');
        setTranslationError(null);
        setIsTranslating(false);
    }
  }, [originalSentence, showTranslation]);

  const handleToggleTranslation = () => {
    setShowTranslation(!showTranslation);
  };

  if (!originalSentence && !isTranslating) { // Don't render if no sentence and not attempting to translate
    return null;
  }

  return (
    <Card className="shadow-lg">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-xl font-headline flex items-center gap-2">
          <Languages className="h-5 w-5 text-primary" />
          Traducción
        </CardTitle>
        {originalSentence && ( // Only show button if there's a sentence
            <Button
            variant="outline"
            onClick={handleToggleTranslation}
            disabled={isTranslating}
            >
            {isTranslating && showTranslation ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : null}
            {showTranslation ? 'Mostrar Original' : 'Traducir a Español'}
            </Button>
        )}
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
