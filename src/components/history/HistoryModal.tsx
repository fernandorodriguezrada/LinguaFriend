
'use client';

import React, { useState, useCallback } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from "@/components/ui/label";
import { AnalysisDisplay } from '@/components/linguist/AnalysisDisplay';
import { CommonMistakesDisplay } from '@/components/linguist/CommonMistakesDisplay';
import type { AnalysisHistoryItem, FeatureToggleState, SentenceGroup, PastelColor } from '@/lib/types';
import { availablePastelColors } from '@/lib/types';
import { Trash2, PlusCircle, Eye } from 'lucide-react';
import { AddToGroupDialog } from '@/components/groups/AddToGroupDialog';
import { cn } from '@/lib/utils';

interface HistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  historyItems: AnalysisHistoryItem[];
  onDeleteItem: (itemId: string) => void;
  onClearHistory: () => void;
  featureToggles: FeatureToggleState;
  sentenceGroups: SentenceGroup[];
  onCreateGroup: (name: string, colorIdentifier: string) => Promise<SentenceGroup | null>;
  onAddHistoryItemsToGroup: (groupId: string, items: AnalysisHistoryItem[]) => void;
  onViewDetails: (item: AnalysisHistoryItem) => void;
}

const getGroupDotColorClass = (colorIdentifier?: string): string => {
  const color = availablePastelColors.find(c => c.identifier === colorIdentifier);
  return color ? color.bgClass : 'bg-muted'; 
};

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
  onViewDetails,
}: HistoryModalProps) {
  const [selectedHistoryItemDetail, setSelectedHistoryItemDetail] = useState<AnalysisHistoryItem | null>(null);
  const [selectedHistoryItemIds, setSelectedHistoryItemIds] = useState<string[]>([]);
  const [isAddToGroupDialogOpen, setIsAddToGroupDialogOpen] = useState(false);

  const handleViewDetailsInModal = (item: AnalysisHistoryItem) => {
    setSelectedHistoryItemDetail(item);
  };

  const handleViewDetailsOnPage = (item: AnalysisHistoryItem) => {
    onViewDetails(item);
    // No need to close modal here, onViewDetails in page.tsx handles it if necessary
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
    setSelectedHistoryItemIds([]);
  };

  const handleCreateAndAdd = async (groupName: string) => {
    // Find a default color or the first available one for the new group
    const defaultColorIdentifier = availablePastelColors.find(c => c.identifier === 'default')?.identifier || availablePastelColors[0]?.identifier || 'default';
    const newGroup = await onCreateGroup(groupName, defaultColorIdentifier); 
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
    setSelectedHistoryItemIds([]);
  };

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => { if (!open) handleModalClose(); }}>
      <DialogContent className="max-w-3xl h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>{selectedHistoryItemDetail ? `Detalles de "${selectedHistoryItemDetail.originalSentence.substring(0,30)}..."` : "Historial de Análisis"}</DialogTitle>
          <DialogDescription>
            {selectedHistoryItemDetail ? "Revisa el análisis detallado o cárgalo en la página principal." : "Selecciona análisis para agrupar o revisa detalles."}
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
              />
            </div>
          ) : (
            <div className="space-y-3 p-1"> {/* Added p-1 here to give space for card rings */}
              {historyItems.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">No hay historial disponible.</p>
              ) : (
                historyItems.map(item => {
                  const groupForItem = sentenceGroups.find(g => Array.isArray(g.historyItems) && g.historyItems.some(hi => hi.id === item.id));
                  const dotBgClass = groupForItem ? getGroupDotColorClass(groupForItem.colorIdentifier) : '';
                  const isDefaultColorGroup = groupForItem && (!groupForItem.colorIdentifier || groupForItem.colorIdentifier === 'default');

                  return (
                    <Card key={item.id} className={`hover:shadow-md transition-shadow ${selectedHistoryItemIds.includes(item.id) ? 'ring-2 ring-primary ring-offset-background ring-offset-1' : ''}`}>
                      <CardHeader className="flex flex-row items-start justify-between gap-4 pb-3">
                        <div className="flex items-start gap-4">
                          <Checkbox
                            id={`history-select-${item.id}`}
                            checked={selectedHistoryItemIds.includes(item.id)}
                            onCheckedChange={(checked) => handleHistoryItemSelectToggle(item.id, checked as boolean)}
                            aria-labelledby={`history-title-${item.id}`}
                            className="mt-1 shrink-0"
                          />
                          <div className="flex-grow">
                            <Label htmlFor={`history-select-${item.id}`} className="cursor-pointer">
                                <CardTitle id={`history-title-${item.id}`} className="text-lg truncate">{item.originalSentence}</CardTitle>
                            </Label>
                            <CardDescription className="text-xs"> 
                                Analizado el: {new Date(item.timestamp).toLocaleString()}
                            </CardDescription>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="pt-0 flex justify-between items-end">
                         {groupForItem ? (
                          <div className="flex items-center gap-2 text-sm text-muted-foreground shrink-0"> {/* Increased gap and text size */}
                            <span 
                              className={cn(
                                "h-3 w-3 rounded-full inline-block", // Increased dot size
                                dotBgClass,
                                isDefaultColorGroup && "border border-border" 
                              )}
                              title={`Grupo: ${groupForItem.name}`}
                            ></span>
                            <span className="truncate max-w-[150px]" title={groupForItem.name}>{groupForItem.name}</span>
                          </div>
                        ) : <div className="flex-1"></div> /* Placeholder to keep buttons to the right */}
                        
                        <div className="flex gap-2">
                          <Button variant="secondary" size="sm" onClick={() => handleViewDetailsOnPage(item)}>
                            <Eye className="mr-2 h-4 w-4" /> Ver en Página
                          </Button>
                          <Button variant="outline" size="sm" onClick={() => handleViewDetailsInModal(item)}>
                            <Eye className="mr-2 h-4 w-4" /> Detalles (Modal)
                          </Button>
                          <Button variant="destructive" size="sm" onClick={() => onDeleteItem(item.id)}>
                            <Trash2 className="mr-2 h-4 w-4" /> Eliminar
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })
              )}
            </div>
          )}
        </ScrollArea>

        <DialogFooter className="mt-auto pt-4 border-t">
          {selectedHistoryItemDetail ? (
            <>
             <Button variant="default" onClick={() => handleViewDetailsOnPage(selectedHistoryItemDetail)}>Cargar en Página Principal</Button>
             <Button variant="outline" onClick={handleBackToList}>Volver al Historial</Button>
            </>
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
          onCreateGroup={handleCreateAndAdd} 
          onSelectGroup={handleConfirmAddToGroup}
          itemCount={selectedHistoryItemIds.length}
        />
      )}
    </Dialog>
  );
}

