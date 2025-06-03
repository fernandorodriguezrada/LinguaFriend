
'use client';

import React, { useState, useTransition, useCallback, useRef, useEffect } from 'react';
import { Header } from '@/components/layout/Header';
import { SentenceInputForm } from '@/components/linguist/SentenceInputForm';
import { AnalysisDisplay } from '@/components/linguist/AnalysisDisplay';
import { TranslationDisplay } from '@/components/linguist/TranslationDisplay';
import { FeatureToggleControls } from '@/components/linguist/FeatureToggleControls';
import type { FeatureToggleState, AnalysisResult, ImprovementResult, AnalysisHistoryItem, SentenceGroup } from '@/lib/types'; // Removed WordAnalysisDetail
import { CommonMistakesDisplay } from '@/components/linguist/CommonMistakesDisplay';
import { HistoryModal } from '@/components/history/HistoryModal';
import { SentenceGroupsDisplay } from '@/components/groups/SentenceGroupsDisplay';
import { useAnalysisHistory } from '@/hooks/useAnalysisHistory';
import { useSentenceGroups } from '@/hooks/useSentenceGroups';
import { handleAnalyzeSentence, type ActionState } from './actions';
import { Loader2, AlertTriangle } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { v4 as uuidv4 } from 'uuid';

const initialActionState: ActionState = {
  data: null,
  improvementData: null,
  error: null,
  originalSentence: '',
};

const initialFeatureToggles: FeatureToggleState = {
  showSynonyms: true,
  showUsageTips: true,
  focusOnVerbs: false,
  eli5Mode: false,
  showImprovementSuggestions: true,
};

export default function LinguaFriendPage() {
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult>(null);
  const [improvementResult, setImprovementResult] = useState<ImprovementResult>(null);
  const [currentSentence, setCurrentSentence] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [featureToggles, setFeatureToggles] = useState<FeatureToggleState>(initialFeatureToggles);
  const [isPending, startTransition] = useTransition();
  const resultsContainerRef = useRef<HTMLDivElement>(null);

  const { 
    history, 
    addHistoryItem, 
    deleteHistoryItem, 
    clearHistory,
    getHistoryItemById // Keep if needed elsewhere, not directly used in this refactor
  } = useAnalysisHistory();
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);

  const { 
    groups: sentenceGroups, 
    createGroup, 
    deleteGroup, 
    addHistoryItemsToGroup, // Updated from addWordsToGroup
    removeHistoryItemFromGroup, // Updated from removeWordFromGroup
    // getGroupById // Keep if needed
  } = useSentenceGroups();

  const handleAnalysisFormSubmit = useCallback((result: ActionState) => {
    startTransition(() => {
      setCurrentSentence(result.originalSentence || '');
      if (result.error) {
        setError(result.error);
        setAnalysisResult(null);
        setImprovementResult(null);
      } else {
        // Ensure wordAnalysis items have unique IDs for selection
        const analysisDataWithWordIds = result.data ? {
          ...result.data,
          wordAnalysis: result.data.wordAnalysis.map(wa => ({ ...wa, id: wa.id || uuidv4() }))
        } : null;
        
        setAnalysisResult(analysisDataWithWordIds);
        setImprovementResult(result.improvementData);
        setError(null);

        if (analysisDataWithWordIds && result.originalSentence) {
          const historyEntry: AnalysisHistoryItem = {
            id: uuidv4(), // Use uuid for more robust unique IDs
            originalSentence: result.originalSentence,
            analysis: analysisDataWithWordIds,
            improvement: result.improvementData,
            timestamp: Date.now(),
          };
          addHistoryItem(historyEntry);
        }
      }
    });
  }, [startTransition, addHistoryItem]);

  useEffect(() => {
    if (resultsContainerRef.current && !isPending && !error && (analysisResult || improvementResult?.hasImprovements || sentenceGroups.length > 0)) {
      resultsContainerRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [analysisResult, improvementResult, sentenceGroups, error, isPending]);

  const handleCreateSentenceGroup = async (name: string): Promise<SentenceGroup | null> => {
    const newGroup = createGroup(name);
    return newGroup;
  };

  const handleViewHistoryItemInGroup = (item: AnalysisHistoryItem) => {
    // This function could open the HistoryModal and set its selectedHistoryItemDetail
    // Or display the item in another way. For now, let's make it open HistoryModal
    // and show the specific item.
    // To do this properly, HistoryModal might need a way to be opened to a specific item.
    // For simplicity now, we'll just log, or you can implement the modal opening.
    console.log("Viewing history item from group:", item);
    // A more complex implementation would set state to open HistoryModal with this item.
    // For example:
    // setSelectedHistoryItemForModal(item); // a new state
    // setIsHistoryModalOpen(true);
  };


  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-8 md:px-6 md:py-12">
        <div className="grid gap-12 lg:grid-cols-3">
          <div className="lg:col-span-1 space-y-6">
            <Card className="shadow-xl">
              <CardContent className="p-6">
                <SentenceInputForm
                  onAnalysisResult={handleAnalysisFormSubmit}
                  initialState={initialActionState}
                  serverAction={handleAnalyzeSentence}
                  currentFeatureToggles={featureToggles}
                  onOpenHistory={() => setIsHistoryModalOpen(true)}
                />
              </CardContent>
            </Card>
            <FeatureToggleControls toggles={featureToggles} onToggleChange={setFeatureToggles} />
          </div>

          <div className="lg:col-span-2 space-y-8">
            {isPending && (
              <div className="flex flex-col items-center justify-center p-10 bg-card rounded-lg shadow-md">
                <Loader2 className="h-12 w-12 animate-spin text-primary" />
                <p className="mt-4 text-lg text-muted-foreground">Analizando tu oración...</p>
              </div>
            )}

            {!isPending && error && (
              <Card className="border-destructive bg-destructive/10 shadow-md">
                <CardContent className="p-6 flex flex-col items-center text-center">
                  <AlertTriangle className="h-12 w-12 text-destructive" />
                  <h3 className="mt-4 text-xl font-semibold text-destructive font-headline">Error en el Análisis</h3>
                  <p className="mt-2 text-destructive/90">{error}</p>
                </CardContent>
              </Card>
            )}
            
            {!isPending && !error && (
              <div ref={resultsContainerRef}>
                {/* Display Sentence Groups first */}
                 <SentenceGroupsDisplay 
                    groups={sentenceGroups}
                    onCreateGroup={handleCreateSentenceGroup}
                    onDeleteGroup={deleteGroup}
                    onRemoveHistoryItemFromGroup={removeHistoryItemFromGroup}
                    onViewHistoryItemDetails={handleViewHistoryItemInGroup} // Optional: pass if you want view details from group
                />

                {(analysisResult || improvementResult?.hasImprovements || currentSentence ) ? (
                  <div className="space-y-8 mt-8"> {/* Added mt-8 for spacing */}
                    {currentSentence && <TranslationDisplay originalSentence={currentSentence} />}
                    {improvementResult && improvementResult.hasImprovements && (
                      <CommonMistakesDisplay improvement={improvementResult} />
                    )}
                    {analysisResult && (
                      <AnalysisDisplay 
                        analysis={analysisResult} 
                        featureToggles={featureToggles} 
                      />
                    )}
                  </div>
                ) : (
                  !sentenceGroups.length && ( // Only show welcome if no groups AND no current analysis
                    <Card className="shadow-md mt-8">
                        <CardContent className="p-10 text-center">
                            <h2 className="text-2xl font-headline text-foreground/80">Bienvenido a LinguaFriend</h2>
                            <p className="mt-2 text-muted-foreground">
                                Escribe una oración en inglés en el panel de la izquierda y presiona "Analizar Oración" para comenzar.
                            </p>
                             <img 
                               src="https://placehold.co/600x400.png" 
                               alt="Image illustrating confusing English words or grammar concepts" 
                               data-ai-hint="english learning grammar"
                               className="mt-6 rounded-lg mx-auto shadow-lg border-2 border-primary/90"
                             />
                        </CardContent>
                    </Card>
                  )
                )}
              </div>
            )}
          </div>
        </div>
      </main>
      <footer className="py-6 text-center text-sm text-muted-foreground border-t border-border/40">
        © {new Date().getFullYear()} LinguaFriend. Hecho con ❤️ para aprender inglés.
      </footer>

      <HistoryModal
        isOpen={isHistoryModalOpen}
        onClose={() => setIsHistoryModalOpen(false)}
        historyItems={history}
        onDeleteItem={deleteHistoryItem}
        onClearHistory={clearHistory}
        featureToggles={featureToggles}
        sentenceGroups={sentenceGroups}
        onCreateGroup={handleCreateSentenceGroup}
        onAddHistoryItemsToGroup={addHistoryItemsToGroup} // Updated prop
      />
    </div>
  );
}
