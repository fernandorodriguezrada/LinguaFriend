
import type { AnalyzeSentenceOutput as OriginalAnalyzeSentenceOutput, ImproveSentenceOutput } from '@/ai/flows/analyze-sentence'; // Assuming ImproveSentenceOutput is also from here or its own file

export interface SentencePart {
  text: string;
  role: string; // e.g., "verb", "noun", "adjective" - for styling
  rawRole?: string; // The detailed role from AI, e.g., "Verbo (Transitivo)"
}
export interface ExtendedAnalyzeSentenceOutput extends OriginalAnalyzeSentenceOutput {
  sentenceParts: SentencePart[];
  idiomExplanation?: string;
}

export interface FeatureToggleState {
  showSynonyms: boolean;
  showUsageTips: boolean;
  focusOnVerbs: boolean;
  eli5Mode: boolean; // Explain Like I'm 5
}

export type AnalysisResult = ExtendedAnalyzeSentenceOutput | null;
export type ImprovementResult = ImproveSentenceOutput | null;

// Re-exporting ImproveSentence types if they are not already globally available
export type { ImproveSentenceInput, ImproveSentenceOutput } from '@/ai/flows/improve-sentence';
