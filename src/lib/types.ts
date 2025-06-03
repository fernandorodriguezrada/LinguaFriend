
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
  historyItems: AnalysisHistoryItem[]; // Changed from words: WordAnalysisDetail[]
  createdAt: number;
}

