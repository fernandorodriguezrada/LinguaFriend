
'use client';

import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Eraser } from 'lucide-react';

interface PracticeLabModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function PracticeLabModal({ isOpen, onClose }: PracticeLabModalProps) {
  const [textValue, setTextValue] = useState('');

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => { if (!open) onClose(); }}>
      <DialogContent className="sm:max-w-2xl md:max-w-3xl lg:max-w-4xl xl:max-w-5xl h-[75vh] flex flex-col p-0">
        <DialogHeader className="p-6 pb-4 border-b">
          <DialogTitle className="text-2xl font-headline text-primary">Laboratorio de Práctica</DialogTitle>
          <DialogDescription className="text-md text-muted-foreground">
            Escribe y experimenta con tus propias oraciones en inglés. ¡Este es tu espacio para practicar libremente!
          </DialogDescription>
        </DialogHeader>
        
        <div className="flex-grow p-6 flex flex-col min-h-0">
          <Textarea
            value={textValue}
            onChange={(e) => setTextValue(e.target.value)}
            placeholder="Escribe aquí... por ejemplo: 'The quick brown fox jumps over the lazy dog.' o 'Practice makes perfect!'"
            className="flex-grow w-full h-full resize-none text-lg md:text-xl p-4 rounded-md shadow-inner bg-muted/30 focus:ring-primary focus:border-primary"
            aria-label="Área de texto para práctica de oraciones"
          />
        </div>
        
        <DialogFooter className="p-6 pt-4 border-t flex-shrink-0">
          <Button variant="outline" onClick={() => setTextValue('')} className="gap-2">
            <Eraser className="h-4 w-4" />
            Limpiar
          </Button>
          <DialogClose asChild>
            <Button type="button" variant="default">Cerrar</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
