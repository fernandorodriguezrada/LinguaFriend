
'use client';

import React, { useEffect, useState, useRef, type ChangeEvent, type KeyboardEvent } from 'react';
import { useFormStatus } from 'react-dom';
import { useActionState } from 'react';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { SendHorizonal, Loader2 } from 'lucide-react';
import type { ActionState } from '@/app/actions';
import type { FeatureToggleState } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';


interface SentenceInputFormProps {
  onAnalysisResult: (result: ActionState) => void;
  initialState: ActionState;
  serverAction: (prevState: ActionState | undefined, formData: FormData) => Promise<ActionState>;
  currentFeatureToggles: FeatureToggleState;
}

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending} className="w-full sm:w-auto">
      {pending ? (
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
      ) : (
        <SendHorizonal className="mr-2 h-4 w-4" />
      )}
      Analizar Oración
    </Button>
  );
}

export function SentenceInputForm({ onAnalysisResult, initialState, serverAction, currentFeatureToggles }: SentenceInputFormProps) {
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
        formRef.current?.reset();
        setInputValue('');
      }
    }
  }, [state, onAnalysisResult, toast]);

  const handleInputChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    let value = e.target.value;
    // Remove multiple spaces
    value = value.replace(/\s\s+/g, ' ');
    if (value.length > 0 && value !== " ") {
      value = value.charAt(0).toUpperCase() + value.slice(1);
    }
    setInputValue(value);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (formRef.current && inputValue.trim() !== '') {
        const formData = new FormData(formRef.current);
        // Manually append toggles that are not direct form elements if needed by action
        formData.set('eli5Mode', currentFeatureToggles.eli5Mode ? 'on' : 'off');
        formRef.current.dispatchEvent(new Event('submit', { cancelable: true, bubbles: true }));
      }
    }
  };
  
  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    // FormData will pick up "sentence" and "eli5Mode" if it's a checkbox with name
    const formData = new FormData(event.currentTarget);
    if (!formData.has('eli5Mode')) { // if eli5Mode switch is not a direct form child
        formData.append('eli5Mode', currentFeatureToggles.eli5Mode ? 'on' : 'off');
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
        {/* Hidden input for eli5Mode if not using a named Switch component */}
        <input type="hidden" name="eli5Mode" value={currentFeatureToggles.eli5Mode ? 'on' : 'off'} />
      </div>
      <div className="flex justify-end">
        <SubmitButton />
      </div>
    </form>
  );
}
