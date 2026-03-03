import type { Lesson } from "@/types/course";

export function transformQuizBlocks(lesson: Lesson): Lesson {
  if (!lesson.contentBlocks) return lesson;
  return {
    ...lesson,
    contentBlocks: lesson.contentBlocks.map((block) => {
      if (block.data.type !== "quiz" || !block.data.responseConfig)
        return block;

      const rc = block.data.responseConfig as unknown as Record<
        string,
        unknown
      >;

      if (typeof rc.responseConfigJson === "string") {
        try {
          return {
            ...block,
            data: {
              ...block.data,
              responseConfig: JSON.parse(rc.responseConfigJson),
            },
          };
        } catch {
          return block;
        }
      }

      if (
        Array.isArray(rc.options) &&
        rc.options.length > 0 &&
        typeof rc.options[0] === "string"
      ) {
        const opts = rc.options as string[];
        const correctAnswer = rc.correctAnswer as number | undefined;
        const correctAnswers = rc.correctAnswers as number[] | undefined;
        const correctSet = new Set(
          correctAnswers ?? (correctAnswer != null ? [correctAnswer] : []),
        );
        return {
          ...block,
          data: {
            ...block.data,
            responseConfig: {
              options: opts.map((text, i) => ({
                label: String.fromCharCode(65 + i),
                text,
                is_correct: correctSet.has(i),
              })),
            },
          },
        };
      }

      return block;
    }),
  };
}
