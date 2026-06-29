CREATE TYPE "public"."backlog_type" AS ENUM('AUTOMATION', 'SOP', 'DATA_FIX');--> statement-breakpoint
CREATE TYPE "public"."connection_status" AS ENUM('pending', 'connected', 'error', 'expired');--> statement-breakpoint
CREATE TYPE "public"."effort" AS ENUM('S', 'M', 'L');--> statement-breakpoint
CREATE TYPE "public"."intake_status" AS ENUM('DRAFT', 'SUBMITTED', 'PROCESSING', 'COMPLETED', 'FAILED', 'PROCESSED');--> statement-breakpoint
CREATE TYPE "public"."log_level" AS ENUM('INFO', 'WARN', 'ERROR');--> statement-breakpoint
CREATE TYPE "public"."org_role" AS ENUM('OWNER', 'ADMIN', 'OPERATOR', 'VIEWER', 'MEMBER');--> statement-breakpoint
CREATE TYPE "public"."pain_area" AS ENUM('SALES', 'SUPPORT', 'FINANCE', 'OPS');--> statement-breakpoint
CREATE TYPE "public"."run_status" AS ENUM('QUEUED', 'RUNNING', 'RETRYING', 'SUCCESS', 'FAILED');--> statement-breakpoint
CREATE TYPE "public"."template_status" AS ENUM('active', 'demo', 'placeholder');--> statement-breakpoint
CREATE TABLE "automation_configs" (
	"id" serial PRIMARY KEY NOT NULL,
	"org_id" integer NOT NULL,
	"template_id" integer NOT NULL,
	"name" text NOT NULL,
	"config_json" jsonb,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "automation_templates" (
	"id" serial PRIMARY KEY NOT NULL,
	"key" text NOT NULL,
	"name" text NOT NULL,
	"description" text NOT NULL,
	"status" "template_status" DEFAULT 'active' NOT NULL,
	"config_schema" jsonb,
	CONSTRAINT "automation_templates_key_unique" UNIQUE("key")
);
--> statement-breakpoint
CREATE TABLE "blueprint_shares" (
	"id" serial PRIMARY KEY NOT NULL,
	"blueprint_id" integer NOT NULL,
	"share_token" text NOT NULL,
	"expires_at" timestamp,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "blueprint_shares_share_token_unique" UNIQUE("share_token")
);
--> statement-breakpoint
CREATE TABLE "blueprint_versions" (
	"id" serial PRIMARY KEY NOT NULL,
	"blueprint_id" integer NOT NULL,
	"version" integer DEFAULT 1 NOT NULL,
	"title" text NOT NULL,
	"summary" text NOT NULL,
	"process_json" jsonb,
	"bottlenecks_json" jsonb,
	"backlog_json" jsonb,
	"edited_by_user_id" varchar,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "blueprints" (
	"id" serial PRIMARY KEY NOT NULL,
	"org_id" integer NOT NULL,
	"intake_id" integer NOT NULL,
	"title" text NOT NULL,
	"summary" text NOT NULL,
	"process_json" jsonb,
	"bottlenecks_json" jsonb,
	"backlog_json" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "connections" (
	"id" serial PRIMARY KEY NOT NULL,
	"org_id" integer NOT NULL,
	"provider" text NOT NULL,
	"status" "connection_status" DEFAULT 'pending' NOT NULL,
	"access_token" text,
	"refresh_token" text,
	"expires_at" timestamp,
	"account_email" text,
	"account_name" text,
	"metadata" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "intakes" (
	"id" serial PRIMARY KEY NOT NULL,
	"org_id" integer NOT NULL,
	"created_by_user_id" varchar NOT NULL,
	"title" text NOT NULL,
	"status" "intake_status" DEFAULT 'DRAFT' NOT NULL,
	"pain_area" "pain_area",
	"answers" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "metric_snapshots" (
	"id" serial PRIMARY KEY NOT NULL,
	"org_id" integer NOT NULL,
	"period_start" timestamp NOT NULL,
	"period_end" timestamp NOT NULL,
	"hours_saved" integer DEFAULT 0 NOT NULL,
	"cycle_time_reduction_pct" integer DEFAULT 0 NOT NULL,
	"confidence_score" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "org_members" (
	"id" serial PRIMARY KEY NOT NULL,
	"org_id" integer NOT NULL,
	"user_id" varchar NOT NULL,
	"role" "org_role" DEFAULT 'MEMBER' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "orgs" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "run_logs" (
	"id" serial PRIMARY KEY NOT NULL,
	"run_id" integer NOT NULL,
	"ts" timestamp DEFAULT now() NOT NULL,
	"level" "log_level" DEFAULT 'INFO' NOT NULL,
	"message" text NOT NULL,
	"meta_json" jsonb
);
--> statement-breakpoint
CREATE TABLE "runs" (
	"id" serial PRIMARY KEY NOT NULL,
	"org_id" integer NOT NULL,
	"automation_config_id" integer NOT NULL,
	"status" "run_status" DEFAULT 'QUEUED' NOT NULL,
	"is_demo_run" boolean DEFAULT false NOT NULL,
	"started_at" timestamp,
	"ended_at" timestamp,
	"attempt_count" integer DEFAULT 0 NOT NULL,
	"last_error" text,
	"stats_json" jsonb
);
--> statement-breakpoint
CREATE TABLE "scheduled_automations" (
	"id" serial PRIMARY KEY NOT NULL,
	"automation_config_id" integer NOT NULL,
	"cron_expression" text NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"last_run_at" timestamp,
	"next_run_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "uploads" (
	"id" serial PRIMARY KEY NOT NULL,
	"org_id" integer NOT NULL,
	"intake_id" integer,
	"filename" text NOT NULL,
	"path" text NOT NULL,
	"mime" text NOT NULL,
	"size" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "user_preferences" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" varchar NOT NULL,
	"locale" text DEFAULT 'nl' NOT NULL,
	"theme" text DEFAULT 'system' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "user_preferences_user_id_unique" UNIQUE("user_id")
);
--> statement-breakpoint
CREATE TABLE "sessions" (
	"sid" varchar PRIMARY KEY NOT NULL,
	"sess" jsonb NOT NULL,
	"expire" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" varchar NOT NULL,
	"password_hash" varchar,
	"google_id" varchar,
	"first_name" varchar,
	"last_name" varchar,
	"profile_image_url" varchar,
	"email_verified" boolean DEFAULT false,
	"magic_link_token" varchar,
	"magic_link_expires" timestamp,
	"is_demo" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "users_email_unique" UNIQUE("email"),
	CONSTRAINT "users_google_id_unique" UNIQUE("google_id")
);
--> statement-breakpoint
ALTER TABLE "automation_configs" ADD CONSTRAINT "automation_configs_org_id_orgs_id_fk" FOREIGN KEY ("org_id") REFERENCES "public"."orgs"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "automation_configs" ADD CONSTRAINT "automation_configs_template_id_automation_templates_id_fk" FOREIGN KEY ("template_id") REFERENCES "public"."automation_templates"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "blueprint_shares" ADD CONSTRAINT "blueprint_shares_blueprint_id_blueprints_id_fk" FOREIGN KEY ("blueprint_id") REFERENCES "public"."blueprints"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "blueprint_versions" ADD CONSTRAINT "blueprint_versions_blueprint_id_blueprints_id_fk" FOREIGN KEY ("blueprint_id") REFERENCES "public"."blueprints"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "blueprints" ADD CONSTRAINT "blueprints_org_id_orgs_id_fk" FOREIGN KEY ("org_id") REFERENCES "public"."orgs"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "blueprints" ADD CONSTRAINT "blueprints_intake_id_intakes_id_fk" FOREIGN KEY ("intake_id") REFERENCES "public"."intakes"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "connections" ADD CONSTRAINT "connections_org_id_orgs_id_fk" FOREIGN KEY ("org_id") REFERENCES "public"."orgs"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "intakes" ADD CONSTRAINT "intakes_org_id_orgs_id_fk" FOREIGN KEY ("org_id") REFERENCES "public"."orgs"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "metric_snapshots" ADD CONSTRAINT "metric_snapshots_org_id_orgs_id_fk" FOREIGN KEY ("org_id") REFERENCES "public"."orgs"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "org_members" ADD CONSTRAINT "org_members_org_id_orgs_id_fk" FOREIGN KEY ("org_id") REFERENCES "public"."orgs"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "run_logs" ADD CONSTRAINT "run_logs_run_id_runs_id_fk" FOREIGN KEY ("run_id") REFERENCES "public"."runs"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "runs" ADD CONSTRAINT "runs_org_id_orgs_id_fk" FOREIGN KEY ("org_id") REFERENCES "public"."orgs"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "runs" ADD CONSTRAINT "runs_automation_config_id_automation_configs_id_fk" FOREIGN KEY ("automation_config_id") REFERENCES "public"."automation_configs"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "scheduled_automations" ADD CONSTRAINT "scheduled_automations_automation_config_id_automation_configs_id_fk" FOREIGN KEY ("automation_config_id") REFERENCES "public"."automation_configs"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "uploads" ADD CONSTRAINT "uploads_org_id_orgs_id_fk" FOREIGN KEY ("org_id") REFERENCES "public"."orgs"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "uploads" ADD CONSTRAINT "uploads_intake_id_intakes_id_fk" FOREIGN KEY ("intake_id") REFERENCES "public"."intakes"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "IDX_session_expire" ON "sessions" USING btree ("expire");