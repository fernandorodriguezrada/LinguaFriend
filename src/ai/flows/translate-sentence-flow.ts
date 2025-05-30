
'use server';
/**
 * @fileOverview Provides text translation capabilities.
 *
 * - translateSentence - Translates a given English sentence to Spanish.
 * - TranslateSentenceInput - The input type for the translateSentence function.
 * - TranslateSentenceOutput - The return type for the translateSentence function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

// Define the input schema
const TranslateSentenceInputSchema = z.object({
  sentence: z.string().describe('The English sentence to translate.'),
  targetLanguage: z.string().default('Spanish').describe('The language to translate the sentence into. Default is Spanish.'),
});
export type TranslateSentenceInput = z.infer<typeof TranslateSentenceInputSchema>;

// Define the output schema
const TranslateSentenceOutputSchema = z.object({
  translatedSentence: z.string().describe('The translated sentence.'),
});
export type TranslateSentenceOutput = z.infer<typeof TranslateSentenceOutputSchema>;

// Define the prompt
const translateSentencePrompt = ai.definePrompt({
  name: 'translateSentencePrompt',
  input: {schema: TranslateSentenceInputSchema},
  output: {schema: TranslateSentenceOutputSchema},
  prompt: `Translate the following English sentence to {{{targetLanguage}}}.

Sentence: {{{sentence}}}

Return only the translated sentence. Do not include any preamble or explanation.`,
});

// Define the flow
const translateSentenceFlow = ai.defineFlow(
  {
    name: 'translateSentenceFlow',
    inputSchema: TranslateSentenceInputSchema,
    outputSchema: TranslateSentenceOutputSchema,
  },
  async input => {
    const {output} = await translateSentencePrompt(input);
    return output!;
  }
);

// Exported function
export async function translateSentence(input: TranslateSentenceInput): Promise<TranslateSentenceOutput> {
  return translateSentenceFlow(input);
}
