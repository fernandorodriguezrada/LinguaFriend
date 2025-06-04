
import type { AnalyzeSentenceOutput as OriginalAnalyzeSentenceOutput } from '@/ai/flows/analyze-sentence';

export interface SentencePart {
  text: string;
  role: string; // e.g., "verb", "noun", "adjective" - for styling
  rawRole?: string; // The detailed role from AI, e.g., "Verbo (Transitivo)"
}

export interface WordAnalysisDetail {
  word: string;
  role: string;
  definition: string;
  synonyms: string[];
  usageTips: string;
  id?: string;
}

export interface ExtendedAnalyzeSentenceOutput extends OriginalAnalyzeSentenceOutput {
  sentenceParts: SentencePart[];
  wordAnalysis: WordAnalysisDetail[];
  idiomExplanation?: string;
}

export interface FeatureToggleState {
  showSynonyms: boolean;
  showUsageTips: boolean;
  focusOnVerbs: boolean;
  eli5Mode: boolean; // Explain Like I'm 5
  showImprovementSuggestions: boolean;
}

export type AnalysisResult = ExtendedAnalyzeSentenceOutput | null;

export type { ImproveSentenceInput, ImproveSentenceOutput } from '@/ai/flows/improve-sentence';
export type ImprovementResult = import('@/ai/flows/improve-sentence').ImproveSentenceOutput | null;

export interface AnalysisHistoryItem {
  id: string; // uuid or timestamp string
  originalSentence: string;
  analysis: ExtendedAnalyzeSentenceOutput;
  improvement?: ImprovementResult;
  timestamp: number; // Date.now()
}

export interface SentenceGroup {
  id: string; // uuid
  name: string;
  historyItems: AnalysisHistoryItem[];
  createdAt: number;
  colorIdentifier?: string; // e.g., 'pink', 'green', etc.
}

export interface PastelColor {
  name: string;
  identifier: string;
  bgClass: string; // Tailwind background class e.g., 'bg-pastel-pink'
  textClass: string; // Tailwind text class e.g., 'text-pastel-pink' for borders or accents
  hex?: string; // Optional: for display in color picker if needed
}

export const availablePastelColors: PastelColor[] = [
  { name: 'Predeterminado', identifier: 'default', bgClass: 'bg-card', textClass: 'text-card-foreground' },
  { name: 'Rosa', identifier: 'pink', bgClass: 'bg-pastel-pink', textClass: 'text-pastel-pink' },
  { name: 'Verde', identifier: 'green', bgClass: 'bg-pastel-green', textClass: 'text-pastel-green' },
  { name: 'Amarillo', identifier: 'yellow', bgClass: 'bg-pastel-yellow', textClass: 'text-pastel-yellow' },
  { name: 'Morado', identifier: 'purple', bgClass: 'bg-pastel-purple', textClass: 'text-pastel-purple' },
  { name: 'Azul', identifier: 'blue', bgClass: 'bg-pastel-blue', textClass: 'text-pastel-blue' },
  { name: 'Naranja', identifier: 'orange', bgClass: 'bg-pastel-orange', textClass: 'text-pastel-orange' },
  { name: 'Gris', identifier: 'gray', bgClass: 'bg-pastel-gray', textClass: 'text-pastel-gray' },
  { name: 'Turquesa', identifier: 'teal', bgClass: 'bg-pastel-teal', textClass: 'text-pastel-teal' },
  { name: 'Lima', identifier: 'lime', bgClass: 'bg-pastel-lime', textClass: 'text-pastel-lime' },
  { name: 'Rosado', identifier: 'rose', bgClass: 'bg-pastel-rose', textClass: 'text-pastel-rose' },
];
