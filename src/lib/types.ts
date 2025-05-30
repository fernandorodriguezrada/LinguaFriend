import type { AnalyzeSentenceOutput } from '@/ai/flows/analyze-sentence';

export interface FeatureToggleState {
  showSynonyms: boolean;
  showUsageTips: boolean;
  focusOnVerbs: boolean;
}

export type AnalysisResult = AnalyzeSentenceOutput | null;
