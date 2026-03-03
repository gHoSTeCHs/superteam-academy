"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import type { Module, ModuleType } from "@/types/course";

interface AddModuleDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAdd: (module: Omit<Module, "id" | "sortOrder" | "lessons">) => void;
}

const INITIAL_STATE = {
  title: "",
  description: "",
  type: "" as ModuleType | "",
};

export function AddModuleDialog({
  open,
  onOpenChange,
  onAdd,
}: AddModuleDialogProps) {
  const [form, setForm] = useState(INITIAL_STATE);

  function resetForm() {
    setForm(INITIAL_STATE);
  }

  function handleOpenChange(next: boolean) {
    if (!next) resetForm();
    onOpenChange(next);
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!form.title.trim() || !form.type) return;

    onAdd({
      title: form.title.trim(),
      description: form.description.trim(),
      type: form.type as ModuleType,
    });

    resetForm();
    onOpenChange(false);
  }

  const isValid = form.title.trim().length > 0 && form.type !== "";

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="font-[family-name:var(--font-display)]">
            Add Module
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label className="text-muted-foreground">Title</Label>
            <Input
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="Module title"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-muted-foreground">Description</Label>
            <Textarea
              value={form.description}
              onChange={(e) =>
                setForm({ ...form, description: e.target.value })
              }
              placeholder="Brief description of this module"
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label className="text-muted-foreground">Type</Label>
            <Select
              value={form.type}
              onValueChange={(val: string) =>
                setForm({ ...form, type: val as ModuleType })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="text">Text</SelectItem>
                <SelectItem value="video">Video</SelectItem>
                <SelectItem value="assessment">Assessment</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="ghost"
              onClick={() => handleOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={!isValid}>
              Add Module
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
