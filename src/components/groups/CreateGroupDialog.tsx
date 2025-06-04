
'use client';

import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { availablePastelColors, type PastelColor } from '@/lib/types';
import { cn } from '@/lib/utils';
import { Check } from 'lucide-react';

interface CreateGroupDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateGroup: (name: string, colorIdentifier: string) => void;
}

export function CreateGroupDialog({ isOpen, onClose, onCreateGroup }: CreateGroupDialogProps) {
  const [groupName, setGroupName] = useState('');
  const [selectedColorIdentifier, setSelectedColorIdentifier] = useState<string>(availablePastelColors[0].identifier);

  const handleSubmit = () => {
    if (groupName.trim()) {
      onCreateGroup(groupName.trim(), selectedColorIdentifier);
      setGroupName('');
      setSelectedColorIdentifier(availablePastelColors[0].identifier);
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => { if (!open) onClose(); }}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Crear Nuevo Grupo</DialogTitle>
          <DialogDescription>
            Dale un nombre y elige un color para tu nuevo grupo.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="group-name" className="text-right">
              Nombre
            </Label>
            <Input
              id="group-name"
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
              className="col-span-3"
              placeholder="Ej: Verbos Irregulares"
              autoFocus
            />
          </div>
          <div className="grid grid-cols-4 items-start gap-4">
            <Label className="text-right pt-2">Color</Label>
            <ScrollArea className="col-span-3 h-[100px] rounded-md border">
              <div className="grid grid-cols-4 gap-2 p-2"> {/* Added p-2 here */}
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
          <Button type="button" onClick={handleSubmit} disabled={!groupName.trim()}>Crear Grupo</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
