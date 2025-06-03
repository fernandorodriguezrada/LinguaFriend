
'use client';

import React, { useState, useCallback } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { AnalysisDisplay } from '@/components/linguist/AnalysisDisplay';
import { CommonMistakesDisplay } from '@/components/linguist/CommonMistakesDisplay';
import type { AnalysisHistoryItem, WordAnalysisDetail, FeatureToggleState, SentenceGroup } from '@/lib/types';
import { Trash2, PlusCircle, Eye } from 'lucide-react';
import { AddToGroupDialog } from '@/components/groups/AddToGroupDialog'; // Will create this

interface HistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  historyItems: AnalysisHistoryItem[];
  onDeleteItem: (itemId: string) => void;
  onClearHistory: () => void;
  featureToggles: FeatureToggleState; // Pass toggles for consistent display
  sentenceGroups: SentenceGroup[]; // For AddToGroupDialog
  onCreateGroup: (name: string) => Promise<SentenceGroup | null>; // For AddToGroupDialog
  onAddWordsToGroup: (groupId: string, words: WordAnalysisDetail[]) => void; // For AddToGroupDialog
}

export function HistoryModal({
  isOpen,
  onClose,
  historyItems,
  onDeleteItem,
  onClearHistory,
  featureToggles,
  sentenceGroups,
  onCreateGroup,
  onAddWordsToGroup,
}: HistoryModalProps) {
  const [selectedHistoryItem, setSelectedHistoryItem] = useState<AnalysisHistoryItem | null>(null);
  const [selectedWordsForGrouping, setSelectedWordsForGrouping] = useState<WordAnalysisDetail[]>([]);
  const [isAddToGroupDialogOpen, setIsAddToGroupDialogOpen] = useState(false);

  const handleViewDetails = (item: AnalysisHistoryItem) => {
    setSelectedHistoryItem(item);
    setSelectedWordsForGrouping([]); // Reset selection when viewing new item
  };

  const handleBackToList = () => {
    setSelectedHistoryItem(null);
    setSelectedWordsForGrouping([]);
  };

  const handleWordSelectToggle = useCallback((word: WordAnalysisDetail, isSelected: boolean) => {
    setSelectedWordsForGrouping(prev =>
      isSelected ? [...prev, word] : prev.filter(w => !(w.word === word.word && w.role === word.role))
    );
  }, []);

  const handleOpenAddToGroupDialog = () => {
    if (selectedWordsForGrouping.length > 0) {
      setIsAddToGroupDialogOpen(true);
    } else {
      // Maybe show a toast "Please select words to add to a group"
    }
  };

  const handleConfirmAddToGroup = (groupId: string) => {
    onAddWordsToGroup(groupId, selectedWordsForGrouping);
    setIsAddToGroupDialogOpen(false);
    setSelectedWordsForGrouping([]); // Clear selection after adding
    // Potentially close history item view or show success message
  };
  
  const handleCreateAndAdd = async (groupName: string) => {
    const newGroup = await onCreateGroup(groupName);
    if (newGroup) {
      onAddWordsToGroup(newGroup.id, selectedWordsForGrouping);
      setIsAddToGroupDialogOpen(false);
      setSelectedWordsForGrouping([]);
    }
  };

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => { if (!open) { onClose(); handleBackToList(); } }}>
      <DialogContent className="max-w-3xl h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>{selectedHistoryItem ? `Detalles de "${selectedHistoryItem.originalSentence.substring(0,30)}..."` : "Historial de Análisis"}</DialogTitle>
          <DialogDescription>
            {selectedHistoryItem ? "Revisa el análisis y selecciona palabras para agrupar." : "Revisa tus análisis anteriores."}
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="flex-grow pr-6 -mr-6 mb-4">
          {selectedHistoryItem ? (
            <div className="space-y-4">
              {selectedHistoryItem.improvement && (
                <CommonMistakesDisplay improvement={selectedHistoryItem.improvement} />
              )}
              <AnalysisDisplay
                analysis={selectedHistoryItem.analysis}
                featureToggles={featureToggles}
                isSelectableMode={true}
                selectedWordsForGrouping={selectedWordsForGrouping}
                onWordSelectToggle={handleWordSelectToggle}
              />
            </div>
          ) : (
            <div className="space-y-3">
              {historyItems.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">No hay historial disponible.</p>
              ) : (
                historyItems.map(item => (
                  <Card key={item.id} className="hover:shadow-md transition-shadow">
                    <CardHeader>
                      <CardTitle className="text-lg truncate">{item.originalSentence}</CardTitle>
                      <CardDescription>
                        Analizado el: {new Date(item.timestamp).toLocaleString()}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="flex justify-end gap-2">
                      <Button variant="outline" size="sm" onClick={() => handleViewDetails(item)}>
                        <Eye className="mr-2 h-4 w-4" /> Ver Detalles
                      </Button>
                      <Button variant="destructive" size="sm" onClick={() => onDeleteItem(item.id)}>
                        <Trash2 className="mr-2 h-4 w-4" /> Eliminar
                      </Button>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          )}
        </ScrollArea>

        <DialogFooter className="mt-auto pt-4 border-t">
          {selectedHistoryItem ? (
            <>
              <Button
                variant="outline"
                onClick={handleBackToList}
              >
                Volver al Historial
              </Button>
              <Button
                onClick={handleOpenAddToGroupDialog}
                disabled={selectedWordsForGrouping.length === 0}
              >
                <PlusCircle className="mr-2 h-4 w-4" />
                Añadir {selectedWordsForGrouping.length > 0 ? `(${selectedWordsForGrouping.length}) ` : ''}a Grupo
              </Button>
            </>
          ) : (
            <>
              <Button variant="ghost" onClick={onClose}>Cerrar</Button>
              {historyItems.length > 0 && (
                <Button variant="destructive" onClick={onClearHistory}>
                  <Trash2 className="mr-2 h-4 w-4" /> Limpiar Historial
                </Button>
              )}
            </>
          )}
        </DialogFooter>
      </DialogContent>

      {selectedHistoryItem && isAddToGroupDialogOpen && (
        <AddToGroupDialog
          isOpen={isAddToGroupDialogOpen}
          onClose={() => setIsAddToGroupDialogOpen(false)}
          groups={sentenceGroups}
          onCreateGroup={handleCreateAndAdd}
          onSelectGroup={handleConfirmAddToGroup}
          itemCount={selectedWordsForGrouping.length}
        />
      )}
    </Dialog>
  );
}
