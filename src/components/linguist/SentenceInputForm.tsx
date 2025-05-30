
'use client';

import React, { useEffect, useState, useRef, type ChangeEvent, type KeyboardEvent } from 'react';
import { useFormStatus } from 'react-dom';
import { useActionState } from 'react';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { SendHorizonal, Loader2 } from 'lucide-react';
import type { ActionState } from '@/app/actions';
import { useToast } from '@/hooks/use-toast';


interface SentenceInputFormProps {
  onAnalysisResult: (result: ActionState) => void;
  initialState: ActionState;
  serverAction: (prevState: ActionState | undefined, formData: FormData) => Promise<ActionState>;
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

export function SentenceInputForm({ onAnalysisResult, initialState, serverAction }: SentenceInputFormProps) {
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
      } else if (state.data) {
         toast({
          title: "Análisis Completo",
          description: "La oración ha sido analizada exitosamente.",
        });
        formRef.current?.reset(); 
        setInputValue(''); // Clear the controlled input state
      }
    }
  }, [state, onAnalysisResult, toast]);

  const handleInputChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    let value = e.target.value;
    if (value.length > 0) {
      // Capitalize the first letter, leave the rest as is
      value = value.charAt(0).toUpperCase() + value.slice(1);
    }
    setInputValue(value);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault(); // Prevent adding a new line
      if (formRef.current && inputValue.trim() !== '') { // Only submit if not empty
        formRef.current.requestSubmit();
      } else if (inputValue.trim() === '') {
        // Optionally, show a toast or message if trying to submit an empty sentence with Enter
        // For now, we rely on the `required` attribute and server-side validation.
      }
    }
  };

  return (
    <form ref={formRef} action={formAction} className="space-y-6">
      <div>
        <Label htmlFor="sentence" className="text-lg font-medium font-headline text-foreground">
          Ingresa una oración en inglés:
        </Label>
        <Textarea
          id="sentence"
          name="sentence" // Crucial for FormData to pick up the value
          placeholder="Ej: She has been studying for hours."
          className="mt-2 min-h-[100px] text-base"
          value={inputValue}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          required
        />
        {state?.error && !state.error.includes("La oración no puede estar vacía") && <p className="mt-2 text-sm text-destructive">{state.error}</p>}
        {/* The specific "cannot be empty" error is handled by the required attribute for direct display if possible,
            or by the server action's Zod validation. Here we show other errors.
            If input is empty and submission is attempted, HTML5 validation should prevent it due to 'required'.
            If JS is disabled or bypasses it, server action handles it.
        */}
      </div>
      <div className="flex justify-end">
        <SubmitButton />
      </div>
    </form>
  );
}
