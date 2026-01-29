import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, boolean, timestamp, jsonb, serial, pgEnum } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Re-export auth models
export * from "./models/auth";

// Enums
export const orgRoleEnum = pgEnum("org_role", ["OWNER", "ADMIN", "OPERATOR", "VIEWER", "MEMBER"]);
export const intakeStatusEnum = pgEnum("intake_status", ["DRAFT", "SUBMITTED", "PROCESSED"]);
export const painAreaEnum = pgEnum("pain_area", ["SALES", "SUPPORT", "FINANCE", "OPS"]);
export const runStatusEnum = pgEnum("run_status", ["QUEUED", "RUNNING", "SUCCESS", "FAILED"]);
export const logLevelEnum = pgEnum("log_level", ["INFO", "WARN", "ERROR"]);
export const backlogTypeEnum = pgEnum("backlog_type", ["AUTOMATION", "SOP", "DATA_FIX"]);
export const effortEnum = pgEnum("effort", ["S", "M", "L"]);

// Organizations
export const orgs = pgTable("orgs", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertOrgSchema = createInsertSchema(orgs).omit({ id: true, createdAt: true });
export type InsertOrg = z.infer<typeof insertOrgSchema>;
export type Org = typeof orgs.$inferSelect;

// Organization Members
export const orgMembers = pgTable("org_members", {
  id: serial("id").primaryKey(),
  orgId: integer("org_id").notNull().references(() => orgs.id, { onDelete: "cascade" }),
  userId: varchar("user_id").notNull(),
  role: orgRoleEnum("role").notNull().default("MEMBER"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertOrgMemberSchema = createInsertSchema(orgMembers).omit({ id: true, createdAt: true });
export type InsertOrgMember = z.infer<typeof insertOrgMemberSchema>;
export type OrgMember = typeof orgMembers.$inferSelect;

// Intakes
export const intakes = pgTable("intakes", {
  id: serial("id").primaryKey(),
  orgId: integer("org_id").notNull().references(() => orgs.id, { onDelete: "cascade" }),
  createdByUserId: varchar("created_by_user_id").notNull(),
  title: text("title").notNull(),
  status: intakeStatusEnum("status").notNull().default("DRAFT"),
  painArea: painAreaEnum("pain_area"),
  answers: jsonb("answers").$type<IntakeAnswers>(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export interface IntakeAnswers {
  problemDescription?: string;
  currentTools?: string[];
  otherTools?: string;
  volumeMetrics?: {
    emailsPerDay?: number;
    leadsPerWeek?: number;
    invoicesPerMonth?: number;
    ticketsPerDay?: number;
  };
}

export const insertIntakeSchema = createInsertSchema(intakes).omit({ id: true, createdAt: true });
export type InsertIntake = z.infer<typeof insertIntakeSchema>;
export type Intake = typeof intakes.$inferSelect;

// Uploads
export const uploads = pgTable("uploads", {
  id: serial("id").primaryKey(),
  orgId: integer("org_id").notNull().references(() => orgs.id, { onDelete: "cascade" }),
  intakeId: integer("intake_id").references(() => intakes.id, { onDelete: "cascade" }),
  filename: text("filename").notNull(),
  path: text("path").notNull(),
  mime: text("mime").notNull(),
  size: integer("size").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertUploadSchema = createInsertSchema(uploads).omit({ id: true, createdAt: true });
export type InsertUpload = z.infer<typeof insertUploadSchema>;
export type Upload = typeof uploads.$inferSelect;

// Blueprints
export const blueprints = pgTable("blueprints", {
  id: serial("id").primaryKey(),
  orgId: integer("org_id").notNull().references(() => orgs.id, { onDelete: "cascade" }),
  intakeId: integer("intake_id").notNull().references(() => intakes.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  summary: text("summary").notNull(),
  processJson: jsonb("process_json").$type<ProcessStep[]>(),
  bottlenecksJson: jsonb("bottlenecks_json").$type<Bottleneck[]>(),
  backlogJson: jsonb("backlog_json").$type<BacklogItem[]>(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export interface ProcessStep {
  step: string;
  ownerRole: string;
  tools: string[];
  input: string;
  output: string;
  avgTimeMin: number;
}

export interface Bottleneck {
  type: string;
  description: string;
  impact: string;
  evidence: string;
}

export interface BacklogItem {
  item: string;
  type: "AUTOMATION" | "SOP" | "DATA_FIX";
  expectedImpact: string;
  effort: "S" | "M" | "L";
  priorityScore: number;
}

export const insertBlueprintSchema = createInsertSchema(blueprints).omit({ id: true, createdAt: true });
export type InsertBlueprint = z.infer<typeof insertBlueprintSchema>;
export type Blueprint = typeof blueprints.$inferSelect;

// Automation Templates
export const automationTemplates = pgTable("automation_templates", {
  id: serial("id").primaryKey(),
  key: text("key").notNull().unique(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  configSchema: jsonb("config_schema").$type<ConfigSchemaField[]>(),
});

export interface ConfigSchemaField {
  name: string;
  label: string;
  type: "text" | "number" | "select" | "checkbox";
  options?: string[];
  required?: boolean;
  defaultValue?: string | number | boolean;
}

export const insertAutomationTemplateSchema = createInsertSchema(automationTemplates).omit({ id: true });
export type InsertAutomationTemplate = z.infer<typeof insertAutomationTemplateSchema>;
export type AutomationTemplate = typeof automationTemplates.$inferSelect;

// Automation Configs
export const automationConfigs = pgTable("automation_configs", {
  id: serial("id").primaryKey(),
  orgId: integer("org_id").notNull().references(() => orgs.id, { onDelete: "cascade" }),
  templateId: integer("template_id").notNull().references(() => automationTemplates.id),
  name: text("name").notNull(),
  configJson: jsonb("config_json").$type<Record<string, unknown>>(),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertAutomationConfigSchema = createInsertSchema(automationConfigs).omit({ id: true, createdAt: true });
export type InsertAutomationConfig = z.infer<typeof insertAutomationConfigSchema>;
export type AutomationConfig = typeof automationConfigs.$inferSelect;

// Runs
export const runs = pgTable("runs", {
  id: serial("id").primaryKey(),
  orgId: integer("org_id").notNull().references(() => orgs.id, { onDelete: "cascade" }),
  automationConfigId: integer("automation_config_id").notNull().references(() => automationConfigs.id),
  status: runStatusEnum("status").notNull().default("QUEUED"),
  startedAt: timestamp("started_at"),
  endedAt: timestamp("ended_at"),
  statsJson: jsonb("stats_json").$type<RunStats>(),
});

export interface RunStats {
  tasksCreated?: number;
  itemsProcessed?: number;
  estimatedMinutesSaved?: number;
  exceptions?: number;
}

export const insertRunSchema = createInsertSchema(runs).omit({ id: true });
export type InsertRun = z.infer<typeof insertRunSchema>;
export type Run = typeof runs.$inferSelect;

// Run Logs
export const runLogs = pgTable("run_logs", {
  id: serial("id").primaryKey(),
  runId: integer("run_id").notNull().references(() => runs.id, { onDelete: "cascade" }),
  ts: timestamp("ts").defaultNow().notNull(),
  level: logLevelEnum("level").notNull().default("INFO"),
  message: text("message").notNull(),
  metaJson: jsonb("meta_json").$type<Record<string, unknown>>(),
});

export const insertRunLogSchema = createInsertSchema(runLogs).omit({ id: true });
export type InsertRunLog = z.infer<typeof insertRunLogSchema>;
export type RunLog = typeof runLogs.$inferSelect;

// Metric Snapshots
export const metricSnapshots = pgTable("metric_snapshots", {
  id: serial("id").primaryKey(),
  orgId: integer("org_id").notNull().references(() => orgs.id, { onDelete: "cascade" }),
  periodStart: timestamp("period_start").notNull(),
  periodEnd: timestamp("period_end").notNull(),
  hoursSaved: integer("hours_saved").notNull().default(0),
  cycleTimeReductionPct: integer("cycle_time_reduction_pct").notNull().default(0),
  confidenceScore: integer("confidence_score").notNull().default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertMetricSnapshotSchema = createInsertSchema(metricSnapshots).omit({ id: true, createdAt: true });
export type InsertMetricSnapshot = z.infer<typeof insertMetricSnapshotSchema>;
export type MetricSnapshot = typeof metricSnapshots.$inferSelect;

// Connections (OAuth integrations)
export const connectionStatusEnum = pgEnum("connection_status", ["pending", "connected", "error", "expired"]);

export const connections = pgTable("connections", {
  id: serial("id").primaryKey(),
  orgId: integer("org_id").notNull().references(() => orgs.id, { onDelete: "cascade" }),
  provider: text("provider").notNull(),
  status: connectionStatusEnum("status").notNull().default("pending"),
  accessToken: text("access_token"),
  refreshToken: text("refresh_token"),
  expiresAt: timestamp("expires_at"),
  accountEmail: text("account_email"),
  accountName: text("account_name"),
  metadata: jsonb("metadata").$type<Record<string, unknown>>(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertConnectionSchema = createInsertSchema(connections).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertConnection = z.infer<typeof insertConnectionSchema>;
export type Connection = typeof connections.$inferSelect;

// Blueprint versions for editing history
export const blueprintVersions = pgTable("blueprint_versions", {
  id: serial("id").primaryKey(),
  blueprintId: integer("blueprint_id").notNull().references(() => blueprints.id, { onDelete: "cascade" }),
  version: integer("version").notNull().default(1),
  title: text("title").notNull(),
  summary: text("summary").notNull(),
  processJson: jsonb("process_json").$type<ProcessStep[]>(),
  bottlenecksJson: jsonb("bottlenecks_json").$type<Bottleneck[]>(),
  backlogJson: jsonb("backlog_json").$type<BacklogItem[]>(),
  editedByUserId: varchar("edited_by_user_id"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertBlueprintVersionSchema = createInsertSchema(blueprintVersions).omit({ id: true, createdAt: true });
export type InsertBlueprintVersion = z.infer<typeof insertBlueprintVersionSchema>;
export type BlueprintVersion = typeof blueprintVersions.$inferSelect;

// User preferences (locale, theme, etc.)
export const userPreferences = pgTable("user_preferences", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().unique(),
  locale: text("locale").notNull().default("en"),
  theme: text("theme").notNull().default("system"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertUserPreferencesSchema = createInsertSchema(userPreferences).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertUserPreferences = z.infer<typeof insertUserPreferencesSchema>;
export type UserPreferences = typeof userPreferences.$inferSelect;

// Scheduled automations
export const scheduledAutomations = pgTable("scheduled_automations", {
  id: serial("id").primaryKey(),
  automationConfigId: integer("automation_config_id").notNull().references(() => automationConfigs.id, { onDelete: "cascade" }),
  cronExpression: text("cron_expression").notNull(),
  isActive: boolean("is_active").notNull().default(true),
  lastRunAt: timestamp("last_run_at"),
  nextRunAt: timestamp("next_run_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertScheduledAutomationSchema = createInsertSchema(scheduledAutomations).omit({ id: true, createdAt: true });
export type InsertScheduledAutomation = z.infer<typeof insertScheduledAutomationSchema>;
export type ScheduledAutomation = typeof scheduledAutomations.$inferSelect;

// Blueprint shares for public links
export const blueprintShares = pgTable("blueprint_shares", {
  id: serial("id").primaryKey(),
  blueprintId: integer("blueprint_id").notNull().references(() => blueprints.id, { onDelete: "cascade" }),
  shareToken: text("share_token").notNull().unique(),
  expiresAt: timestamp("expires_at"),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertBlueprintShareSchema = createInsertSchema(blueprintShares).omit({ id: true, createdAt: true });
export type InsertBlueprintShare = z.infer<typeof insertBlueprintShareSchema>;
export type BlueprintShare = typeof blueprintShares.$inferSelect;
