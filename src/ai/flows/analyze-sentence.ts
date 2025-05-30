
// This is an auto-generated file from Firebase Studio.

'use server';

/**
 * @fileOverview Provides linguistic analysis of English sentences, with explanations in Spanish.
 *
 * - analyzeSentence - Analyzes a given English sentence and provides a detailed linguistic analysis in Spanish.
 * - AnalyzeSentenceInput - The input type for the analyzeSentence function.
 * - AnalyzeSentenceOutput - The return type for the analyzeSentence function, with descriptions in Spanish.
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
  tense: z.string().describe('El tiempo verbal de la oración (ej. Presente Perfecto), incluyendo el término en inglés entre paréntesis.'),
  grammarBreakdown: z.string().describe('La estructura gramatical de la oración, explicada en español, incluyendo términos clave en inglés entre paréntesis.'),
  wordAnalysis: z.array(
    z.object({
      word: z.string().describe('La palabra que se está analizando.'),
      role: z.string().describe('La categoría gramatical (ej. verbo, sustantivo), incluyendo el término en inglés entre paréntesis.'),
      definition: z.string().describe('La definición de la palabra, en español, incluyendo términos clave en inglés entre paréntesis si aplica.'),
      synonyms: z.array(z.string()).describe('Sinónimos de la palabra (en inglés).'),
      usageTips: z.string().describe('Consejos de uso comunes para la palabra o frase, en español, incluyendo ejemplos o términos clave en inglés entre paréntesis si aplica.'),
    })
  ).describe('Análisis detallado de cada palabra en la oración, con explicaciones en español que incluyen términos relevantes en inglés entre paréntesis.'),
});

export type AnalyzeSentenceOutput = z.infer<typeof AnalyzeSentenceOutputSchema>;

// Define the tool to fetch word details
const getWordDetails = ai.defineTool({
  name: 'getWordDetails',
  description: 'Retrieves the definition, synonyms, and usage tips for a given word. Definitions and usage tips should be in Spanish, including English terms in parentheses where appropriate.',
  inputSchema: z.object({
    word: z.string().describe('The word to look up.'),
  }),
  outputSchema: z.object({
    definition: z.string().describe('La definición de la palabra, en español, con términos en inglés entre paréntesis cuando sea apropiado.'),
    synonyms: z.array(z.string()).describe('Sinónimos de la palabra (en inglés).'),
    usageTips: z.string().describe('Consejos de uso comunes para la palabra, en español, con ejemplos o términos en inglés entre paréntesis cuando sea apropiado.'),
  }),
},
async (input) => {
  // Replace this with an actual API call to a dictionary service
  // For now, return dummy data, ensuring Spanish content for relevant fields
  await new Promise(resolve => setTimeout(resolve, 500)); // Simulate API latency
  return {
    definition: `Definición de ${input.word} (datos de ejemplo) (example data)`,
    synonyms: [`synonym1 for ${input.word}`, `synonym2 for ${input.word}`],
    usageTips: `Consejos de uso para ${input.word} (datos de ejemplo) (example usage tips)`,
  };
});

// Define the prompt
const analyzeSentencePrompt = ai.definePrompt({
  name: 'analyzeSentencePrompt',
  input: {schema: AnalyzeSentenceInputSchema},
  output: {schema: AnalyzeSentenceOutputSchema},
  tools: [getWordDetails],
  prompt: `Eres un experto lingüista. Analiza la siguiente oración en inglés y proporciona un desglose detallado.
Todas las explicaciones, incluyendo el tiempo verbal, el desglose gramatical, las definiciones y los consejos de uso, DEBEN ESTAR EN ESPAÑOL.
Cuando menciones términos gramaticales clave (como tiempos verbales, tipos de cláusulas, partes de la oración, etc.), conceptos lingüísticos importantes, o al dar ejemplos de estructuras gramaticales, incluye el término/estructura original en inglés entre paréntesis después de su equivalente en español. Por ejemplo: "El tiempo verbal es Pasado Simple (Simple Past)", "Esta es una cláusula subordinada (subordinate clause)", o "Ejemplo de voz pasiva (passive voice example): The ball was thrown by the boy."
Los sinónimos deben permanecer en inglés, ya que son listas de palabras asociadas a la palabra original en inglés.

Oración: {{{sentence}}}

Identifica el tiempo verbal de la oración.
Proporciona un desglose gramatical de la oración.
Proporciona un análisis de cada palabra, incluyendo su categoría gramatical (rol), definición, sinónimos y consejos de uso. Sigue las pautas de idioma y de inclusión de términos en inglés entre paréntesis mencionadas anteriormente para cada campo.

Utiliza la herramienta getWordDetails para obtener más información sobre palabras individuales cuando sea necesario. La herramienta también debe devolver la definición y los consejos de uso en español, siguiendo la misma pauta de incluir términos en inglés entre paréntesis cuando sea apropiado.

Formatea tu respuesta como un objeto JSON que coincida con el esquema proporcionado.
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

