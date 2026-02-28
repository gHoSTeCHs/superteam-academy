'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import type { Lesson } from '@/types/course';

interface AddLessonDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAdd: (lesson: Omit<Lesson, 'id' | 'sortOrder'>) => void;
}

const INITIAL_STATE = {
  title: '',
  xpReward: 10,
  estimatedMinutes: 5,
  difficulty: '' as Lesson['difficulty'] | '',
};

export function AddLessonDialog({ open, onOpenChange, onAdd }: AddLessonDialogProps) {
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
    if (!form.title.trim() || !form.difficulty) return;

    onAdd({
      title: form.title.trim(),
      xpReward: form.xpReward,
      estimatedMinutes: form.estimatedMinutes,
      difficulty: form.difficulty as Lesson['difficulty'],
    });

    resetForm();
    onOpenChange(false);
  }

  const isValid = form.title.trim().length > 0 && form.difficulty !== '';

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle
            className="font-[family-name:var(--font-display)]"
          >
            Add Lesson
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label className="text-muted-foreground">Title</Label>
            <Input
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="Lesson title"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-muted-foreground">XP Reward</Label>
              <Input
                type="number"
                min={0}
                value={form.xpReward}
                onChange={(e) =>
                  setForm({ ...form, xpReward: parseInt(e.target.value, 10) || 0 })
                }
                placeholder="10"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-muted-foreground">Est. Minutes</Label>
              <Input
                type="number"
                min={1}
                value={form.estimatedMinutes}
                onChange={(e) =>
                  setForm({
                    ...form,
                    estimatedMinutes: parseInt(e.target.value, 10) || 1,
                  })
                }
                placeholder="5"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-muted-foreground">Difficulty</Label>
            <Select
              value={form.difficulty}
              onValueChange={(val: string) =>
                setForm({ ...form, difficulty: val as Lesson['difficulty'] })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select difficulty" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="beginner">Beginner</SelectItem>
                <SelectItem value="intermediate">Intermediate</SelectItem>
                <SelectItem value="advanced">Advanced</SelectItem>
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
              Add Lesson
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
