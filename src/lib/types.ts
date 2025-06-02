
import type { AnalyzeSentenceOutput as OriginalAnalyzeSentenceOutput } from '@/ai/flows/analyze-sentence';

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
  showImprovementSuggestions: boolean;
}

export type AnalysisResult = ExtendedAnalyzeSentenceOutput | null;
// ImprovementResult will use the ImproveSentenceOutput re-exported below
// export type ImprovementResult = ImproveSentenceOutput | null; 

// Re-exporting ImproveSentence types if they are not already globally available
export type { ImproveSentenceInput, ImproveSentenceOutput } from '@/ai/flows/improve-sentence';

// Now define ImprovementResult using the correctly available type
export type ImprovementResult = import('@/ai/flows/improve-sentence').ImproveSentenceOutput | null;
