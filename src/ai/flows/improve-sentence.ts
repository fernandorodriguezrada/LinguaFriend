
'use server';

/**
 * @fileOverview A flow to suggest improvements to English sentences.
 *
 * - improveSentence - A function that handles the sentence improvement process.
 * - ImproveSentenceInput - The input type for the improveSentence function.
 * - ImproveSentenceOutput - The return type for the improveSentence function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ImproveSentenceInputSchema = z.object({
  sentence: z.string().describe('The English sentence to improve.'),
});
export type ImproveSentenceInput = z.infer<typeof ImproveSentenceInputSchema>;

const ImproveSentenceOutputSchema = z.object({
  improvedSentence: z.string().describe('The improved English sentence. If no improvements are needed, this may be the same as the original sentence or a confirmation that it is correct.'),
  explanation: z
    .string()
    .describe('An explanation of the improvements made or why the sentence is correct. This explanation should be in Spanish and include English terms in parentheses where relevant. e.g., "Se corrigió la concordancia sujeto-verbo (subject-verb agreement). En lugar de \'He go\', se usa \'He goes\'." If no errors, state that clearly e.g. "La oración es gramaticalmente correcta."'),
  hasImprovements: z.boolean().describe('True if the improvedSentence is different from the original or if there are specific suggestions, false otherwise.'),
});
export type ImproveSentenceOutput = z.infer<typeof ImproveSentenceOutputSchema>;

export async function improveSentence(input: ImproveSentenceInput): Promise<ImproveSentenceOutput> {
  return improveSentenceFlow(input);
}

const improveSentencePrompt = ai.definePrompt({
  name: 'improveSentencePrompt',
  input: {schema: ImproveSentenceInputSchema},
  output: {schema: ImproveSentenceOutputSchema},
  prompt: `You are an AI assistant that helps improve English sentences, focusing on common mistakes for learners.
Your explanations MUST be in Spanish, but include English grammatical terms in parentheses where appropriate.

Sentence to analyze: {{{sentence}}}

1.  Identify grammatical errors (e.g., subject-verb agreement, tense usage, articles, prepositions) and awkward phrasing.
2.  Provide an 'improvedSentence'. If the original sentence is already grammatically correct and natural, 'improvedSentence' can be the same as the original.
3.  Provide an 'explanation' in SPANISH.
    *   If errors are found, clearly explain what was wrong and how it was corrected. For example: "Se corrigió la concordancia sujeto-verbo (subject-verb agreement). En lugar de 'He go', se usa 'He goes' porque el sujeto 'He' (tercera persona singular) requiere el verbo con '-s' en Presente Simple (Present Simple)."
    *   If the sentence is correct, the explanation should confirm this, for example: "La oración es gramaticalmente correcta y suena natural."
4.  Set 'hasImprovements' to true if you made changes or have specific suggestions. If the sentence was already perfect, set it to false.

Example of a good correction and explanation:
Original Sentence: "She like apples."
Improved Sentence: "She likes apples."
Explanation: "Se corrigió la concordancia sujeto-verbo (subject-verb agreement). El sujeto 'She' (tercera persona del singular) requiere que el verbo 'like' termine en '-s' en el Presente Simple (Present Simple), por lo tanto, se cambia a 'likes'."
Has Improvements: true

Example of a correct sentence:
Original Sentence: "They are playing soccer."
ImprovedSentence: "They are playing soccer."
Explanation: "La oración es gramaticalmente correcta y suena natural."
Has Improvements: false

Return ONLY the JSON object that conforms to the ImproveSentenceOutputSchema. Do not include any preamble, conversational text, or any other characters outside of the JSON structure itself.
  `,
});

const improveSentenceFlow = ai.defineFlow(
  {
    name: 'improveSentenceFlow',
    inputSchema: ImproveSentenceInputSchema,
    outputSchema: ImproveSentenceOutputSchema,
  },
  async input => {
    const response = await improveSentencePrompt(input);

    const errorFromAI = response.error as unknown;
    if (errorFromAI) {
      const errorMessage = errorFromAI instanceof Error ? errorFromAI.message : String(errorFromAI);
      console.error(
        `Genkit prompt (${improveSentencePrompt.name}) encountered an error:`,
        errorMessage,
        {
          input,
          usage: response?.usage,
          history: response?.history,
        }
      );
      throw new Error(`AI model processing error for improvement: ${errorMessage}`);
    }

    if (!response.output) {
      console.error(
        `Genkit prompt (${improveSentencePrompt.name}) returned no output.`,
        {
          input,
          usage: response?.usage,
          history: response?.history,
        }
      );
      throw new Error('AI model did not return the expected output structure for improvement or the output was empty/filtered.');
    }
    return response.output;
  }
);

