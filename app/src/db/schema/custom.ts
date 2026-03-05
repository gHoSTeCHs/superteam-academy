import { pgTable, text, timestamp, integer } from "drizzle-orm/pg-core";
import { user } from "./auth";

export const learnerProfile = pgTable("learner_profile", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .unique()
    .references(() => user.id, { onDelete: "cascade" }),
  displayName: text("display_name"),
  preferredLocale: text("preferred_locale").notNull().default("en"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const walletLink = pgTable("wallet_link", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  walletAddress: text("wallet_address").notNull().unique(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const userPreferences = pgTable("user_preferences", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .unique()
    .references(() => user.id, { onDelete: "cascade" }),
  locale: text("locale").notNull().default("en"),
  theme: text("theme").notNull().default("system"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const siwsNonce = pgTable("siws_nonce", {
  id: text("id").primaryKey(),
  nonce: text("nonce").notNull().unique(),
  walletAddress: text("wallet_address"),
  expiresAt: timestamp("expires_at").notNull(),
  usedAt: timestamp("used_at"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const enrollment = pgTable("enrollment", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  sanityCourseId: text("sanity_course_id").notNull(),
  walletAddress: text("wallet_address").notNull(),
  enrollmentPda: text("enrollment_pda").notNull(),
  enrolledAt: timestamp("enrolled_at").notNull().defaultNow(),
  closedAt: timestamp("closed_at"),
});

export const lessonCompletion = pgTable("lesson_completion", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  sanityCourseId: text("sanity_course_id").notNull(),
  lessonIndex: integer("lesson_index").notNull(),
  completedAt: timestamp("completed_at").notNull().defaultNow(),
  signature: text("signature").notNull(),
});

export const courseCompletion = pgTable("course_completion", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  sanityCourseId: text("sanity_course_id").notNull(),
  completedAt: timestamp("completed_at").notNull().defaultNow(),
  signature: text("signature").notNull(),
});

export const credentialIssuance = pgTable("credential_issuance", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  sanityCourseId: text("sanity_course_id").notNull(),
  credentialAsset: text("credential_asset").notNull(),
  issuedAt: timestamp("issued_at").notNull().defaultNow(),
  signature: text("signature").notNull(),
});
