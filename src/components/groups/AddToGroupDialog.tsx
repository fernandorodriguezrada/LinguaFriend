
'use client';

import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, SelectGroup, SelectLabel } from "@/components/ui/select";
import type { SentenceGroup, AnalysisHistoryItem } from '@/lib/types'; // AnalysisHistoryItem not directly used here but for context of what's being added

interface AddToGroupDialogProps {
  isOpen: boolean;
  onClose: () => void;
  groups: SentenceGroup[];
  onCreateGroup: (name: string) => Promise<void>; // Parent will handle adding items after group creation
  onSelectGroup: (groupId: string) => void; // Parent will handle adding items to selected group
  itemCount: number;
}

export function AddToGroupDialog({
  isOpen,
  onClose,
  groups,
  onCreateGroup, // This will now just create the group. Parent handles adding items.
  onSelectGroup,  // This will now pass groupId. Parent handles adding items.
  itemCount,
}: AddToGroupDialogProps) {
  const [selectedGroupId, setSelectedGroupId] = useState<string>('');
  const [newGroupName, setNewGroupName] = useState('');
  const [showNewGroupInput, setShowNewGroupInput] = useState(false);

  const handleCreateNewGroupAndProceed = async () => {
    if (newGroupName.trim()) {
      // onCreateGroup should ideally signal parent to create group and then add items to it.
      // For this dialog, its responsibility is to either call onSelectGroup with an existing ID
      // or call onCreateGroup which then triggers adding to the *newly created* group in parent.
      await onCreateGroup(newGroupName.trim()); // Parent will create group AND add items.
      // The parent component's `onCreateGroup` callback (like `handleCreateAndAdd` in HistoryModal)
      // is responsible for taking the name, creating the group, and then adding the selected items.
      setNewGroupName('');
      setShowNewGroupInput(false);
      onClose(); // Close dialog, parent has handled adding.
    }
  };

  const handleSubmit = () => {
    if (selectedGroupId) {
      onSelectGroup(selectedGroupId); // Parent will use this groupId to add items.
      onClose();
    } else if (showNewGroupInput && newGroupName.trim()) {
        handleCreateNewGroupAndProceed(); // Use the combined function
    }
  };
  
  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => { if (!open) onClose(); }}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Añadir {itemCount} Análisis a un Grupo</DialogTitle>
          <DialogDescription>
            Selecciona un grupo existente o crea uno nuevo.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          {!showNewGroupInput && (
            <>
              <Label htmlFor="group-select">Seleccionar Grupo Existente</Label>
              <Select onValueChange={setSelectedGroupId} defaultValue={selectedGroupId}>
                <SelectTrigger id="group-select">
                  <SelectValue placeholder="Elige un grupo..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>Grupos</SelectLabel>
                    {groups.length > 0 ? (
                      groups.map(group => (
                        <SelectItem key={group.id} value={group.id}>{group.name}</SelectItem>
                      ))
                    ) : (
                      <SelectItem value="no-groups" disabled>No hay grupos creados</SelectItem>
                    )}
                  </SelectGroup>
                </SelectContent>
              </Select>
              <Button variant="link" onClick={() => setShowNewGroupInput(true)} className="p-0 h-auto">
                O crear un nuevo grupo...
              </Button>
            </>
          )}

          {showNewGroupInput && (
            <div className="space-y-2">
              <Label htmlFor="new-group-name">Nombre del Nuevo Grupo</Label>
              <div className="flex gap-2">
                <Input
                  id="new-group-name"
                  value={newGroupName}
                  onChange={(e) => setNewGroupName(e.target.value)}
                  placeholder="Ej: Análisis Importantes"
                  autoFocus
                />
                {/* Button to trigger creation moved to DialogFooter for unified action */}
              </div>
              <Button variant="link" onClick={() => { setShowNewGroupInput(false); setNewGroupName('');}} className="p-0 h-auto text-sm">
                Cancelar creación
              </Button>
            </div>
          )}
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button type="button" variant="outline">Cancelar</Button>
          </DialogClose>
          <Button 
            type="button" 
            onClick={handleSubmit} 
            disabled={!selectedGroupId && (!showNewGroupInput || !newGroupName.trim())}
          >
            {showNewGroupInput ? 'Crear y Añadir' : 'Añadir a Grupo'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
