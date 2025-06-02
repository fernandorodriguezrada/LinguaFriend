
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
import {z}from 'genkit';
import type { SentencePart } from '@/lib/types';


// Define the input schema
const AnalyzeSentenceInputSchema = z.object({
  sentence: z.string().describe('The English sentence to analyze.'),
  eli5Mode: z.boolean().default(false).describe('If true, explanations should be simplified (Explain Like I am 5).'),
});

export type AnalyzeSentenceInput = z.infer<typeof AnalyzeSentenceInputSchema>;

// Define the output schema
const SentencePartSchema = z.object({
  text: z.string().describe('The word or punctuation mark from the sentence.'),
  role: z.string().describe('A simplified grammatical role for UI color-coding (e.g., "verb", "noun", "adjective", "adverb", "pronoun", "preposition", "conjunction", "determiner", "interjection", "contraction", "punctuation", "other"). This role MUST accurately reflect the word\'s primary grammatical function in the sentence context, as it directly drives UI color-coding.'),
  rawRole: z.string().optional().describe('The detailed grammatical role in Spanish as identified by the linguistic analysis (e.g., "Verbo (Transitivo)", "Sustantivo (Común)").'),
});

const AnalyzeSentenceOutputSchema = z.object({
  tense: z.string().describe('El tiempo verbal de la oración (ej. Presente Perfecto), incluyendo el término en inglés entre paréntesis, su fórmula, explicación de uso y un ejemplo con la oración original. Esta explicación debe estar bien estructurada en párrafos para facilitar la lectura, y ser texto plano. Si el modo ELI5 está activo, la explicación debe ser muy simple.'),
  grammarBreakdown: z.string().describe('La estructura gramatical de la oración, explicada en español, incluyendo términos clave en inglés entre paréntesis. Debe ser texto plano. Si el modo ELI5 está activo, la explicación debe ser muy simple.'),
  wordAnalysis: z.array(
    z.object({
      word: z.string().describe('La palabra que se está analizando.'),
      role: z.string().describe('La categoría gramatical (ej. verbo, sustantivo), incluyendo el término en inglés entre paréntesis.'),
      definition: z.string().describe('La definición de la palabra, en español, incluyendo términos clave en inglés entre paréntesis si aplica. Debe ser texto plano. Si el modo ELI5 está activo, la definición debe ser muy simple.'),
      synonyms: z.array(z.string()).describe('Sinónimos de la palabra (en inglés).'),
      usageTips: z.string().describe('Consejos de uso comunes para la palabra o frase, en español, incluyendo ejemplos o términos clave en inglés entre paréntesis si aplica. Debe ser texto plano. Si el modo ELI5 está activo, los consejos deben ser muy simples.'),
    })
  ).describe('Análisis detallado de cada palabra en la oración, con explicaciones en español que incluyen términos relevantes en inglés entre paréntesis.'),
  sentenceParts: z.array(SentencePartSchema).describe('La oración original desglosada en partes (palabras, puntuación) con su rol gramatical simplificado para colorear en la interfaz.'),
  idiomExplanation: z.string().optional().describe('Si se detecta una expresión idiomática en la oración, esta es una explicación cultural o de uso en español. Debe ser texto plano. Si el modo ELI5 está activo, la explicación debe ser muy simple.'),
});

export type AnalyzeSentenceOutput = z.infer<typeof AnalyzeSentenceOutputSchema>;

// Define the tool to fetch word details
const getWordDetails = ai.defineTool({
  name: 'getWordDetails',
  description: 'Retrieves the definition, synonyms, and usage tips for a given word. Definitions and usage tips should be in Spanish, including English terms in parentheses where appropriate, and be in plain text. Adapt simplicity based on ELI5 mode.',
  inputSchema: z.object({
    word: z.string().describe('The word to look up.'),
    eli5Mode: z.boolean().describe('Whether to provide an "Explain Like I am 5" style simple definition and usage tips.'),
  }),
  outputSchema: z.object({
    definition: z.string().describe('La definición de la palabra, en español, con términos en inglés entre paréntesis cuando sea apropiado. Debe ser texto plano. Simplificada si ELI5 está activo.'),
    synonyms: z.array(z.string()).describe('Sinónimos de la palabra (en inglés).'),
    usageTips: z.string().describe('Consejos de uso comunes para la palabra, en español, con ejemplos o términos en inglés entre paréntesis cuando sea apropiado. Debe ser texto plano. Simplificados si ELI5 está activo.'),
  }),
},
async (input) => {
  // Replace this with an actual API call to a dictionary service
  await new Promise(resolve => setTimeout(resolve, 500)); // Simulate API latency
  if (input.eli5Mode) {
    return {
      definition: `Definición súper simple de ${input.word} (datos de ejemplo para ELI5) (example data). Es como decir... Este es un texto plano.`,
      synonyms: [`simpleSyn1 for ${input.word}`, `simpleSyn2 for ${input.word}`],
      usageTips: `Consejos de uso muy fáciles para ${input.word} (datos de ejemplo para ELI5) (example usage tips). Usa esta palabra cuando... Este es un texto plano.`,
    };
  }
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

{{#if eli5Mode}}
MODO "EXPLICAR COMO SI TUVIERA 5 AÑOS" ACTIVADO: Todas las explicaciones (tense, grammarBreakdown, definitions, usageTips, idiomExplanation) deben ser extremadamente simples, usando analogías y lenguaje fácil de entender para un niño o un principiante absoluto. Evita la jerga lingüística compleja.
{{/if}}

Oración: {{{sentence}}}

Para el campo "sentenceParts": Analiza la oración "{{{sentence}}}" y divídela en sus componentes individuales (palabras y signos de puntuación). Para cada componente, proporciona el texto y un 'role' simplificado (ej. "verb", "noun", "adjective", "adverb", "pronoun", "preposition", "conjunction", "determiner", "interjection", "contraction", "punctuation", "other").
Es ABSOLUTAMENTE CRUCIAL que este 'role' simplificado refleje con precisión la función gramatical principal de la palabra en el CONTEXTO DE LA ORACIÓN proporcionada, ya que este 'role' se utiliza directamente para aplicar colores en la interfaz de usuario.
PRESTA MÁXIMA ATENCIÓN A LOS ADVERBIOS: Palabras como 'very', 'quickly', 'often', 'always', 'well', 'really', 'too', 'so', 'just', 'even', 'never', y otras que modifican verbos, adjetivos u otros adverbios, DEBEN recibir el rol "adverb". NO DEBEN ser clasificadas como "verb". Esta es una fuente común de errores visuales si no se maneja correctamente. Si una palabra modifica un verbo, adjetivo u otro adverbio, su 'role' para 'sentenceParts' DEBE SER "adverb". El campo 'rawRole' puede contener una descripción más detallada, pero el 'role' simplificado para la UI debe ser inequívocamente "adverb" para los adverbios. ¡ESTO ES MUY IMPORTANTE PARA LA CORRECTA VISUALIZACIÓN! NO CONFUNDAS ADVERBIOS CON VERBOS EN EL CAMPO 'role' DE 'sentenceParts'. Por ejemplo, en 'He runs quickly', 'quickly' es "adverb", no "verb". En 'She is very smart', 'very' es "adverb".
Las contracciones comunes como "I'm", "don't", "it's", "you're", "she's", "he's", "we're", "they're", "isn't", "aren't", "wasn't", "weren't", "hasn't", "haven't", "hadn't", "doesn't", "didn't", "won't", "wouldn't", "shan't", "shouldn't", "can't", "couldn't", "mustn't" deben identificarse como una sola unidad con el rol "contraction".
También incluye un 'rawRole' con la descripción gramatical más detallada en español (ej. "Verbo (Transitivo)", "Sustantivo (Común)", "Contracción", "Adverbio").
Asegúrate de que la secuencia de sentenceParts reconstruya la oración original exactamente. Las palabras deben mantener su integridad; los espacios entre palabras son implícitos y no necesitan ser partes separadas. La puntuación sí debe ser una parte separada. Ejemplo para "Hello, world!": [{text: "Hello", role: "interjection"}, {text: ",", role: "punctuation"}, {text: "world", role: "noun"}, {text: "!", role: "punctuation"}].


Para el campo "tense", sigue las directrices generales de formato y proporciona una explicación bien estructurada y fácil de leer, distribuida en los siguientes puntos, cada uno en un párrafo separado:
1.  **Identificación y Uso Inicial:** Identifica el tiempo verbal de la oración, proporcionando su nombre en español seguido del término en inglés entre paréntesis (ej. Presente Perfecto (Present Perfect)). En este mismo párrafo, menciona cómo se utiliza este tiempo verbal en la oración "{{{sentence}}}" y da una breve explicación de su significado o función principal en este contexto. {{#if eli5Mode}}Explica esto como si se lo contaras a un niño.{{/if}}
2.  **Fórmula:** En un párrafo aparte, comenzando con el texto "Fórmula:" (sin negrita), describe la estructura o fórmula gramatical de este tiempo verbal (ej. Sujeto + 'have/has' + participio pasado (Subject + 'have/has' + past participle)). {{#if eli5Mode}}Haz la fórmula muy simple.{{/if}}
3.  **Uso Principal:** En otro párrafo aparte, comenzando con el texto "Uso Principal:" (sin negrita), explica los usos generales más comunes de este tiempo verbal en español. {{#if eli5Mode}}Explica los usos con ejemplos muy sencillos.{{/if}}
4.  **Ejemplo Práctico en la Oración:** Finalmente, en un párrafo separado, comenzando con el texto "Ejemplo Práctico en la Oración:" (sin negrita), vuelve a escribir la oración original "{{{sentence}}}" como un ejemplo práctico. Detalla cómo se aplica la fórmula y el uso del tiempo verbal identificado directamente en la oración original. Por ejemplo, si la oración es "She has eaten an apple" y el tiempo es Presente Perfecto, la explicación podría ser: "Ejemplo Práctico en la Oración: En la oración '{{{sentence}}}': 'She (Sujeto) has (auxiliar 'have/has') eaten (participio pasado de 'eat') an apple'. Esto muestra una acción completada recientemente relacionada con el presente." {{#if eli5Mode}}Usa la oración original y explica de forma súper simple cómo encaja el tiempo verbal.{{/if}}
Asegúrate de que cada párrafo sea claro, conciso y que el conjunto sea fácil de leer, evitando bloques de texto densos. TODO EL TEXTO GENERADO PARA EL CAMPO "tense" DEBE SER TEXTO PLANO, sin usar Markdown ni caracteres especiales (como asteriscos) para aplicar formato (negrita, cursiva, etc.). Los saltos de línea entre los puntos mencionados crearán la separación de párrafos.

Para el campo "grammarBreakdown":
Proporciona un desglose gramatical general de la oración, siguiendo las pautas de idioma, inclusión de términos en inglés entre paréntesis y formato de texto plano. Si es largo, considera usar párrafos. {{#if eli5Mode}}Explica la gramática de forma muy, muy básica.{{/if}}

Para el campo "wordAnalysis":
Proporciona un análisis de cada palabra, incluyendo su categoría gramatical (rol), definición, sinónimos y consejos de uso. Sigue las pautas de idioma, inclusión de términos en inglés entre paréntesis y formato de texto plano mencionadas anteriormente para cada campo (definición y consejos de uso).
Utiliza la herramienta getWordDetails con el parámetro eli5Mode={{eli5Mode}} para obtener más información sobre palabras individuales cuando sea necesario. La herramienta también debe devolver la definición y los consejos de uso en español, siguiendo la misma pauta de incluir términos en inglés entre paréntesis cuando sea apropiado y entregar texto plano. {{#if eli5Mode}}Las definiciones y consejos de uso deben ser súper simples.{{/if}}

Para el campo "idiomExplanation":
Si la oración "{{{sentence}}}" contiene una expresión idiomática común en inglés, proporciona una explicación de su significado y origen o uso cultural en español. Si no hay ninguna expresión idiomática clara, omite este campo o déjalo como una cadena vacía. {{#if eli5Mode}}Si hay un dicho especial, explica qué significa de forma sencilla.{{/if}}

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
  async (input) => {
    const response = await analyzeSentencePrompt(input);

    const errorFromAI = response.error as unknown; // Cast to unknown first
    if (errorFromAI) {
      const errorMessage = errorFromAI instanceof Error ? errorFromAI.message : String(errorFromAI);
      console.error('Genkit prompt (analyzeSentencePrompt) encountered an error:', errorMessage, { input, usage: response.usage, history: response.history });
      throw new Error(`AI model processing error: ${errorMessage}`);
    }

    if (!response.output) {
      console.error('Genkit prompt (analyzeSentencePrompt) returned no output.', { input, usage: response.usage, history: response.history });
      throw new Error('AI model did not return the expected output structure or the output was empty/filtered.');
    }
    return response.output;
  }
);

// Exported function
export async function analyzeSentence(input: AnalyzeSentenceInput): Promise<AnalyzeSentenceOutput> {
  return analyzeSentenceFlow(input);
}

