
import type { AnalyzeSentenceOutput as OriginalAnalyzeSentenceOutput } from '@/ai/flows/analyze-sentence';

export interface SentencePart {
  text: string;
  role: string; // e.g., "verb", "noun", "adjective" - for styling
  rawRole?: string; // The detailed role from AI, e.g., "Verbo (Transitivo)"
}

export interface WordAnalysisDetail { // This is essentially ExtendedAnalyzeSentenceOutput['wordAnalysis'][0]
  word: string;
  role: string;
  definition: string;
  synonyms: string[];
  usageTips: string;
  // Add a unique ID for selection purposes if needed, or rely on index/word combo
  id?: string; 
}

export interface ExtendedAnalyzeSentenceOutput extends OriginalAnalyzeSentenceOutput {
  sentenceParts: SentencePart[];
  wordAnalysis: WordAnalysisDetail[]; // Ensure WordAnalysisDetail is used here
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

// Re-exporting ImproveSentence types
export type { ImproveSentenceInput, ImproveSentenceOutput } from '@/ai/flows/improve-sentence';
export type ImprovementResult = import('@/ai/flows/improve-sentence').ImproveSentenceOutput | null;

// New types for History and Sentence Groups
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
  words: WordAnalysisDetail[];
  createdAt: number;
}
