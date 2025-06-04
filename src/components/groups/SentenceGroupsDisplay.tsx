
'use client';

import React, { useState } from 'react';
import type { SentenceGroup, AnalysisHistoryItem, PastelColor } from '@/lib/types';
import { availablePastelColors } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { CreateGroupDialog } from './CreateGroupDialog';
import { EditGroupDialog } from './EditGroupDialog';
import { FolderKanban, PlusCircle, Trash2, FileText, Eye, Pencil } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SentenceGroupsDisplayProps {
  groups: SentenceGroup[];
  onCreateGroup: (name: string, colorIdentifier: string) => Promise<SentenceGroup | null>;
  onUpdateGroup: (groupId: string, updates: { name?: string; colorIdentifier?: string }) => void;
  onDeleteGroup: (groupId: string) => void;
  onRemoveHistoryItemFromGroup: (groupId: string, historyItemId: string) => void;
  onViewHistoryItemDetails?: (item: AnalysisHistoryItem) => void;
}

// Helper function to get contrasting text class for a given pastel background
const getContrastTextClass = (colorIdentifier?: string): string => {
  if (!colorIdentifier || colorIdentifier === 'default') {
    return 'text-foreground'; // Default text color for default background
  }
  // Map pastel identifiers to their contrasting text utility classes
  const contrastMap: Record<string, string> = {
    pink: 'text-on-pastel-pink',
    green: 'text-on-pastel-green',
    yellow: 'text-on-pastel-yellow',
    purple: 'text-on-pastel-purple',
    blue: 'text-on-pastel-blue',
    orange: 'text-on-pastel-orange',
    gray: 'text-on-pastel-gray',
    teal: 'text-on-pastel-teal',
    lime: 'text-on-pastel-lime',
    rose: 'text-on-pastel-rose',
  };
  return contrastMap[colorIdentifier] || 'text-foreground'; // Fallback
};


export function SentenceGroupsDisplay({
  groups,
  onCreateGroup,
  onUpdateGroup,
  onDeleteGroup,
  onRemoveHistoryItemFromGroup,
  onViewHistoryItemDetails
}: SentenceGroupsDisplayProps) {
  const [isCreateGroupDialogOpen, setIsCreateGroupDialogOpen] = useState(false);
  const [isEditGroupDialogOpen, setIsEditGroupDialogOpen] = useState(false);
  const [groupToEdit, setGroupToEdit] = useState<SentenceGroup | null>(null);

  const handleCreateGroup = async (name: string, colorIdentifier: string) => {
    await onCreateGroup(name, colorIdentifier);
    setIsCreateGroupDialogOpen(false);
  };

  const handleOpenEditDialog = (group: SentenceGroup) => {
    setGroupToEdit(group);
    setIsEditGroupDialogOpen(true);
  };

  const getGroupBgClass = (colorIdentifier?: string): string => {
    const color = availablePastelColors.find(c => c.identifier === colorIdentifier);
    return color ? color.bgClass : 'bg-card';
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
              {groups.map((group) => {
                const historyItemsCount = Array.isArray(group.historyItems) ? group.historyItems.length : 0;
                const historyItemsText = historyItemsCount === 1 ? 'análisis' : 'análisis';
                const groupBgClass = getGroupBgClass(group.colorIdentifier);
                const isDefaultColor = !group.colorIdentifier || group.colorIdentifier === 'default';
                const contrastTextClass = getContrastTextClass(group.colorIdentifier);

                return (
                  <AccordionItem
                    key={group.id}
                    value={group.id}
                    className={cn(
                        "border-0 rounded-md shadow-sm data-[state=open]:shadow-lg overflow-hidden",
                        isDefaultColor ? 'bg-card border' : groupBgClass
                    )}
                  >
                     <div className={cn(
                        "flex items-center justify-between p-3 transition-colors",
                        isDefaultColor ? 'hover:bg-muted/40' : 'hover:brightness-95',
                      )}>
                      <AccordionTrigger className={cn(
                        "flex-1 text-lg font-semibold text-left hover:no-underline p-0 focus-visible:ring-1 focus-visible:ring-ring",
                         contrastTextClass
                        )}>
                           {group.name} ({historyItemsCount} {historyItemsText})
                      </AccordionTrigger>
                      <div className="flex items-center gap-1 ml-3 shrink-0">
                        <Button
                            variant="ghost"
                            size="icon"
                            className={cn(
                                "p-1.5 h-auto w-auto",
                                isDefaultColor ? "text-foreground/70 hover:text-foreground" : `${contrastTextClass} btn-on-pastel`
                            )}
                            onClick={(e) => { e.stopPropagation(); handleOpenEditDialog(group); }}
                            aria-label={`Editar grupo ${group.name}`}
                        >
                            <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                           className={cn(
                                "p-1.5 h-auto w-auto",
                                isDefaultColor ? "text-destructive hover:text-destructive/80 hover:bg-destructive/10" : `${contrastTextClass} btn-on-pastel-destructive`
                            )}
                          onClick={(e) => { e.stopPropagation(); onDeleteGroup(group.id); }}
                          aria-label={`Eliminar grupo ${group.name}`}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    <AccordionContent className={cn(
                        "p-4 border-t",
                        isDefaultColor ? 'border-border bg-card/30' : 'border-black/10 dark:border-white/10 bg-black/5 dark:bg-white/5'
                        )}>
                      {(historyItemsCount === 0) ? (
                        <p className={cn("text-sm", isDefaultColor ? "text-muted-foreground" : `${contrastTextClass} opacity-80`)}>Este grupo está vacío.</p>
                      ) : (
                        <ul className="space-y-2">
                          {group.historyItems.map((item) => (
                            <li key={item.id} className={cn(
                                "flex justify-between items-center p-2 rounded-md",
                                isDefaultColor ? "hover:bg-muted/20" : "hover:bg-black/10 dark:hover:bg-white/10"
                                )}>
                              <div className="flex items-center gap-2 flex-grow overflow-hidden">
                                <FileText className={cn("h-4 w-4 shrink-0", isDefaultColor ? "text-primary/80" : `${contrastTextClass} opacity-80`)} />
                                <p className={cn("text-sm truncate", isDefaultColor ? "text-foreground" : contrastTextClass)} title={item.originalSentence}>
                                  {item.originalSentence}
                                </p>
                              </div>
                              <div className="flex gap-1 shrink-0 ml-2">
                                {onViewHistoryItemDetails && (
                                  <Button
                                    variant={isDefaultColor ? "outline" : "ghost"}
                                    size="icon"
                                    className={cn("h-7 w-7", !isDefaultColor && `${contrastTextClass} border-current/30 btn-on-pastel`)}
                                    onClick={() => onViewHistoryItemDetails(item)}
                                    aria-label={`Ver detalles de "${item.originalSentence}"`}
                                  >
                                    <Eye className="h-3 w-3" />
                                  </Button>
                                )}
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className={cn(
                                    "h-7 w-7",
                                    isDefaultColor ? "text-destructive hover:text-destructive/80 hover:bg-destructive/10" : `${contrastTextClass} opacity-80 hover:opacity-100 btn-on-pastel-destructive`
                                   )}
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
                );
              })}
            </Accordion>
          )}
        </CardContent>
      </Card>

      <CreateGroupDialog
        isOpen={isCreateGroupDialogOpen}
        onClose={() => setIsCreateGroupDialogOpen(false)}
        onCreateGroup={handleCreateGroup}
      />
      <EditGroupDialog
        isOpen={isEditGroupDialogOpen}
        onClose={() => setIsEditGroupDialogOpen(false)}
        groupToEdit={groupToEdit}
        onUpdateGroup={onUpdateGroup}
      />
    </>
  );
}
