
'use client';

import React, { useEffect, useState, useRef, type ChangeEvent, type KeyboardEvent } from 'react';
import { useFormStatus } from 'react-dom';
import { useActionState } from 'react';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { SendHorizonal, Loader2, HistoryIcon } from 'lucide-react'; // Added HistoryIcon
import type { ActionState } from '@/app/actions';
import type { FeatureToggleState } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';


interface SentenceInputFormProps {
  onAnalysisResult: (result: ActionState) => void;
  initialState: ActionState;
  serverAction: (prevState: ActionState | undefined, formData: FormData) => Promise<ActionState>;
  currentFeatureToggles: FeatureToggleState;
  onOpenHistory: () => void; // New prop to open history modal
}

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending} className="w-full sm:w-auto flex-grow sm:flex-grow-0">
      {pending ? (
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
      ) : (
        <SendHorizonal className="mr-2 h-4 w-4" />
      )}
      Analizar Oración
    </Button>
  );
}

export function SentenceInputForm({ 
  onAnalysisResult, 
  initialState, 
  serverAction, 
  currentFeatureToggles,
  onOpenHistory 
}: SentenceInputFormProps) {
  const [state, formAction] = useActionState(serverAction, initialState);
  const { toast } = useToast();
  const formRef = useRef<HTMLFormElement>(null);
  const [inputValue, setInputValue] = useState('');

  useEffect(() => {
    if (state) {
      onAnalysisResult(state);
      if (state.error) {
        toast({
          variant: "destructive",
          title: "Error de Análisis",
          description: state.error,
        });
      } else if (state.data || state.improvementData?.hasImprovements) {
         toast({
          title: "Análisis Completo",
          description: "La oración ha sido procesada.",
        });
        // formRef.current?.reset(); // Keep the sentence for potential history saving context
        // setInputValue(''); // Keep input value in case user wants to re-submit or copy
      }
    }
  }, [state, onAnalysisResult, toast]);

  const handleInputChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    let value = e.target.value;
    // Remove multiple spaces
    value = value.replace(/\s\s+/g, ' ');
    // Capitalize first letter only if field is not empty and not just a space
    if (value.length > 0 && value.trim().length > 0 && value === value.trimStart()) {
        if (value === value.trim() || value.indexOf(' ') === -1 || value.indexOf(' ') > 0 ) {
             value = value.charAt(0).toUpperCase() + value.slice(1);
        }
    }
    setInputValue(value);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (formRef.current && inputValue.trim() !== '') {
        const formData = new FormData(formRef.current);
        formData.set('eli5Mode', currentFeatureToggles.eli5Mode ? 'on' : 'off');
        formData.set('showImprovementSuggestions', currentFeatureToggles.showImprovementSuggestions ? 'on' : 'off');
        // Trigger submit
        const submitEvent = new Event('submit', { bubbles: true, cancelable: true });
        formRef.current.dispatchEvent(submitEvent);
      }
    }
  };
  
  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    const formData = new FormData(event.currentTarget);
    if (!formData.has('eli5Mode')) { 
        formData.append('eli5Mode', currentFeatureToggles.eli5Mode ? 'on' : 'off');
    }
    if (!formData.has('showImprovementSuggestions')) {
        formData.append('showImprovementSuggestions', currentFeatureToggles.showImprovementSuggestions ? 'on' : 'off');
    }
    // The formAction will be called with this formData by react-dom
  };


  return (
    <form ref={formRef} action={formAction} onSubmit={handleSubmit} className="space-y-6">
      <div>
        <Label htmlFor="sentence" className="text-lg font-medium font-headline text-foreground">
          Ingresa una oración en inglés:
        </Label>
        <Textarea
          id="sentence"
          name="sentence"
          placeholder="Ej: She has been studying for hours."
          className="mt-2 min-h-[100px] text-base resize-none"
          value={inputValue}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          required
        />
        <input type="hidden" name="eli5Mode" value={currentFeatureToggles.eli5Mode ? 'on' : 'off'} />
        <input type="hidden" name="showImprovementSuggestions" value={currentFeatureToggles.showImprovementSuggestions ? 'on' : 'off'} />
      </div>
      <div className="flex flex-col-reverse sm:flex-row sm:justify-end sm:items-center gap-3">
        <Button 
            type="button" 
            variant="outline" 
            onClick={onOpenHistory} 
            className="w-full sm:w-auto order-last sm:order-first"
            aria-label="Ver historial de análisis"
        >
          <HistoryIcon className="mr-2 h-4 w-4" />
          Historial
        </Button>
        <SubmitButton />
      </div>
    </form>
  );
}
