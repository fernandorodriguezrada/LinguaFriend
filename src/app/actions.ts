'use server';

import { analyzeSentence, type AnalyzeSentenceInput, type AnalyzeSentenceOutput } from '@/ai/flows/analyze-sentence';
import { z } from 'zod';

const AnalyzeSentenceActionSchema = z.object({
  sentence: z.string().min(1, "La oración no puede estar vacía."),
});

export interface ActionState {
  data: AnalyzeSentenceOutput | null;
  error: string | null;
  message?: string;
}

export async function handleAnalyzeSentence(
  prevState: ActionState | undefined,
  formData: FormData
): Promise<ActionState> {
  const rawFormData = {
    sentence: formData.get('sentence') as string,
  };

  const validationResult = AnalyzeSentenceActionSchema.safeParse(rawFormData);

  if (!validationResult.success) {
    return {
      data: null,
      error: validationResult.error.errors.map((err) => err.message).join(', '),
    };
  }

  const input: AnalyzeSentenceInput = { sentence: validationResult.data.sentence };

  try {
    const result = await analyzeSentence(input);
    if (!result) {
      return { data: null, error: 'No se pudo obtener el análisis. Inténtalo de nuevo.' };
    }
    return { data: result, error: null };
  } catch (e) {
    console.error(e);
    return { data: null, error: 'Ocurrió un error al analizar la oración. Por favor, inténtalo más tarde.' };
  }
}
