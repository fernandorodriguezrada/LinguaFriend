
'use server';

import { analyzeSentence, type AnalyzeSentenceInput } from '@/ai/flows/analyze-sentence';
import { improveSentence, type ImproveSentenceInput, type ImproveSentenceOutput } from '@/ai/flows/improve-sentence';
import type { ExtendedAnalyzeSentenceOutput, ImprovementResult } from '@/lib/types';
import { z } from 'zod';

const AnalyzeSentenceActionSchema = z.object({
  sentence: z.string().min(1, "La oración no puede estar vacía."),
  eli5Mode: z.preprocess(value => value === 'on' || value === true, z.boolean()).default(false),
  showImprovementSuggestions: z.preprocess(value => value === 'on' || value === true, z.boolean()).default(true),
});

export interface ActionState {
  data: ExtendedAnalyzeSentenceOutput | null;
  improvementData: ImprovementResult | null;
  error: string | null;
  message?: string;
  originalSentence?: string;
}

export async function handleAnalyzeSentence(
  prevState: ActionState | undefined,
  formData: FormData
): Promise<ActionState> {
  const rawFormData = {
    sentence: formData.get('sentence') as string,
    eli5Mode: formData.get('eli5Mode'),
    showImprovementSuggestions: formData.get('showImprovementSuggestions')
  };

  const validationResult = AnalyzeSentenceActionSchema.safeParse(rawFormData);

  if (!validationResult.success) {
    return {
      data: null,
      improvementData: null,
      error: validationResult.error.errors.map((err) => err.message).join(', '),
      originalSentence: rawFormData.sentence,
    };
  }

  const { sentence, eli5Mode, showImprovementSuggestions } = validationResult.data;
  const analysisInput: AnalyzeSentenceInput = { sentence, eli5Mode };
  
  try {
    const analysisResult = await analyzeSentence(analysisInput);

    if (!analysisResult && sentence) { 
      return { 
        data: null, 
        improvementData: null,
        error: 'Respuesta inesperada del servidor al analizar. Inténtalo de nuevo.', 
        originalSentence: sentence 
      };
    }

    let improvementResultValue: ImprovementResult | null = null;
    if (showImprovementSuggestions) {
      const improvementInput: ImproveSentenceInput = { sentence };
      // Call improveSentence sequentially if the toggle is on and analysis was successful
      improvementResultValue = await improveSentence(improvementInput);
    }
    
    return { 
      data: analysisResult, 
      improvementData: improvementResultValue,
      error: null, 
      originalSentence: sentence 
    };

  } catch (e) {
    console.error(e);
    const errorMessage = e instanceof Error ? e.message : 'Ocurrió un error desconocido.';
    return { 
        data: null, 
        improvementData: null,
        error: `Ocurrió un error al procesar la oración: ${errorMessage}. Por favor, inténtalo más tarde.`, 
        originalSentence: sentence 
    };
  }
}
