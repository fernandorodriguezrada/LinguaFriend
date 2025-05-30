// This is an auto-generated file from Firebase Studio.

'use server';

/**
 * @fileOverview Provides linguistic analysis of English sentences.
 *
 * - analyzeSentence - Analyzes a given English sentence and provides a detailed linguistic analysis.
 * - AnalyzeSentenceInput - The input type for the analyzeSentence function.
 * - AnalyzeSentenceOutput - The return type for the analyzeSentence function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

// Define the input schema
const AnalyzeSentenceInputSchema = z.object({
  sentence: z.string().describe('The English sentence to analyze.'),
});

export type AnalyzeSentenceInput = z.infer<typeof AnalyzeSentenceInputSchema>;

// Define the output schema
const AnalyzeSentenceOutputSchema = z.object({
  tense: z.string().describe('The tense of the sentence (e.g., Present Perfect).'),
  grammarBreakdown: z.string().describe('The grammatical structure of the sentence.'),
  wordAnalysis: z.array(
    z.object({
      word: z.string().describe('The word being analyzed.'),
      role: z.string().describe('The part of speech (e.g., verb, noun).'),
      definition: z.string().describe('The definition of the word.'),
      synonyms: z.array(z.string()).describe('Synonyms for the word.'),
      usageTips: z.string().describe('Common usage tips for the word or phrase.'),
    })
  ).describe('Detailed analysis of each word in the sentence.'),
});

export type AnalyzeSentenceOutput = z.infer<typeof AnalyzeSentenceOutputSchema>;

// Define the tool to fetch word details
const getWordDetails = ai.defineTool({
  name: 'getWordDetails',
  description: 'Retrieves the definition, synonyms, and usage tips for a given word.',
  inputSchema: z.object({
    word: z.string().describe('The word to look up.'),
  }),
  outputSchema: z.object({
    definition: z.string().describe('The definition of the word.'),
    synonyms: z.array(z.string()).describe('Synonyms for the word.'),
    usageTips: z.string().describe('Common usage tips for the word.'),
  }),
},
async (input) => {
  // Replace this with an actual API call to a dictionary service
  // (e.g., Oxford, Merriam-Webster)
  // For now, return dummy data
  await new Promise(resolve => setTimeout(resolve, 500)); // Simulate API latency
  return {
    definition: `Definition of ${input.word} (dummy data)`,    
    synonyms: [`synonym1 for ${input.word}`, `synonym2 for ${input.word}`],
    usageTips: `Usage tips for ${input.word} (dummy data)`,
  };
});

// Define the prompt
const analyzeSentencePrompt = ai.definePrompt({
  name: 'analyzeSentencePrompt',
  input: {schema: AnalyzeSentenceInputSchema},
  output: {schema: AnalyzeSentenceOutputSchema},
  tools: [getWordDetails],
  prompt: `You are a linguistic expert. Analyze the following English sentence and provide a detailed breakdown.

Sentence: {{{sentence}}}

Identify the sentence tense, grammar breakdown, and provide an analysis of each word, including its role, definition, synonyms, and usage tips. Use the getWordDetails tool to get more information about individual words when needed.

Format your response as a JSON object matching the schema.
`,
});

// Define the flow
const analyzeSentenceFlow = ai.defineFlow(
  {
    name: 'analyzeSentenceFlow',
    inputSchema: AnalyzeSentenceInputSchema,
    outputSchema: AnalyzeSentenceOutputSchema,
  },
  async input => {
    const {output} = await analyzeSentencePrompt(input);
    return output!;
  }
);

// Exported function
export async function analyzeSentence(input: AnalyzeSentenceInput): Promise<AnalyzeSentenceOutput> {
  return analyzeSentenceFlow(input);
}
