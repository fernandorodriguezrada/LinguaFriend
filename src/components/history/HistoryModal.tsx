
'use client';

import React, { useState, useCallback } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { AnalysisDisplay } from '@/components/linguist/AnalysisDisplay';
import { CommonMistakesDisplay } from '@/components/linguist/CommonMistakesDisplay';
import type { AnalysisHistoryItem, FeatureToggleState, SentenceGroup } from '@/lib/types'; // Removed WordAnalysisDetail
import { Trash2, PlusCircle, Eye } from 'lucide-react';
import { AddToGroupDialog } from '@/components/groups/AddToGroupDialog';

interface HistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  historyItems: AnalysisHistoryItem[];
  onDeleteItem: (itemId: string) => void;
  onClearHistory: () => void;
  featureToggles: FeatureToggleState;
  sentenceGroups: SentenceGroup[];
  onCreateGroup: (name: string) => Promise<SentenceGroup | null>;
  onAddHistoryItemsToGroup: (groupId: string, items: AnalysisHistoryItem[]) => void; // Changed prop name and signature
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
  onAddHistoryItemsToGroup,
}: HistoryModalProps) {
  const [selectedHistoryItemDetail, setSelectedHistoryItemDetail] = useState<AnalysisHistoryItem | null>(null);
  const [selectedHistoryItemIds, setSelectedHistoryItemIds] = useState<string[]>([]);
  const [isAddToGroupDialogOpen, setIsAddToGroupDialogOpen] = useState(false);

  const handleViewDetails = (item: AnalysisHistoryItem) => {
    setSelectedHistoryItemDetail(item);
    // Do not reset selectedHistoryItemIds here, user might want to add selected items while viewing one
  };

  const handleBackToList = () => {
    setSelectedHistoryItemDetail(null);
  };

  const handleHistoryItemSelectToggle = useCallback((itemId: string, isSelected: boolean) => {
    setSelectedHistoryItemIds(prev =>
      isSelected ? [...prev, itemId] : prev.filter(id => id !== itemId)
    );
  }, []);

  const handleOpenAddToGroupDialog = () => {
    if (selectedHistoryItemIds.length > 0) {
      setIsAddToGroupDialogOpen(true);
    }
  };

  const getSelectedHistoryItems = (): AnalysisHistoryItem[] => {
    return historyItems.filter(item => selectedHistoryItemIds.includes(item.id));
  };

  const handleConfirmAddToGroup = (groupId: string) => {
    const itemsToAdd = getSelectedHistoryItems();
    if (itemsToAdd.length > 0) {
      onAddHistoryItemsToGroup(groupId, itemsToAdd);
    }
    setIsAddToGroupDialogOpen(false);
    setSelectedHistoryItemIds([]); // Clear selection after adding
  };
  
  const handleCreateAndAdd = async (groupName: string) => {
    const newGroup = await onCreateGroup(groupName);
    const itemsToAdd = getSelectedHistoryItems();
    if (newGroup && itemsToAdd.length > 0) {
      onAddHistoryItemsToGroup(newGroup.id, itemsToAdd);
    }
    setIsAddToGroupDialogOpen(false);
    setSelectedHistoryItemIds([]);
  };

  const handleModalClose = () => {
    onClose();
    handleBackToList();
    setSelectedHistoryItemIds([]); // Clear selection on modal close
  };

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => { if (!open) handleModalClose(); }}>
      <DialogContent className="max-w-3xl h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>{selectedHistoryItemDetail ? `Detalles de "${selectedHistoryItemDetail.originalSentence.substring(0,30)}..."` : "Historial de Análisis"}</DialogTitle>
          <DialogDescription>
            {selectedHistoryItemDetail ? "Revisa el análisis detallado." : "Selecciona análisis para agrupar o revisa detalles."}
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="flex-grow pr-6 -mr-6 mb-4">
          {selectedHistoryItemDetail ? (
            <div className="space-y-4">
              {selectedHistoryItemDetail.improvement && (
                <CommonMistakesDisplay improvement={selectedHistoryItemDetail.improvement} />
              )}
              <AnalysisDisplay
                analysis={selectedHistoryItemDetail.analysis}
                featureToggles={featureToggles}
                // Removed selectable mode props
              />
            </div>
          ) : (
            <div className="space-y-3">
              {historyItems.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">No hay historial disponible.</p>
              ) : (
                historyItems.map(item => (
                  <Card key={item.id} className={`hover:shadow-md transition-shadow ${selectedHistoryItemIds.includes(item.id) ? 'ring-2 ring-primary' : ''}`}>
                    <CardHeader className="flex flex-row items-start gap-4">
                      <Checkbox
                        id={`history-select-${item.id}`}
                        checked={selectedHistoryItemIds.includes(item.id)}
                        onCheckedChange={(checked) => handleHistoryItemSelectToggle(item.id, checked as boolean)}
                        aria-labelledby={`history-title-${item.id}`}
                        className="mt-1"
                      />
                      <div className="flex-grow">
                        <Label htmlFor={`history-select-${item.id}`} className="cursor-pointer">
                            <CardTitle id={`history-title-${item.id}`} className="text-lg truncate">{item.originalSentence}</CardTitle>
                        </Label>
                        <CardDescription>
                            Analizado el: {new Date(item.timestamp).toLocaleString()}
                        </CardDescription>
                      </div>
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
          {selectedHistoryItemDetail ? (
            <Button variant="outline" onClick={handleBackToList}>Volver al Historial</Button>
          ) : (
            <>
              <Button variant="ghost" onClick={handleModalClose}>Cerrar</Button>
              <Button
                onClick={handleOpenAddToGroupDialog}
                disabled={selectedHistoryItemIds.length === 0}
              >
                <PlusCircle className="mr-2 h-4 w-4" />
                Añadir {selectedHistoryItemIds.length > 0 ? `(${selectedHistoryItemIds.length}) ` : ''}a Grupo
              </Button>
              {historyItems.length > 0 && (
                <Button variant="destructive" onClick={onClearHistory}>
                  <Trash2 className="mr-2 h-4 w-4" /> Limpiar Historial
                </Button>
              )}
            </>
          )}
        </DialogFooter>
      </DialogContent>

      {isAddToGroupDialogOpen && (
        <AddToGroupDialog
          isOpen={isAddToGroupDialogOpen}
          onClose={() => setIsAddToGroupDialogOpen(false)}
          groups={sentenceGroups}
          onCreateGroup={handleCreateAndAdd} // This function now handles adding items
          onSelectGroup={handleConfirmAddToGroup} // This function also handles adding items
          itemCount={selectedHistoryItemIds.length}
        />
      )}
    </Dialog>
  );
}
