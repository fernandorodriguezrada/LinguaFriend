
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
import { Loader2, AlertTriangle, ZoomOut, Github, ServerCrash } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
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
  const [isPendingAnalysis, startTransition] = useTransition();
  
  const resultsContainerRef = useRef<HTMLDivElement>(null);
  const translationDisplayRef = useRef<HTMLDivElement>(null);
  const [isContentScaled, setIsContentScaled] = useState(false);
  const [isLeftColumnHidden, setIsLeftColumnHidden] = useState(false);


  const {
    history,
    addHistoryItem,
    deleteHistoryItem,
    clearHistory,
    isLoading: isHistoryLoading,
  } = useAnalysisHistory();
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);

  const {
    groups: sentenceGroups,
    createGroup,
    updateGroup,
    deleteGroup,
    addHistoryItemsToGroup,
    removeHistoryItemFromGroup,
    isLoading: isGroupsLoading,
  } = useSentenceGroups();

  const isInitialLoading = isHistoryLoading || isGroupsLoading;

  const resetFocusAndScale = () => {
    setIsContentScaled(false);
    setIsLeftColumnHidden(false);
  };

  const handleAnalysisFormSubmit = useCallback(async (result: ActionState) => {
    startTransition(async () => {
      setCurrentSentence(result.originalSentence || '');
      resetFocusAndScale();

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
            const translationAPIResult = await translateSentence({ sentence: result.originalSentence, targetLanguage: 'Spanish' });
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

  const handleZoomToAnalysisContent = useCallback(() => {
    if (analysisResult || improvementResult?.hasImprovements || currentSentence) {
        setIsContentScaled(prev => !prev);
        setIsLeftColumnHidden(prev => !prev);
    } else if (isContentScaled || isLeftColumnHidden) { 
        setIsContentScaled(false);
        setIsLeftColumnHidden(false);
    }
  }, [analysisResult, improvementResult, currentSentence, isContentScaled, isLeftColumnHidden]);

 useEffect(() => {
    const focusModeActive = isContentScaled && isLeftColumnHidden;
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('focusModeStateChange', { detail: { isFocusModeActive: focusModeActive } }));
    }

    if (focusModeActive) { 
        requestAnimationFrame(() => {
            if (translationDisplayRef.current) {
                translationDisplayRef.current.scrollIntoView({ behavior: 'instant', block: 'start' });
            } else if (resultsContainerRef.current) {
                resultsContainerRef.current.scrollIntoView({ behavior: 'instant', block: 'start' });
            }
        });
    }
  }, [isContentScaled, isLeftColumnHidden]);


  useEffect(() => {
    const eventHandler = () => handleZoomToAnalysisContent();
    window.addEventListener('zoomToAnalysisContent', eventHandler);
    return () => {
      window.removeEventListener('zoomToAnalysisContent', eventHandler);
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
      resetFocusAndScale();
    });
  };

  const rightColumnSpanClass = 
    (isContentScaled && isLeftColumnHidden) 
    ? 'lg:col-span-3' 
    : isLeftColumnHidden 
    ? 'lg:col-span-3' 
    : 'lg:col-span-2'; 

  const resultsContainerClasses = cn({
    'lg:w-2/3 mx-auto': isContentScaled && isLeftColumnHidden, 
    'w-full': !(isContentScaled && isLeftColumnHidden),
  });
  
  const scaleStyle = {
    transform: isContentScaled ? 'scale(1.20)' : 'scale(1)',
    transformOrigin: (isContentScaled && isLeftColumnHidden) ? 'top' : 'top left',
    transition: 'transform 0.3s ease-in-out',
  };

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-8 md:px-6 md:py-12">
        {isInitialLoading ? (
          <div className="flex flex-col items-center justify-center h-[60vh]">
            <Loader2 className="h-16 w-16 animate-spin text-primary" />
            <p className="mt-6 text-xl text-muted-foreground font-semibold">
              Cargando LinguaFriend...
            </p>
            <p className="mt-2 text-sm text-muted-foreground">
              Preparando tus datos guardados.
            </p>
          </div>
        ) : (
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
              rightColumnSpanClass
            )}>
              {isPendingAnalysis && (
                <div className="flex flex-col items-center justify-center p-10 bg-card rounded-lg shadow-md">
                  <Loader2 className="h-12 w-12 animate-spin text-primary" />
                  <p className="mt-4 text-lg text-muted-foreground">Analizando tu oración...</p>
                </div>
              )}

              {!isPendingAnalysis && error && (
                <Card className="border-destructive bg-destructive/10 shadow-md">
                  <CardContent className="p-6 flex flex-col items-center text-center">
                    <AlertTriangle className="h-12 w-12 text-destructive" />
                    <h3 className="mt-4 text-xl font-semibold text-destructive font-headline">Error en el Análisis</h3>
                    <p className="mt-2 text-destructive/90">{error}</p>
                  </CardContent>
                </Card>
              )}

              {!isPendingAnalysis && !error && (
                <>
                  {!(isContentScaled && isLeftColumnHidden) && ( 
                    <SentenceGroupsDisplay
                        groups={sentenceGroups}
                        onCreateGroup={handleCreateSentenceGroup}
                        onUpdateGroup={handleUpdateSentenceGroup}
                        onDeleteGroup={deleteGroup}
                        onRemoveHistoryItemFromGroup={removeHistoryItemFromGroup}
                        onViewHistoryItemDetails={handleViewHistoryItemInGroup}
                    />
                  )}
                  
                  <div 
                    ref={resultsContainerRef}
                    className={resultsContainerClasses}
                    style={scaleStyle}
                  >
                    {(analysisResult || improvementResult?.hasImprovements || currentSentence ) ? (
                      <div className={cn(
                        "space-y-8",
                        (isContentScaled && isLeftColumnHidden) ? "mt-0" : "mt-8" 
                      )}>
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
                      !(isContentScaled && isLeftColumnHidden) && sentenceGroups.length === 0 && (
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
                </>
              )}
            </div>
          </div>
        )}
      </main>
      <footer className="py-6 text-center text-sm text-muted-foreground border-t border-border/40">
        <div className="flex items-center justify-center gap-2">
            <span>© 2025 LinguaFriend. Hecho con ❤️ por frDev para aprender inglés.</span>
            <a
                href="https://github.com/fernandorodriguezrada"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="frDev GitHub"
                className="text-muted-foreground hover:text-primary transition-colors"
            >
                <Github className="h-5 w-5" />
            </a>
        </div>
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

      {isContentScaled && isLeftColumnHidden && (
        <Button
          variant="default"
          size="icon"
          className="fixed bottom-6 right-6 z-50 h-12 w-12 rounded-md shadow-lg"
          onClick={handleZoomToAnalysisContent}
          aria-label="Salir del modo enfoque"
        >
          <ZoomOut className="h-6 w-6" />
        </Button>
      )}
    </div>
  );
}
    
