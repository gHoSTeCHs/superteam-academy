import { Badge } from "@/components/ui/badge";

const QUESTION_TYPE_META: Record<
  string,
  {
    label: string;
    variant: "primary" | "danger" | "reward" | "neutral" | "solid";
  }
> = {
  mcq: { label: "MCQ", variant: "solid" },
  multi_select_mcq: { label: "multi-select", variant: "solid" },
  fill_blank: { label: "fill blank", variant: "reward" },
  cloze: { label: "cloze", variant: "reward" },
  matching: { label: "matching", variant: "reward" },
  ordering: { label: "ordering", variant: "reward" },
  true_false: { label: "true/false", variant: "danger" },
  diagram_label: { label: "diagram", variant: "danger" },
  calculation: { label: "calculation", variant: "danger" },
  assertion_reason: { label: "assert-reason", variant: "solid" },
  matrix_matching: { label: "matrix match", variant: "reward" },
  numeric_entry: { label: "numeric", variant: "danger" },
};

export { QUESTION_TYPE_META };

export default function QuestionTypeBadge({
  type,
  className,
}: {
  type: string;
  className?: string;
}) {
  const meta = QUESTION_TYPE_META[type];
  if (!meta) return null;
  return (
    <Badge
      variant={meta.variant}
      className={className ?? "text-[9px] px-[5px] py-0"}
    >
      {meta.label}
    </Badge>
  );
}
