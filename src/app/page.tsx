
'use client';

import React, { useState, useTransition, useCallback, useRef, useEffect } from 'react';
import { Header } from '@/components/layout/Header';
import { SentenceInputForm } from '@/components/linguist/SentenceInputForm';
import { AnalysisDisplay } from '@/components/linguist/AnalysisDisplay';
import { TranslationDisplay } from '@/components/linguist/TranslationDisplay';
import { FeatureToggleControls } from '@/components/linguist/FeatureToggleControls';
import type { FeatureToggleState, AnalysisResult, ImprovementResult, AnalysisHistoryItem, SentenceGroup } from '@/lib/types';
import { CommonMistakesDisplay } from '@/components/linguist/CommonMistakesDisplay';
import { HistoryModal } from '@/components/history/HistoryModal';
import { SentenceGroupsDisplay } from '@/components/groups/SentenceGroupsDisplay';
import { useAnalysisHistory } from '@/hooks/useAnalysisHistory';
import { useSentenceGroups } from '@/hooks/useSentenceGroups';
import { handleAnalyzeSentence, type ActionState } from './actions';
import { translateSentence } from '@/ai/flows/translate-sentence-flow';
import { Loader2, AlertTriangle } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { v4 as uuidv4 } from 'uuid';
import { cn } from '@/lib/utils';

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
  eli5Mode: true,
  showImprovementSuggestions: true,
};

export default function LinguaFriendPage() {
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult>(null);
  const [improvementResult, setImprovementResult] = useState<ImprovementResult>(null);
  const [currentSentence, setCurrentSentence] = useState<string>('');
  const [loadedTranslation, setLoadedTranslation] = useState<string | undefined>(undefined);
  const [error, setError] = useState<string | null>(null);
  const [featureToggles, setFeatureToggles] = useState<FeatureToggleState>(initialFeatureToggles);
  const [isPending, startTransition] = useTransition();
  
  const resultsContainerRef = useRef<HTMLDivElement>(null);
  const translationDisplayRef = useRef<HTMLDivElement>(null);
  const [isContentScaled, setIsContentScaled] = useState(false);
  const [isLeftColumnHidden, setIsLeftColumnHidden] = useState(false);


  const {
    history,
    addHistoryItem,
    deleteHistoryItem,
    clearHistory,
  } = useAnalysisHistory();
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);

  const {
    groups: sentenceGroups,
    createGroup,
    updateGroup,
    deleteGroup,
    addHistoryItemsToGroup,
    removeHistoryItemFromGroup,
  } = useSentenceGroups();

  const handleAnalysisFormSubmit = useCallback(async (result: ActionState) => {
    startTransition(async () => {
      setCurrentSentence(result.originalSentence || '');
      setIsLeftColumnHidden(false); // Reset focus mode on new analysis
      setIsContentScaled(false); // Reset scale on new analysis

      if (result.error) {
        setError(result.error);
        setAnalysisResult(null);
        setImprovementResult(null);
        setLoadedTranslation(undefined);
      } else {
        const analysisDataWithWordIds = result.data ? {
          ...result.data,
          wordAnalysis: result.data.wordAnalysis.map(wa => ({ ...wa, id: wa.id || uuidv4() }))
        } : null;

        setAnalysisResult(analysisDataWithWordIds);
        setImprovementResult(result.improvementData);
        setError(null);
        

        let finalTranslatedSentence: string | undefined = undefined;
        if (analysisDataWithWordIds && result.originalSentence) {
          try {
            const translationAPIResult = await translateSentence({ sentence: result.originalSentence });
            finalTranslatedSentence = translationAPIResult.translatedSentence;
            setLoadedTranslation(finalTranslatedSentence);
          } catch (e) {
            console.error("Failed to fetch translation for history:", e);
            setLoadedTranslation(undefined);
          }

          const historyEntry: AnalysisHistoryItem = {
            id: uuidv4(),
            originalSentence: result.originalSentence,
            analysis: analysisDataWithWordIds,
            improvement: result.improvementData,
            timestamp: Date.now(),
            translatedSentence: finalTranslatedSentence,
          };
          addHistoryItem(historyEntry);
        } else {
           setLoadedTranslation(undefined);
        }
      }
    });
  }, [startTransition, addHistoryItem]);

  useEffect(() => {
    if (!isPending) {
      if (translationDisplayRef.current && currentSentence) {
        translationDisplayRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
      } else if (resultsContainerRef.current && (analysisResult || improvementResult?.hasImprovements)) {
        resultsContainerRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  }, [analysisResult, improvementResult, currentSentence, isPending]);

  const handleZoomToAnalysisContent = useCallback(() => {
    let didScroll = false;
    if (translationDisplayRef.current) {
      translationDisplayRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
      didScroll = true;
    } else if (resultsContainerRef.current) {
      resultsContainerRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
      didScroll = true;
    }

    // Toggle zoom and focus mode only if there's content or if we scrolled
    if (didScroll || analysisResult || improvementResult?.hasImprovements || currentSentence) {
       setIsContentScaled(prev => !prev);
       setIsLeftColumnHidden(prev => !prev);
    }

  }, [analysisResult, improvementResult, currentSentence]); 

  useEffect(() => {
    window.addEventListener('zoomToAnalysisContent', handleZoomToAnalysisContent);
    return () => {
      window.removeEventListener('zoomToAnalysisContent', handleZoomToAnalysisContent);
    };
  }, [handleZoomToAnalysisContent]);


  const handleCreateSentenceGroup = async (name: string, colorIdentifier: string): Promise<SentenceGroup | null> => {
    const newGroup = createGroup(name, colorIdentifier);
    return newGroup;
  };
  
  const handleUpdateSentenceGroup = (groupId: string, updates: { name?: string; colorIdentifier?: string }) => {
    updateGroup(groupId, updates);
  };

  const handleViewHistoryItemInGroup = (item: AnalysisHistoryItem) => {
    startTransition(() => {
      setCurrentSentence(item.originalSentence);
      setAnalysisResult(item.analysis);
      setImprovementResult(item.improvement || null);
      setLoadedTranslation(item.translatedSentence);
      setError(null);
      setIsHistoryModalOpen(false); 
      setIsContentScaled(false); // Reset scale when loading new item
      setIsLeftColumnHidden(false); // Reset focus mode when loading new item
    });
  };


  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-8 md:px-6 md:py-12">
        <div className="grid gap-12 lg:grid-cols-3">
          <div className={cn(
            "lg:col-span-1 space-y-6 transition-all duration-300 ease-in-out",
            { "lg:hidden opacity-0": isLeftColumnHidden, "opacity-100": !isLeftColumnHidden }
          )}>
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

          <div className={cn(
            "space-y-8 transition-all duration-300 ease-in-out",
            isLeftColumnHidden ? "lg:col-span-3" : "lg:col-span-2"
          )}>
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
              <div 
                ref={resultsContainerRef}
                style={{
                  transform: isContentScaled ? 'scale(1.15)' : 'scale(1)',
                  transformOrigin: isLeftColumnHidden ? 'top' : 'top left', // Adjust origin when left column is hidden
                  transition: 'transform 0.3s ease-in-out',
                }}
              >
                 <SentenceGroupsDisplay
                    groups={sentenceGroups}
                    onCreateGroup={handleCreateSentenceGroup}
                    onUpdateGroup={handleUpdateSentenceGroup}
                    onDeleteGroup={deleteGroup}
                    onRemoveHistoryItemFromGroup={removeHistoryItemFromGroup}
                    onViewHistoryItemDetails={handleViewHistoryItemInGroup}
                />

                {(analysisResult || improvementResult?.hasImprovements || currentSentence ) ? (
                  <div className="space-y-8 mt-8">
                    {currentSentence && (
                      <TranslationDisplay 
                        ref={translationDisplayRef} 
                        originalSentence={currentSentence} 
                        loadedTranslation={loadedTranslation} 
                      />
                    )}
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
                  !sentenceGroups.length && ( 
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
        onAddHistoryItemsToGroup={addHistoryItemsToGroup}
        onViewDetails={handleViewHistoryItemInGroup}
      />
    </div>
  );
}

    
