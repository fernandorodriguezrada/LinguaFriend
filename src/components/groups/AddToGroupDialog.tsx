
'use client';

import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, SelectGroup, SelectLabel } from "@/components/ui/select";
import type { SentenceGroup } from '@/lib/types';

interface AddToGroupDialogProps {
  isOpen: boolean;
  onClose: () => void;
  groups: SentenceGroup[];
  onCreateGroup: (name: string) => Promise<void>; // Modified to fit createGroup hook
  onSelectGroup: (groupId: string) => void;
  itemCount: number;
}

export function AddToGroupDialog({
  isOpen,
  onClose,
  groups,
  onCreateGroup,
  onSelectGroup,
  itemCount,
}: AddToGroupDialogProps) {
  const [selectedGroupId, setSelectedGroupId] = useState<string>('');
  const [newGroupName, setNewGroupName] = useState('');
  const [showNewGroupInput, setShowNewGroupInput] = useState(false);

  const handleCreateNewGroup = async () => {
    if (newGroupName.trim()) {
      await onCreateGroup(newGroupName.trim()); // This will update groups via the hook
      // The new group might not be immediately available in `groups` prop here
      // A better UX might be to select it automatically or refresh `groups`
      // For now, user might need to re-open to select it or we select it by name if possible.
      // Or, the `onCreateGroup` in parent could return the new group ID.
      // For simplicity:
      setNewGroupName('');
      setShowNewGroupInput(false);
      // onClose(); // Or rely on onSelectGroup to close.
    }
  };

  const handleSubmit = () => {
    if (selectedGroupId) {
      onSelectGroup(selectedGroupId);
      onClose();
    } else if (showNewGroupInput && newGroupName.trim()) {
        // This path is a bit redundant if handleCreateNewGroup is called directly
        // onCreateGroup should ideally handle the selection or update parent state
    }
  };
  
  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => { if (!open) onClose(); }}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Añadir {itemCount} Elemento(s) a un Grupo</DialogTitle>
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
                  placeholder="Ej: Vocabulario Clave"
                  autoFocus
                />
                <Button onClick={handleCreateNewGroup} disabled={!newGroupName.trim()}>Crear</Button>
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
            Añadir a Grupo
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
