'use client';

import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { QuizBlockData } from '@/types/content';
import type { QuestionType } from '@/types/questions';

interface QuizBlockEditorProps {
  data: QuizBlockData;
  onChange: (data: QuizBlockData) => void;
}

const QUESTION_TYPE_OPTIONS: { label: string; value: QuestionType }[] = [
  { label: 'Multiple Choice', value: 'mcq' },
  { label: 'Multi-Select', value: 'multi_select_mcq' },
  { label: 'True / False', value: 'true_false' },
  { label: 'Short Answer', value: 'short_answer' },
  { label: 'Essay', value: 'essay' },
  { label: 'Fill in the Blank', value: 'fill_blank' },
  { label: 'Cloze', value: 'cloze' },
  { label: 'Matching', value: 'matching' },
  { label: 'Ordering', value: 'ordering' },
  { label: 'Theory', value: 'theory' },
  { label: 'Diagram Label', value: 'diagram_label' },
  { label: 'Calculation', value: 'calculation' },
  { label: 'Assertion & Reason', value: 'assertion_reason' },
  { label: 'Matrix Matching', value: 'matrix_matching' },
  { label: 'Numeric Entry', value: 'numeric_entry' },
];

export function QuizBlockEditor({ data, onChange }: QuizBlockEditorProps) {
  function handleTypeChange(questionType: string) {
    onChange({ ...data, questionType: questionType as QuestionType });
  }

  function handleContentChange(content: string) {
    onChange({ ...data, content });
  }

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label className="text-muted-foreground">Question Type</Label>
        <Select value={data.questionType} onValueChange={handleTypeChange}>
          <SelectTrigger>
            <SelectValue placeholder="Select question type" />
          </SelectTrigger>
          <SelectContent>
            {QUESTION_TYPE_OPTIONS.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label className="text-muted-foreground">Question Content</Label>
        <Textarea
          value={data.content}
          onChange={(e) => handleContentChange(e.target.value)}
          placeholder="Enter the question text..."
          rows={4}
        />
      </div>
    </div>
  );
}
