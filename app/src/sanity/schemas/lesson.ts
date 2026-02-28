import { defineType, defineField } from 'sanity';

export const lesson = defineType({
  name: 'lesson',
  title: 'Lesson',
  type: 'document',
  fields: [
    defineField({ name: 'title', title: 'Title', type: 'string', validation: (r) => r.required() }),
    defineField({ name: 'slug', title: 'Slug', type: 'slug', options: { source: 'title' }, validation: (r) => r.required() }),
    defineField({ name: 'xp', title: 'XP Reward', type: 'number', initialValue: 0 }),
    defineField({ name: 'difficulty', title: 'Difficulty', type: 'string', options: { list: ['beginner', 'intermediate', 'advanced'] }, initialValue: 'beginner' }),
    defineField({ name: 'estimatedMinutes', title: 'Estimated Minutes', type: 'number', initialValue: 10 }),
    defineField({ name: 'contentBlocks', title: 'Content Blocks', type: 'array', of: [{ type: 'contentBlock' }] }),
  ],
});
