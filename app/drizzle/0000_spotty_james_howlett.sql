CREATE TABLE "account" (
	"id" text PRIMARY KEY NOT NULL,
	"account_id" text NOT NULL,
	"provider_id" text NOT NULL,
	"user_id" text NOT NULL,
	"access_token" text,
	"refresh_token" text,
	"id_token" text,
	"access_token_expires_at" timestamp,
	"refresh_token_expires_at" timestamp,
	"scope" text,
	"password" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "session" (
	"id" text PRIMARY KEY NOT NULL,
	"expires_at" timestamp NOT NULL,
	"token" text NOT NULL,
	"ip_address" text,
	"user_agent" text,
	"user_id" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "session_token_unique" UNIQUE("token")
);
--> statement-breakpoint
CREATE TABLE "user" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"email_verified" boolean DEFAULT false NOT NULL,
	"image" text,
	"role" text DEFAULT 'learner' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "user_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "verification" (
	"id" text PRIMARY KEY NOT NULL,
	"identifier" text NOT NULL,
	"value" text NOT NULL,
	"expires_at" timestamp NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "course_completion" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"sanity_course_id" text NOT NULL,
	"completed_at" timestamp DEFAULT now() NOT NULL,
	"signature" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "credential_issuance" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"sanity_course_id" text NOT NULL,
	"credential_asset" text NOT NULL,
	"issued_at" timestamp DEFAULT now() NOT NULL,
	"signature" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "enrollment" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"sanity_course_id" text NOT NULL,
	"wallet_address" text NOT NULL,
	"enrollment_pda" text NOT NULL,
	"enrolled_at" timestamp DEFAULT now() NOT NULL,
	"closed_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "learner_profile" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"display_name" text,
	"preferred_locale" text DEFAULT 'en' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "learner_profile_user_id_unique" UNIQUE("user_id")
);
--> statement-breakpoint
CREATE TABLE "lesson_completion" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"sanity_course_id" text NOT NULL,
	"lesson_index" integer NOT NULL,
	"completed_at" timestamp DEFAULT now() NOT NULL,
	"signature" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "siws_nonce" (
	"id" text PRIMARY KEY NOT NULL,
	"nonce" text NOT NULL,
	"wallet_address" text,
	"expires_at" timestamp NOT NULL,
	"used_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "siws_nonce_nonce_unique" UNIQUE("nonce")
);
--> statement-breakpoint
CREATE TABLE "user_preferences" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"locale" text DEFAULT 'en' NOT NULL,
	"theme" text DEFAULT 'system' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "user_preferences_user_id_unique" UNIQUE("user_id")
);
--> statement-breakpoint
CREATE TABLE "wallet_link" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"wallet_address" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "wallet_link_wallet_address_unique" UNIQUE("wallet_address")
);
--> statement-breakpoint
ALTER TABLE "account" ADD CONSTRAINT "account_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "session" ADD CONSTRAINT "session_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "course_completion" ADD CONSTRAINT "course_completion_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "credential_issuance" ADD CONSTRAINT "credential_issuance_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "enrollment" ADD CONSTRAINT "enrollment_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "learner_profile" ADD CONSTRAINT "learner_profile_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "lesson_completion" ADD CONSTRAINT "lesson_completion_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_preferences" ADD CONSTRAINT "user_preferences_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "wallet_link" ADD CONSTRAINT "wallet_link_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;