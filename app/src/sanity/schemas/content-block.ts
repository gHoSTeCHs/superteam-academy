import { defineType, defineField } from "sanity";

export const contentBlock = defineType({
  name: "contentBlock",
  title: "Content Block",
  type: "object",
  fields: [
    defineField({
      name: "blockType",
      title: "Block Type",
      type: "string",
      options: {
        list: [
          "text",
          "code_example",
          "code_challenge",
          "quiz",
          "callout",
          "image",
          "video_embed",
        ],
      },
      validation: (r) => r.required(),
    }),
    defineField({
      name: "textContent",
      title: "Text Content",
      type: "array",
      of: [{ type: "block" }],
      hidden: ({ parent }) => parent?.blockType !== "text",
    }),
    defineField({
      name: "language",
      title: "Language",
      type: "string",
      hidden: ({ parent }) =>
        parent?.blockType !== "code_example" &&
        parent?.blockType !== "code_challenge",
    }),
    defineField({
      name: "code",
      title: "Code",
      type: "text",
      hidden: ({ parent }) => parent?.blockType !== "code_example",
    }),
    defineField({
      name: "filename",
      title: "Filename",
      type: "string",
      hidden: ({ parent }) => parent?.blockType !== "code_example",
    }),
    defineField({
      name: "starterCode",
      title: "Starter Code",
      type: "text",
      hidden: ({ parent }) => parent?.blockType !== "code_challenge",
    }),
    defineField({
      name: "solutionCode",
      title: "Solution Code",
      type: "text",
      hidden: ({ parent }) => parent?.blockType !== "code_challenge",
    }),
    defineField({
      name: "hints",
      title: "Hints",
      type: "array",
      of: [{ type: "string" }],
      hidden: ({ parent }) => parent?.blockType !== "code_challenge",
    }),
    defineField({
      name: "testCases",
      title: "Test Cases",
      type: "array",
      of: [
        {
          type: "object",
          fields: [
            { name: "name", title: "Name", type: "string" },
            { name: "input", title: "Input", type: "text" },
            { name: "expectedOutput", title: "Expected Output", type: "text" },
            { name: "assertionCode", title: "Assertion Code", type: "text" },
          ],
        },
      ],
      hidden: ({ parent }) => parent?.blockType !== "code_challenge",
    }),
    defineField({
      name: "validationRules",
      title: "Validation Rules",
      type: "array",
      of: [
        {
          type: "object",
          fields: [
            { name: "pattern", title: "Pattern", type: "string" },
            { name: "message", title: "Message", type: "string" },
          ],
        },
      ],
      hidden: ({ parent }) => parent?.blockType !== "code_challenge",
    }),
    defineField({
      name: "maxAttempts",
      title: "Max Attempts",
      type: "number",
      hidden: ({ parent }) => parent?.blockType !== "code_challenge",
    }),
    defineField({
      name: "quizQuestion",
      title: "Quiz Question",
      type: "text",
      hidden: ({ parent }) => parent?.blockType !== "quiz",
    }),
    defineField({
      name: "quizOptions",
      title: "Quiz Options",
      type: "array",
      of: [{ type: "string" }],
      hidden: ({ parent }) => parent?.blockType !== "quiz",
    }),
    defineField({
      name: "correctAnswer",
      title: "Correct Answer Index",
      type: "number",
      hidden: ({ parent }) => parent?.blockType !== "quiz",
    }),
    defineField({
      name: "correctAnswers",
      title: "Correct Answer Indices (multi-select)",
      type: "array",
      of: [{ type: "number" }],
      hidden: ({ parent }) => parent?.blockType !== "quiz",
    }),
    defineField({
      name: "responseConfigJson",
      title: "Response Config (JSON)",
      type: "text",
      hidden: ({ parent }) => parent?.blockType !== "quiz",
    }),
    defineField({
      name: "questionType",
      title: "Question Type",
      type: "string",
      options: {
        list: [
          "mcq",
          "multi_select_mcq",
          "true_false",
          "fill_blank",
          "cloze",
          "matching",
          "ordering",
          "diagram_label",
          "calculation",
          "assertion_reason",
          "matrix_matching",
          "numeric_entry",
        ],
      },
      hidden: ({ parent }) => parent?.blockType !== "quiz",
    }),
    defineField({
      name: "calloutType",
      title: "Callout Type",
      type: "string",
      options: { list: ["info", "warning", "tip"] },
      hidden: ({ parent }) => parent?.blockType !== "callout",
    }),
    defineField({
      name: "calloutTitle",
      title: "Callout Title",
      type: "string",
      hidden: ({ parent }) => parent?.blockType !== "callout",
    }),
    defineField({
      name: "calloutContent",
      title: "Callout Content",
      type: "text",
      hidden: ({ parent }) => parent?.blockType !== "callout",
    }),
    defineField({
      name: "image",
      title: "Image",
      type: "image",
      options: { hotspot: true },
      hidden: ({ parent }) => parent?.blockType !== "image",
    }),
    defineField({
      name: "alt",
      title: "Alt Text",
      type: "string",
      hidden: ({ parent }) => parent?.blockType !== "image",
    }),
    defineField({
      name: "caption",
      title: "Caption",
      type: "string",
      hidden: ({ parent }) => parent?.blockType !== "image",
    }),
    defineField({
      name: "videoUrl",
      title: "Video URL",
      type: "url",
      hidden: ({ parent }) => parent?.blockType !== "video_embed",
    }),
    defineField({
      name: "videoTitle",
      title: "Video Title",
      type: "string",
      hidden: ({ parent }) => parent?.blockType !== "video_embed",
    }),
  ],
  preview: {
    select: { blockType: "blockType" },
    prepare({ blockType }) {
      return { title: blockType || "Content Block" };
    },
  },
});
