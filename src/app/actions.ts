
'use server';

import { analyzeSentence, type AnalyzeSentenceInput } from '@/ai/flows/analyze-sentence';
import { improveSentence, type ImproveSentenceInput, type ImproveSentenceOutput } from '@/ai/flows/improve-sentence';
import type { ExtendedAnalyzeSentenceOutput } from '@/lib/types';
import { z } from 'zod';

const AnalyzeSentenceActionSchema = z.object({
  sentence: z.string().min(1, "La oración no puede estar vacía."),
  eli5Mode: z.preprocess(value => value === 'on' || value === true, z.boolean()).default(false),
});

export interface ActionState {
  data: ExtendedAnalyzeSentenceOutput | null;
  improvementData: ImproveSentenceOutput | null;
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
    eli5Mode: formData.get('eli5Mode') // This will be 'on' or null from checkbox, or boolean if set directly
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

  const { sentence, eli5Mode } = validationResult.data;
  const analysisInput: AnalyzeSentenceInput = { sentence, eli5Mode };
  const improvementInput: ImproveSentenceInput = { sentence };

  try {
    // Perform analysis and improvement in parallel
    const [analysisResult, improvementResult] = await Promise.all([
      analyzeSentence(analysisInput),
      improveSentence(improvementInput)
    ]);

    if (!analysisResult && sentence) { 
      return { 
        data: null, 
        improvementData: improvementResult || null,
        error: 'Respuesta inesperada del servidor al analizar. Inténtalo de nuevo.', 
        originalSentence: sentence 
      };
    }
    
    return { 
      data: analysisResult, 
      improvementData: improvementResult || null,
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
