import { pgTable, text, timestamp } from 'drizzle-orm/pg-core';
import { user } from './auth';

export const learnerProfile = pgTable('learner_profile', {
  id: text('id').primaryKey(),
  userId: text('user_id')
    .notNull()
    .unique()
    .references(() => user.id),
  displayName: text('display_name'),
  preferredLocale: text('preferred_locale').notNull().default('en'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});
