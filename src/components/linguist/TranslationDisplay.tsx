'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Languages } from 'lucide-react';

interface TranslationDisplayProps {
  originalSentence: string;
}

export function TranslationDisplay({ originalSentence }: TranslationDisplayProps) {
  const [showTranslation, setShowTranslation] = useState(false);
  const [translatedText, setTranslatedText] = useState('');

  useEffect(() => {
    if (originalSentence && showTranslation) {
      // This is a mock translation.
      // In a real app, you would call a translation API here.
      setTranslatedText(`Traducción simulada (Español): ${originalSentence}`);
    } else {
      setTranslatedText(originalSentence);
    }
  }, [originalSentence, showTranslation]);

  if (!originalSentence) {
    return null;
  }

  return (
    <Card className="shadow-lg">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-xl font-headline flex items-center gap-2">
          <Languages className="h-5 w-5 text-primary" />
          Traducción
        </CardTitle>
        <Button
          variant="outline"
          onClick={() => setShowTranslation(!showTranslation)}
        >
          {showTranslation ? 'Mostrar Original' : 'Traducir a Español'}
        </Button>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground text-lg">{translatedText}</p>
      </CardContent>
    </Card>
  );
}
