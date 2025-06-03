
'use client';

import React, { useState } from 'react';
import type { SentenceGroup, AnalysisHistoryItem } from '@/lib/types'; // Updated import
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Badge } from '@/components/ui/badge';
import { CreateGroupDialog } from './CreateGroupDialog';
import { FolderKanban, PlusCircle, Trash2, FileText, Eye } from 'lucide-react'; // Added Eye

interface SentenceGroupsDisplayProps {
  groups: SentenceGroup[];
  onCreateGroup: (name: string) => Promise<SentenceGroup | null>;
  onDeleteGroup: (groupId: string) => void;
  onRemoveHistoryItemFromGroup: (groupId: string, historyItemId: string) => void; // Changed prop name and signature
  onViewHistoryItemDetails?: (item: AnalysisHistoryItem) => void; // Optional: to view full details
}

export function SentenceGroupsDisplay({ 
    groups, 
    onCreateGroup, 
    onDeleteGroup, 
    onRemoveHistoryItemFromGroup,
    onViewHistoryItemDetails
}: SentenceGroupsDisplayProps) {
  const [isCreateGroupDialogOpen, setIsCreateGroupDialogOpen] = useState(false);

  const handleCreateGroup = async (name: string) => {
    await onCreateGroup(name);
    setIsCreateGroupDialogOpen(false);
  };

  return (
    <>
      <Card className="shadow-lg">
        <CardHeader className="flex flex-row items-center justify-between">
          <div className="space-y-1">
            <CardTitle className="text-2xl font-headline flex items-center gap-2">
              <FolderKanban className="h-6 w-6 text-primary" />
              Grupos de Análisis
            </CardTitle>
            <CardDescription>
              Organiza y revisa análisis de oraciones guardados.
            </CardDescription>
          </div>
          <Button onClick={() => setIsCreateGroupDialogOpen(true)} size="sm">
            <PlusCircle className="mr-2 h-4 w-4" /> Crear Grupo
          </Button>
        </CardHeader>
        <CardContent>
          {groups.length === 0 ? (
            <p className="text-muted-foreground text-center py-6">
              No has creado ningún grupo todavía. ¡Crea uno para empezar!
            </p>
          ) : (
            <Accordion type="multiple" className="w-full space-y-3">
              {groups.map((group) => (
                <AccordionItem key={group.id} value={group.id} className="border bg-card/50 rounded-md shadow-sm">
                  <div className="flex items-center justify-between p-4 rounded-t-md hover:bg-muted/40 transition-colors">
                    <AccordionTrigger className="flex-1 text-lg font-semibold text-left hover:no-underline p-0 focus-visible:ring-1 focus-visible:ring-ring">
                      {group.name} ({group.historyItems.length} {group.historyItems.length === 1 ? 'análisis' : 'análisis'})
                    </AccordionTrigger>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-destructive hover:text-destructive/80 hover:bg-destructive/10 ml-3 shrink-0 p-1.5 h-auto"
                      onClick={(e) => { e.stopPropagation(); onDeleteGroup(group.id);}}
                      aria-label={`Eliminar grupo ${group.name}`}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                  <AccordionContent className="p-4 border-t">
                    {group.historyItems.length === 0 ? (
                      <p className="text-sm text-muted-foreground">Este grupo está vacío.</p>
                    ) : (
                      <ul className="space-y-2">
                        {group.historyItems.map((item) => (
                          <li key={item.id} className="flex justify-between items-center p-2 rounded-md hover:bg-muted/20">
                            <div className="flex items-center gap-2 flex-grow overflow-hidden">
                                <FileText className="h-4 w-4 text-primary/80 shrink-0" />
                                <p className="text-sm text-foreground truncate" title={item.originalSentence}>
                                    {item.originalSentence}
                                </p>
                            </div>
                            <div className="flex gap-1 shrink-0 ml-2">
                                {onViewHistoryItemDetails && (
                                    <Button
                                        variant="outline"
                                        size="icon"
                                        className="h-7 w-7"
                                        onClick={() => onViewHistoryItemDetails(item)}
                                        aria-label={`Ver detalles de "${item.originalSentence}"`}
                                    >
                                        <Eye className="h-3 w-3" />
                                    </Button>
                                )}
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="text-destructive hover:text-destructive/80 hover:bg-destructive/10 h-7 w-7"
                                  onClick={() => onRemoveHistoryItemFromGroup(group.id, item.id)}
                                  aria-label={`Eliminar "${item.originalSentence}" del grupo`}
                                >
                                  <Trash2 className="h-3 w-3" />
                                </Button>
                            </div>
                          </li>
                        ))}
                      </ul>
                    )}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          )}
        </CardContent>
      </Card>

      <CreateGroupDialog
        isOpen={isCreateGroupDialogOpen}
        onClose={() => setIsCreateGroupDialogOpen(false)}
        onCreateGroup={handleCreateGroup}
      />
    </>
  );
}
