import { Badge } from "@/components/ui/badge";

export interface ContextCardData {
  id: string;
  contextType: string;
  title?: string;
  content?: string;
  mediaUrl?: string;
  tableData?: { headers: string[]; rows: string[][] };
  wordBank?: string[];
}

const TYPE_ICONS: Record<string, string> = {
  passage: "\uD83D\uDCC4",
  diagram: "\uD83D\uDDBC\uFE0F",
  table: "\uD83D\uDCCA",
  case_study: "\uD83D\uDCCB",
  code_snippet: "\uD83D\uDCBB",
  word_bank: "\uD83D\uDCD6",
  equation_set: "\uD83E\uDDEE",
  map: "\uD83D\uDDFA\uFE0F",
  graph: "\uD83D\uDCC8",
};

export default function ContextCard({ context }: { context: ContextCardData }) {
  const icon = TYPE_ICONS[context.contextType] ?? "\uD83D\uDCC4";

  return (
    <div className="rounded-lg border border-border bg-card p-4">
      <div className="mb-2 flex items-center gap-2">
        <span className="text-lg">{icon}</span>
        <span
          className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground"
          style={{ fontFamily: "var(--font-body)" }}
        >
          {context.contextType.replace("_", " ")} context
        </span>
        <Badge variant="neutral" className="ml-auto text-[9px]">
          id: {context.id}
        </Badge>
      </div>
      {context.title && (
        <p
          className="mb-2 text-[12px] font-medium italic text-muted-foreground"
          style={{ fontFamily: "var(--font-body)" }}
        >
          {context.title}
        </p>
      )}
      {context.content && (
        <div className="rounded-md bg-bg-raised p-3">
          <p
            className="text-[12px] leading-relaxed"
            style={{ fontFamily: "var(--font-body)" }}
          >
            {context.content}
          </p>
        </div>
      )}
      {context.contextType === "diagram" && context.mediaUrl && (
        <div className="flex h-[120px] items-center justify-center rounded-md border-2 border-dashed border-border bg-bg-raised">
          <div className="text-center">
            <div className="text-2xl">{"\uD83D\uDDBC\uFE0F"}</div>
            <p
              className="mt-1 text-[10px] text-muted-foreground"
              style={{ fontFamily: "var(--font-body)" }}
            >
              Diagram: {context.mediaUrl}
            </p>
          </div>
        </div>
      )}
      {context.tableData && (
        <div className="overflow-x-auto rounded-md border border-border">
          <table
            className="w-full text-[11px]"
            style={{ fontFamily: "var(--font-body)" }}
          >
            <thead>
              <tr className="bg-bg-raised">
                {context.tableData.headers.map((h) => (
                  <th
                    key={h}
                    className="border-b border-border px-3 py-2 text-left font-bold"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {context.tableData.rows.map((row, ri) => (
                <tr
                  key={ri}
                  className="border-b border-border/30 last:border-b-0"
                >
                  {row.map((cell, ci) => (
                    <td
                      key={ci}
                      className={
                        "px-3 py-1.5" + (ci === 0 ? " font-medium" : "")
                      }
                    >
                      {cell}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {context.wordBank && (
        <div className="flex flex-wrap gap-1.5">
          {context.wordBank.map((w) => (
            <span
              key={w}
              className="rounded border border-border bg-bg-raised px-2 py-0.5 text-[11px]"
            >
              {w}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
