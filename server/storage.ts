import { db } from "./db";
import { eq, desc, and } from "drizzle-orm";
import {
  orgs,
  orgMembers,
  intakes,
  uploads,
  blueprints,
  automationTemplates,
  automationConfigs,
  runs,
  runLogs,
  metricSnapshots,
  connections,
  blueprintVersions,
  userPreferences,
  blueprintShares,
  type InsertOrg,
  type Org,
  type InsertOrgMember,
  type OrgMember,
  type InsertIntake,
  type Intake,
  type InsertUpload,
  type Upload,
  type InsertBlueprint,
  type Blueprint,
  type InsertAutomationTemplate,
  type AutomationTemplate,
  type InsertAutomationConfig,
  type AutomationConfig,
  type InsertRun,
  type Run,
  type InsertRunLog,
  type RunLog,
  type InsertMetricSnapshot,
  type MetricSnapshot,
  type InsertConnection,
  type Connection,
  type InsertBlueprintVersion,
  type BlueprintVersion,
  type InsertUserPreferences,
  type UserPreferences,
  type InsertBlueprintShare,
  type BlueprintShare,
} from "@shared/schema";
import { users, type User } from "@shared/models/auth";

export interface IStorage {
  // Organizations
  getOrg(id: number): Promise<Org | undefined>;
  getOrgByUserId(userId: string): Promise<Org | undefined>;
  createOrg(org: InsertOrg): Promise<Org>;
  deleteOrg(orgId: number): Promise<void>;
  
  // Org Members
  getOrgMember(orgId: number, userId: string): Promise<OrgMember | undefined>;
  getOrgMembers(orgId: number): Promise<(OrgMember & { user?: { email: string | null; firstName: string | null; lastName: string | null; profileImageUrl: string | null; } })[]>;
  createOrgMember(member: InsertOrgMember): Promise<OrgMember>;
  
  // Intakes
  getIntake(id: number): Promise<Intake | undefined>;
  getIntakesByOrg(orgId: number): Promise<Intake[]>;
  createIntake(intake: InsertIntake): Promise<Intake>;
  updateIntake(id: number, updates: Partial<InsertIntake>): Promise<Intake | undefined>;
  
  // Uploads
  getUpload(id: number): Promise<Upload | undefined>;
  getUploadsByIntake(intakeId: number): Promise<Upload[]>;
  createUpload(upload: InsertUpload): Promise<Upload>;
  
  // Blueprints
  getBlueprint(id: number): Promise<Blueprint | undefined>;
  getBlueprintsByOrg(orgId: number): Promise<Blueprint[]>;
  getBlueprintByIntake(intakeId: number): Promise<Blueprint | undefined>;
  createBlueprint(blueprint: InsertBlueprint): Promise<Blueprint>;
  
  // Automation Templates
  getAutomationTemplate(id: number): Promise<AutomationTemplate | undefined>;
  getAllAutomationTemplates(): Promise<AutomationTemplate[]>;
  createAutomationTemplate(template: InsertAutomationTemplate): Promise<AutomationTemplate>;
  
  // Automation Configs
  getAutomationConfig(id: number): Promise<AutomationConfig | undefined>;
  getAutomationConfigsByOrg(orgId: number): Promise<AutomationConfig[]>;
  createAutomationConfig(config: InsertAutomationConfig): Promise<AutomationConfig>;
  updateAutomationConfig(id: number, updates: Partial<InsertAutomationConfig>): Promise<AutomationConfig | undefined>;
  
  // Runs
  getRun(id: number): Promise<Run | undefined>;
  getRunsByOrg(orgId: number): Promise<Run[]>;
  createRun(run: InsertRun): Promise<Run>;
  updateRun(id: number, updates: Partial<InsertRun>): Promise<Run | undefined>;
  
  // Run Logs
  getRunLogs(runId: number): Promise<RunLog[]>;
  createRunLog(log: InsertRunLog): Promise<RunLog>;
  
  // Metric Snapshots
  getLatestMetricSnapshot(orgId: number): Promise<MetricSnapshot | undefined>;
  createMetricSnapshot(snapshot: InsertMetricSnapshot): Promise<MetricSnapshot>;
  
  // Connections
  getConnections(orgId: number): Promise<Connection[]>;
  getConnectionByProvider(orgId: number, provider: string): Promise<Connection | undefined>;
  createConnection(connection: InsertConnection): Promise<Connection>;
  updateConnection(id: number, updates: Partial<InsertConnection>): Promise<Connection | undefined>;
}

class DrizzleStorage implements IStorage {
  // Organizations
  async getOrg(id: number): Promise<Org | undefined> {
    const [org] = await db.select().from(orgs).where(eq(orgs.id, id));
    return org;
  }

  async getOrgByUserId(userId: string): Promise<Org | undefined> {
    const result = await db
      .select({ org: orgs })
      .from(orgMembers)
      .innerJoin(orgs, eq(orgMembers.orgId, orgs.id))
      .where(eq(orgMembers.userId, userId))
      .limit(1);
    return result[0]?.org;
  }

  async createOrg(org: InsertOrg): Promise<Org> {
    const [newOrg] = await db.insert(orgs).values(org).returning();
    return newOrg;
  }

  async deleteOrg(orgId: number): Promise<void> {
    // Cascade delete via foreign key constraint
    // This deletes: org -> orgMembers, intakes, blueprints, automationConfigs, runs, runLogs, etc.
    await db.delete(orgs).where(eq(orgs.id, orgId));
  }

  // Org Members
  async getOrgMember(orgId: number, userId: string): Promise<OrgMember | undefined> {
    const [member] = await db
      .select()
      .from(orgMembers)
      .where(and(eq(orgMembers.orgId, orgId), eq(orgMembers.userId, userId)));
    return member;
  }

  async getOrgMembers(orgId: number): Promise<(OrgMember & { user?: { email: string | null; firstName: string | null; lastName: string | null; profileImageUrl: string | null; } })[]> {
    const members = await db
      .select({
        id: orgMembers.id,
        orgId: orgMembers.orgId,
        userId: orgMembers.userId,
        role: orgMembers.role,
        createdAt: orgMembers.createdAt,
        userEmail: users.email,
        userFirstName: users.firstName,
        userLastName: users.lastName,
        userProfileImageUrl: users.profileImageUrl,
      })
      .from(orgMembers)
      .leftJoin(users, eq(orgMembers.userId, users.id))
      .where(eq(orgMembers.orgId, orgId));
    return members.map(m => ({
      id: m.id,
      orgId: m.orgId,
      userId: m.userId,
      role: m.role,
      createdAt: m.createdAt,
      user: m.userEmail ? {
        email: m.userEmail,
        firstName: m.userFirstName,
        lastName: m.userLastName,
        profileImageUrl: m.userProfileImageUrl,
      } : undefined,
    }));
  }

  async createOrgMember(member: InsertOrgMember): Promise<OrgMember> {
    const [newMember] = await db.insert(orgMembers).values(member).returning();
    return newMember;
  }

  // Intakes
  async getIntake(id: number): Promise<Intake | undefined> {
    const [intake] = await db.select().from(intakes).where(eq(intakes.id, id));
    return intake;
  }

  async getIntakesByOrg(orgId: number): Promise<Intake[]> {
    return db.select().from(intakes).where(eq(intakes.orgId, orgId)).orderBy(desc(intakes.createdAt));
  }

  async createIntake(intake: InsertIntake): Promise<Intake> {
    const [newIntake] = await db.insert(intakes).values(intake).returning();
    return newIntake;
  }

  async updateIntake(id: number, updates: Partial<InsertIntake>): Promise<Intake | undefined> {
    const [updated] = await db.update(intakes).set(updates).where(eq(intakes.id, id)).returning();
    return updated;
  }

  // Uploads
  async getUpload(id: number): Promise<Upload | undefined> {
    const [upload] = await db.select().from(uploads).where(eq(uploads.id, id));
    return upload;
  }

  async getUploadsByIntake(intakeId: number): Promise<Upload[]> {
    return db.select().from(uploads).where(eq(uploads.intakeId, intakeId));
  }

  async createUpload(upload: InsertUpload): Promise<Upload> {
    const [newUpload] = await db.insert(uploads).values(upload).returning();
    return newUpload;
  }

  // Blueprints
  async getBlueprint(id: number): Promise<Blueprint | undefined> {
    const [blueprint] = await db.select().from(blueprints).where(eq(blueprints.id, id));
    return blueprint;
  }

  async getBlueprintsByOrg(orgId: number): Promise<Blueprint[]> {
    return db.select().from(blueprints).where(eq(blueprints.orgId, orgId)).orderBy(desc(blueprints.createdAt));
  }

  async getBlueprintByIntake(intakeId: number): Promise<Blueprint | undefined> {
    const [blueprint] = await db.select().from(blueprints).where(eq(blueprints.intakeId, intakeId));
    return blueprint;
  }

  async createBlueprint(blueprint: InsertBlueprint): Promise<Blueprint> {
    const [newBlueprint] = await db.insert(blueprints).values(blueprint).returning();
    return newBlueprint;
  }

  // Automation Templates
  async getAutomationTemplate(id: number): Promise<AutomationTemplate | undefined> {
    const [template] = await db.select().from(automationTemplates).where(eq(automationTemplates.id, id));
    return template;
  }

  async getAllAutomationTemplates(): Promise<AutomationTemplate[]> {
    return db.select().from(automationTemplates);
  }

  async createAutomationTemplate(template: InsertAutomationTemplate): Promise<AutomationTemplate> {
    const [newTemplate] = await db.insert(automationTemplates).values(template).returning();
    return newTemplate;
  }

  // Automation Configs
  async getAutomationConfig(id: number): Promise<AutomationConfig | undefined> {
    const [config] = await db.select().from(automationConfigs).where(eq(automationConfigs.id, id));
    return config;
  }

  async getAutomationConfigsByOrg(orgId: number): Promise<AutomationConfig[]> {
    return db.select().from(automationConfigs).where(eq(automationConfigs.orgId, orgId)).orderBy(desc(automationConfigs.createdAt));
  }

  async createAutomationConfig(config: InsertAutomationConfig): Promise<AutomationConfig> {
    const [newConfig] = await db.insert(automationConfigs).values(config).returning();
    return newConfig;
  }

  async updateAutomationConfig(id: number, updates: Partial<InsertAutomationConfig>): Promise<AutomationConfig | undefined> {
    const [updated] = await db.update(automationConfigs).set(updates).where(eq(automationConfigs.id, id)).returning();
    return updated;
  }

  // Runs
  async getRun(id: number): Promise<Run | undefined> {
    const [run] = await db.select().from(runs).where(eq(runs.id, id));
    return run;
  }

  async getRunsByOrg(orgId: number): Promise<Run[]> {
    return db.select().from(runs).where(eq(runs.orgId, orgId)).orderBy(desc(runs.id));
  }

  async createRun(run: InsertRun): Promise<Run> {
    const [newRun] = await db.insert(runs).values(run).returning();
    return newRun;
  }

  async updateRun(id: number, updates: Partial<InsertRun>): Promise<Run | undefined> {
    const [updated] = await db.update(runs).set(updates).where(eq(runs.id, id)).returning();
    return updated;
  }

  // Run Logs
  async getRunLogs(runId: number): Promise<RunLog[]> {
    return db.select().from(runLogs).where(eq(runLogs.runId, runId)).orderBy(runLogs.ts);
  }

  async createRunLog(log: InsertRunLog): Promise<RunLog> {
    const [newLog] = await db.insert(runLogs).values(log).returning();
    return newLog;
  }

  // Metric Snapshots
  async getLatestMetricSnapshot(orgId: number): Promise<MetricSnapshot | undefined> {
    const [snapshot] = await db
      .select()
      .from(metricSnapshots)
      .where(eq(metricSnapshots.orgId, orgId))
      .orderBy(desc(metricSnapshots.createdAt))
      .limit(1);
    return snapshot;
  }

  async createMetricSnapshot(snapshot: InsertMetricSnapshot): Promise<MetricSnapshot> {
    const [newSnapshot] = await db.insert(metricSnapshots).values(snapshot).returning();
    return newSnapshot;
  }

  // Connections
  async getConnections(orgId: number): Promise<Connection[]> {
    return db.select().from(connections).where(eq(connections.orgId, orgId));
  }

  async getConnectionByProvider(orgId: number, provider: string): Promise<Connection | undefined> {
    const result = await db
      .select()
      .from(connections)
      .where(and(eq(connections.orgId, orgId), eq(connections.provider, provider)))
      .limit(1);
    return result[0];
  }

  async createConnection(connection: InsertConnection): Promise<Connection> {
    const [newConnection] = await db.insert(connections).values(connection).returning();
    return newConnection;
  }

  async updateConnection(id: number, updates: Partial<InsertConnection>): Promise<Connection | undefined> {
    const [updated] = await db.update(connections).set(updates).where(eq(connections.id, id)).returning();
    return updated;
  }

  async deleteConnection(id: number): Promise<void> {
    await db.delete(connections).where(eq(connections.id, id));
  }

  async getConnection(id: number): Promise<Connection | undefined> {
    const [connection] = await db.select().from(connections).where(eq(connections.id, id));
    return connection;
  }

  // Blueprint versions
  async getBlueprintVersions(blueprintId: number): Promise<BlueprintVersion[]> {
    return db.select().from(blueprintVersions).where(eq(blueprintVersions.blueprintId, blueprintId)).orderBy(desc(blueprintVersions.version));
  }

  async createBlueprintVersion(version: InsertBlueprintVersion): Promise<BlueprintVersion> {
    const [newVersion] = await db.insert(blueprintVersions).values(version).returning();
    return newVersion;
  }

  // User preferences
  async getUserPreferences(userId: string): Promise<UserPreferences | undefined> {
    const [prefs] = await db.select().from(userPreferences).where(eq(userPreferences.userId, userId));
    return prefs;
  }

  async upsertUserPreferences(prefs: InsertUserPreferences): Promise<UserPreferences> {
    const existing = await this.getUserPreferences(prefs.userId);
    if (existing) {
      const [updated] = await db.update(userPreferences).set({ ...prefs, updatedAt: new Date() }).where(eq(userPreferences.userId, prefs.userId)).returning();
      return updated;
    }
    const [created] = await db.insert(userPreferences).values(prefs).returning();
    return created;
  }

  // Blueprint shares
  async getBlueprintShare(shareToken: string): Promise<BlueprintShare | undefined> {
    const [share] = await db.select().from(blueprintShares).where(eq(blueprintShares.shareToken, shareToken));
    return share;
  }

  async createBlueprintShare(share: InsertBlueprintShare): Promise<BlueprintShare> {
    const [newShare] = await db.insert(blueprintShares).values(share).returning();
    return newShare;
  }

  async updateBlueprint(id: number, updates: Partial<InsertBlueprint>): Promise<Blueprint | undefined> {
    const [updated] = await db.update(blueprints).set(updates).where(eq(blueprints.id, id)).returning();
    return updated;
  }
}

export const storage = new DrizzleStorage();
