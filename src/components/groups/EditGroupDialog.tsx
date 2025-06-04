
'use client';

import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { availablePastelColors, type PastelColor, type SentenceGroup } from '@/lib/types';
import { cn } from '@/lib/utils';
import { Check } from 'lucide-react';

interface EditGroupDialogProps {
  isOpen: boolean;
  onClose: () => void;
  groupToEdit: SentenceGroup | null;
  onUpdateGroup: (groupId: string, updates: { name?: string; colorIdentifier?: string }) => void;
}

export function EditGroupDialog({ isOpen, onClose, groupToEdit, onUpdateGroup }: EditGroupDialogProps) {
  const [groupName, setGroupName] = useState('');
  const [selectedColorIdentifier, setSelectedColorIdentifier] = useState<string>(availablePastelColors[0].identifier);

  useEffect(() => {
    if (groupToEdit) {
      setGroupName(groupToEdit.name);
      setSelectedColorIdentifier(groupToEdit.colorIdentifier || availablePastelColors[0].identifier);
    }
  }, [groupToEdit]);

  const handleSubmit = () => {
    if (groupToEdit && groupName.trim()) {
      onUpdateGroup(groupToEdit.id, { name: groupName.trim(), colorIdentifier: selectedColorIdentifier });
      onClose();
    }
  };

  if (!isOpen || !groupToEdit) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => { if (!open) onClose(); }}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Editar Grupo</DialogTitle>
          <DialogDescription>
            Actualiza el nombre y el color de tu grupo.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="edit-group-name" className="text-right">
              Nombre
            </Label>
            <Input
              id="edit-group-name"
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
              className="col-span-3"
              autoFocus
            />
          </div>
          <div className="grid grid-cols-4 items-start gap-4">
            <Label className="text-right pt-2">Color</Label>
            <ScrollArea className="col-span-3 h-[100px] rounded-md border p-2">
              <div className="grid grid-cols-4 gap-2">
                {availablePastelColors.map((color: PastelColor) => (
                  <Button
                    key={color.identifier}
                    variant="outline"
                    className={cn(
                      "h-8 w-8 p-0 rounded-full flex items-center justify-center",
                      color.bgClass,
                      selectedColorIdentifier === color.identifier ? 'ring-2 ring-ring ring-offset-2' : ''
                    )}
                    onClick={() => setSelectedColorIdentifier(color.identifier)}
                    aria-label={color.name}
                  >
                     {selectedColorIdentifier === color.identifier && <Check className={cn("h-4 w-4", color.identifier === 'default' ? 'text-foreground' : 'text-white mix-blend-difference')} />}
                  </Button>
                ))}
              </div>
            </ScrollArea>
          </div>
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button type="button" variant="outline">Cancelar</Button>
          </DialogClose>
          <Button type="button" onClick={handleSubmit} disabled={!groupName.trim()}>Guardar Cambios</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

