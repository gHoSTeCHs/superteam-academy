export interface TiptapJSON {
  type: string;
  content?: TiptapJSON[];
  attrs?: Record<string, unknown>;
  marks?: { type: string; attrs?: Record<string, unknown> }[];
  text?: string;
}
