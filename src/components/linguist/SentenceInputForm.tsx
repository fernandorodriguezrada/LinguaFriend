
'use client';

import React, { useEffect, useState, useRef, type ChangeEvent, type KeyboardEvent } from 'react';
import { useFormStatus } from 'react-dom';
import { useActionState } from 'react';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { SendHorizonal, Loader2, HistoryIcon } from 'lucide-react';
import type { ActionState } from '@/app/actions';
import type { FeatureToggleState } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';


interface SentenceInputFormProps {
  onAnalysisResult: (result: ActionState) => void;
  initialState: ActionState;
  serverAction: (prevState: ActionState | undefined, formData: FormData) => Promise<ActionState>;
  currentFeatureToggles: FeatureToggleState;
  onOpenHistory: () => void;
}

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending} className="w-full sm:w-auto sm:flex-none">
      {pending ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <SendHorizonal className="h-4 w-4" />
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
      }
    }
  }, [state, onAnalysisResult, toast]);

  const handleInputChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    let value = e.target.value;
    value = value.replace(/\s\s+/g, ' ');
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
      <div className="flex flex-col-reverse sm:flex-row sm:items-center sm:justify-between w-full gap-3">
        {/* Analizar Oración Button - pushed to the left by justify-between */}
        <SubmitButton />
        
        {/* Separator Container - centered in the space by justify-between */}
        <div className="hidden sm:flex items-center"> {/* No flex-grow/shrink, just holds separator */}
          <Separator orientation="vertical" className="h-8" />
        </div>

        {/* History Button - pushed to the right by justify-between */}
        <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={onOpenHistory}
            aria-label="Ver historial de análisis"
            className="w-full sm:w-10 sm:shrink-0" 
        >
          <HistoryIcon className="h-4 w-4" />
        </Button>
      </div>
    </form>
  );
}
