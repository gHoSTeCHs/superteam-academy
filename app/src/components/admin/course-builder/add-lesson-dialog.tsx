"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import type { Lesson } from "@/types/course";

interface AddLessonDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAdd: (lesson: Omit<Lesson, "id" | "sortOrder">) => void;
}

const INITIAL_STATE = {
  title: "",
  xpReward: 10,
  estimatedMinutes: 5,
  difficulty: "" as Lesson["difficulty"] | "",
};

export function AddLessonDialog({
  open,
  onOpenChange,
  onAdd,
}: AddLessonDialogProps) {
  const t = useTranslations("AdminCourse");
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
      difficulty: form.difficulty as Lesson["difficulty"],
    });

    resetForm();
    onOpenChange(false);
  }

  const isValid = form.title.trim().length > 0 && form.difficulty !== "";

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="font-[family-name:var(--font-display)]">
            {t("addLessonDialogTitle")}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label className="text-muted-foreground">
              {t("lessonFieldTitle")}
            </Label>
            <Input
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder={t("lessonTitlePlaceholder")}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-muted-foreground">
                {t("lessonFieldXp")}
              </Label>
              <Input
                type="number"
                min={0}
                value={form.xpReward}
                onChange={(e) =>
                  setForm({
                    ...form,
                    xpReward: parseInt(e.target.value, 10) || 0,
                  })
                }
                placeholder="10"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-muted-foreground">
                {t("lessonFieldMinutes")}
              </Label>
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
            <Label className="text-muted-foreground">
              {t("lessonFieldDifficulty")}
            </Label>
            <Select
              value={form.difficulty}
              onValueChange={(val: string) =>
                setForm({ ...form, difficulty: val as Lesson["difficulty"] })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder={t("selectDifficulty")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="beginner">{t("diffBeginner")}</SelectItem>
                <SelectItem value="intermediate">
                  {t("diffIntermediate")}
                </SelectItem>
                <SelectItem value="advanced">{t("diffAdvanced")}</SelectItem>
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
              {t("addLesson")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
