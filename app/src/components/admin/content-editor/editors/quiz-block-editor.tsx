"use client";

import { useTranslations } from "next-intl";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  McqBuilder,
  MultiSelectMcqBuilder,
  TrueFalseBuilder,
  FillBlankBuilder,
  ClozeBuilder,
  MatchingBuilder,
  MatrixMatchingBuilder,
  OrderingBuilder,
  DiagramLabelBuilder,
  CalculationBuilder,
  NumericEntryBuilder,
  AssertionReasonBuilder,
} from "@/components/admin/question-builders";
import type { QuizBlockData } from "@/types/content";
import type {
  QuestionType,
  ResponseConfig,
  McqConfig,
  MultiSelectMcqConfig,
  TrueFalseConfig,
  FillBlankConfig,
  ClozeConfig,
  MatchingConfig,
  MatrixMatchingConfig,
  OrderingConfig,
  DiagramLabelConfig,
  CalculationConfig,
  NumericEntryConfig,
  AssertionReasonConfig,
} from "@/types/questions";

interface QuizBlockEditorProps {
  data: QuizBlockData;
  onChange: (data: QuizBlockData) => void;
}

function ResponseConfigEditor({
  questionType,
  config,
  onChange,
}: {
  questionType: QuestionType;
  config: ResponseConfig;
  onChange: (config: ResponseConfig) => void;
}) {
  switch (questionType) {
    case "mcq":
      return (
        <McqBuilder value={config as McqConfig | null} onChange={onChange} />
      );
    case "multi_select_mcq":
      return (
        <MultiSelectMcqBuilder
          value={config as MultiSelectMcqConfig | null}
          onChange={onChange}
        />
      );
    case "true_false":
      return (
        <TrueFalseBuilder
          value={config as TrueFalseConfig | null}
          onChange={onChange}
        />
      );
    case "fill_blank":
      return (
        <FillBlankBuilder
          value={config as FillBlankConfig | null}
          onChange={onChange}
        />
      );
    case "cloze":
      return (
        <ClozeBuilder
          value={config as ClozeConfig | null}
          onChange={onChange}
        />
      );
    case "matching":
      return (
        <MatchingBuilder
          value={config as MatchingConfig | null}
          onChange={onChange}
        />
      );
    case "matrix_matching":
      return (
        <MatrixMatchingBuilder
          value={config as MatrixMatchingConfig | null}
          onChange={onChange}
        />
      );
    case "ordering":
      return (
        <OrderingBuilder
          value={config as OrderingConfig | null}
          onChange={onChange}
        />
      );
    case "diagram_label":
      return (
        <DiagramLabelBuilder
          value={config as DiagramLabelConfig | null}
          onChange={onChange}
        />
      );
    case "calculation":
      return (
        <CalculationBuilder
          value={config as CalculationConfig | null}
          onChange={onChange}
        />
      );
    case "numeric_entry":
      return (
        <NumericEntryBuilder
          value={config as NumericEntryConfig | null}
          onChange={onChange}
        />
      );
    case "assertion_reason":
      return (
        <AssertionReasonBuilder
          value={config as AssertionReasonConfig | null}
          onChange={onChange}
        />
      );
    default:
      return null;
  }
}

export function QuizBlockEditor({ data, onChange }: QuizBlockEditorProps) {
  const t = useTranslations("AdminContent");

  const questionTypeOptions: { label: string; value: QuestionType }[] = [
    { label: t("qtMultipleChoice"), value: "mcq" },
    { label: t("qtMultiSelect"), value: "multi_select_mcq" },
    { label: t("qtTrueFalse"), value: "true_false" },
    { label: t("qtFillBlank"), value: "fill_blank" },
    { label: t("qtCloze"), value: "cloze" },
    { label: t("qtMatching"), value: "matching" },
    { label: t("qtOrdering"), value: "ordering" },
    { label: t("qtDiagramLabel"), value: "diagram_label" },
    { label: t("qtCalculation"), value: "calculation" },
    { label: t("qtAssertionReason"), value: "assertion_reason" },
    { label: t("qtMatrixMatching"), value: "matrix_matching" },
    { label: t("qtNumericEntry"), value: "numeric_entry" },
  ];

  function handleTypeChange(questionType: string) {
    onChange({
      ...data,
      questionType: questionType as QuestionType,
      responseConfig: null,
    });
  }

  function handleContentChange(content: string) {
    onChange({ ...data, content });
  }

  function handleConfigChange(responseConfig: ResponseConfig) {
    onChange({ ...data, responseConfig });
  }

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label className="text-muted-foreground">
          {t("fieldQuestionType")}
        </Label>
        <Select value={data.questionType} onValueChange={handleTypeChange}>
          <SelectTrigger>
            <SelectValue placeholder={t("selectQuestionType")} />
          </SelectTrigger>
          <SelectContent>
            {questionTypeOptions.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label className="text-muted-foreground">
          {t("fieldQuestionContent")}
        </Label>
        <Textarea
          value={data.content}
          onChange={(e) => handleContentChange(e.target.value)}
          placeholder={t("questionPlaceholder")}
          rows={4}
        />
      </div>

      <ResponseConfigEditor
        questionType={data.questionType}
        config={data.responseConfig}
        onChange={handleConfigChange}
      />
    </div>
  );
}
