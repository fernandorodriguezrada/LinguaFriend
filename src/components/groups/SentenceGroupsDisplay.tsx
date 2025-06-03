
'use client';

import React, { useState } from 'react';
import type { SentenceGroup, WordAnalysisDetail } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Badge } from '@/components/ui/badge';
import { CreateGroupDialog } from './CreateGroupDialog';
import { FolderKanban, PlusCircle, Trash2, FileText } from 'lucide-react';

interface SentenceGroupsDisplayProps {
  groups: SentenceGroup[];
  onCreateGroup: (name: string) => Promise<SentenceGroup | null>;
  onDeleteGroup: (groupId: string) => void;
  onRemoveWordFromGroup: (groupId: string, wordIdentifier: string) => void; // word + role
}

export function SentenceGroupsDisplay({ 
    groups, 
    onCreateGroup, 
    onDeleteGroup, 
    onRemoveWordFromGroup 
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
              Grupos de Palabras/Frases
            </CardTitle>
            <CardDescription>
              Organiza y revisa palabras o frases guardadas.
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
                      {/* 
                        Applied p-0 to remove default AccordionTrigger padding as parent div handles it.
                        text-left to ensure title aligns left.
                        hover:no-underline to override default.
                        flex-1 allows trigger to take available space.
                        Chevron is still managed by AccordionTrigger.
                      */}
                      {group.name} ({group.words.length} {group.words.length === 1 ? 'elemento' : 'elementos'})
                    </AccordionTrigger>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-destructive hover:text-destructive/80 hover:bg-destructive/10 ml-3 shrink-0 p-1.5 h-auto"
                      onClick={() => onDeleteGroup(group.id)}
                      aria-label={`Eliminar grupo ${group.name}`}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                  <AccordionContent className="p-4 border-t">
                    {group.words.length === 0 ? (
                      <p className="text-sm text-muted-foreground">Este grupo está vacío.</p>
                    ) : (
                      <ul className="space-y-2">
                        {group.words.map((word, index) => (
                          <li key={index} className="flex justify-between items-center p-2 rounded-md hover:bg-muted/20">
                            <div className="flex items-center gap-2">
                                <FileText className="h-4 w-4 text-primary/80 shrink-0" />
                                <div>
                                    <span className="font-medium">{word.word}</span>
                                    <span className="text-xs text-muted-foreground ml-2">({word.role})</span>
                                    <p className="text-xs text-muted-foreground truncate max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg">{word.definition}</p>
                                </div>
                            </div>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="text-destructive hover:text-destructive/80 hover:bg-destructive/10 h-7 w-7"
                              onClick={() => onRemoveWordFromGroup(group.id, word.word + word.role)}
                              aria-label={`Eliminar ${word.word} del grupo`}
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
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
