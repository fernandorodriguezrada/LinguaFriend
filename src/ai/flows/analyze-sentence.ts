
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
  tense: z.string().describe('El tiempo verbal de la oración (ej. Presente Perfecto), incluyendo el término en inglés entre paréntesis, su fórmula, explicación de uso y un ejemplo con la oración original. Esta explicación debe estar bien estructurada en párrafos para facilitar la lectura.'),
  grammarBreakdown: z.string().describe('La estructura gramatical de la oración, explicada en español, incluyendo términos clave en inglés entre paréntesis. Debe ser texto plano.'),
  wordAnalysis: z.array(
    z.object({
      word: z.string().describe('La palabra que se está analizando.'),
      role: z.string().describe('La categoría gramatical (ej. verbo, sustantivo), incluyendo el término en inglés entre paréntesis.'),
      definition: z.string().describe('La definición de la palabra, en español, incluyendo términos clave en inglés entre paréntesis si aplica. Debe ser texto plano.'),
      synonyms: z.array(z.string()).describe('Sinónimos de la palabra (en inglés).'),
      usageTips: z.string().describe('Consejos de uso comunes para la palabra o frase, en español, incluyendo ejemplos o términos clave en inglés entre paréntesis si aplica. Debe ser texto plano.'),
    })
  ).describe('Análisis detallado de cada palabra en la oración, con explicaciones en español que incluyen términos relevantes en inglés entre paréntesis.'),
});

export type AnalyzeSentenceOutput = z.infer<typeof AnalyzeSentenceOutputSchema>;

// Define the tool to fetch word details
const getWordDetails = ai.defineTool({
  name: 'getWordDetails',
  description: 'Retrieves the definition, synonyms, and usage tips for a given word. Definitions and usage tips should be in Spanish, including English terms in parentheses where appropriate, and be in plain text.',
  inputSchema: z.object({
    word: z.string().describe('The word to look up.'),
  }),
  outputSchema: z.object({
    definition: z.string().describe('La definición de la palabra, en español, con términos en inglés entre paréntesis cuando sea apropiado. Debe ser texto plano.'),
    synonyms: z.array(z.string()).describe('Sinónimos de la palabra (en inglés).'),
    usageTips: z.string().describe('Consejos de uso comunes para la palabra, en español, con ejemplos o términos en inglés entre paréntesis cuando sea apropiado. Debe ser texto plano.'),
  }),
},
async (input) => {
  // Replace this with an actual API call to a dictionary service
  // For now, return dummy data, ensuring Spanish content for relevant fields
  await new Promise(resolve => setTimeout(resolve, 500)); // Simulate API latency
  return {
    definition: `Definición de ${input.word} (datos de ejemplo) (example data). Este es un texto plano.`,
    synonyms: [`synonym1 for ${input.word}`, `synonym2 for ${input.word}`],
    usageTips: `Consejos de uso para ${input.word} (datos de ejemplo) (example usage tips). Este es un texto plano.`,
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
Cuando menciones términos gramaticales clave (como tiempos verbales, tipos de cláusulas, partes de la oración, etc.), conceptos lingüísticos importantes, o al dar ejemplos de estructuras gramaticales, incluye el término/estructura original en inglés entre paréntesis después de su equivalente en español.
Las explicaciones deben entregarse en texto plano. Para mejorar la legibilidad, especialmente en explicaciones más largas como la del tiempo verbal, distribuye el contenido en párrafos claros y concisos. No utilices Markdown ni caracteres especiales como asteriscos para aplicar formato (negrita, cursiva, etc.), ya que este formato no se mostrará en la interfaz.
Los sinónimos deben permanecer en inglés, ya que son listas de palabras asociadas a la palabra original en inglés.

Oración: {{{sentence}}}

Para el campo "tense", sigue las directrices generales de formato y proporciona una explicación bien estructurada y fácil de leer, dividida en los siguientes párrafos:
1.  **Identificación del Tiempo Verbal:** En un párrafo, identifica el tiempo verbal de la oración. Proporciona el nombre del tiempo verbal en español, seguido del término en inglés entre paréntesis (ej. Presente Perfecto (Present Perfect)).
2.  **Fórmula/Estructura:** En un párrafo aparte, describe la estructura o fórmula gramatical de este tiempo verbal (ej. Sujeto + 'have/has' + participio pasado (Subject + 'have/has' + past participle)).
3.  **Uso Principal:** En otro párrafo, explica brevemente el uso principal de este tiempo verbal en español.
4.  **Ejemplo Práctico en la Oración:** Finalmente, en un párrafo separado, vuelve a escribir la oración original "{{{sentence}}}" como un ejemplo práctico y visual. En este ejemplo, detalla cómo se aplica la fórmula y el uso del tiempo verbal identificado directamente en la oración original. Por ejemplo, si la oración es "She has eaten an apple" y el tiempo es Presente Perfecto, podrías decir: "Ejemplo en la oración '{{{sentence}}}': 'She (Sujeto) has (auxiliar 'have/has') eaten (participio pasado de 'eat') an apple'. Esto muestra una acción completada recientemente relacionada con el presente."
Asegúrate de que cada parte sea clara y que el conjunto sea fácil de leer, evitando bloques de texto densos.

Para el campo "grammarBreakdown":
Proporciona un desglose gramatical general de la oración, siguiendo las pautas de idioma, inclusión de términos en inglés entre paréntesis y formato de texto plano. Si es largo, considera usar párrafos.

Para el campo "wordAnalysis":
Proporciona un análisis de cada palabra, incluyendo su categoría gramatical (rol), definición, sinónimos y consejos de uso. Sigue las pautas de idioma, inclusión de términos en inglés entre paréntesis y formato de texto plano mencionadas anteriormente para cada campo (definición y consejos de uso).
Utiliza la herramienta getWordDetails para obtener más información sobre palabras individuales cuando sea necesario. La herramienta también debe devolver la definición y los consejos de uso en español, siguiendo la misma pauta de incluir términos en inglés entre paréntesis cuando sea apropiado y entregar texto plano.

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

