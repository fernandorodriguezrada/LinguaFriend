
'use client';

import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { GrammarTermDetail } from './ColorCodedSentence'; // Import the shared type

// Helper function to get contrasting text class for a given pastel background identifier
const getContrastTextClass = (colorIdentifier?: string): string => {
  if (!colorIdentifier || colorIdentifier === 'default' || colorIdentifier === 'punctuation' || colorIdentifier === 'other') {
    return 'text-foreground'; // Default text for non-pastel or standard backgrounds
  }
  // Map pastel identifiers to their contrasting text utility classes defined in globals.css
  const contrastMap: Record<string, string> = {
    pink: 'text-on-pastel-pink',
    green: 'text-on-pastel-green',
    yellow: 'text-on-pastel-yellow',
    purple: 'text-on-pastel-purple',
    blue: 'text-on-pastel-blue',
    orange: 'text-on-pastel-orange',
    gray: 'text-on-pastel-gray', // Assuming text-on-pastel-gray is for the pastel gray, not muted-foreground
    teal: 'text-on-pastel-teal',
    lime: 'text-on-pastel-lime',
    rose: 'text-on-pastel-rose',
  };
  // If the identifier matches one in the map, use its contrast class.
  // Otherwise, fall back to a general foreground color.
  return contrastMap[colorIdentifier] || 'text-foreground';
};

interface GrammarHelpModalProps {
  isOpen: boolean;
  onClose: () => void;
  terms: GrammarTermDetail[];
}

export function GrammarHelpModal({ isOpen, onClose, terms }: GrammarHelpModalProps) {
  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg md:max-w-xl h-[85vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="font-headline text-xl">Guía de Términos Gramaticales</DialogTitle>
          <DialogDescription>
            Definiciones y ejemplos de los roles gramaticales usados en el análisis.
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="flex-grow min-h-0 pr-6 -mr-6 mb-2">
          <div className="space-y-3 p-1">
            {terms.map(term => {
              const contrastClass = getContrastTextClass(term.identifier);
              return (
                <Card key={term.identifier} className={cn("shadow-md", term.bgColorClass)}>
                  <CardHeader className="py-3 px-4">
                    <CardTitle className={cn("text-lg font-semibold", contrastClass)}>
                      {term.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className={cn("pb-3 px-4 space-y-1 text-sm", contrastClass)}>
                    <p>{term.definition}</p>
                    <p className="opacity-90">
                      <span className="font-medium">Ejemplo:</span> {term.example}
                    </p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </ScrollArea>
        <DialogFooter className="mt-auto pt-4">
          <DialogClose asChild>
            <Button type="button" variant="outline">Cerrar</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
