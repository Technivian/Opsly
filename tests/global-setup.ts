// Global setup - runs before any tests
// Sets environment variables that must be available before modules load

export default async function setup() {
  // Set environment variables before any imports
  process.env.NODE_ENV = 'test';
  process.env.DATABASE_URL = process.env.TEST_DATABASE_URL || 'postgresql://haroonwahed@localhost:5432/opsly_test';
  process.env.SESSION_SECRET = 'test-secret-key-do-not-use-in-production';
  
  console.log('🧪 Global test setup complete');
  console.log(`   Database: ${process.env.DATABASE_URL}`);

  // Seed automation templates
  const { db } = await import('../server/db.js');
  const { automationTemplates } = await import('../shared/schema.js');
  const { eq } = await import('drizzle-orm');

  // Check if templates exist
  const existing = await db.select().from(automationTemplates).limit(1);
  
  if (existing.length === 0) {
    console.log('   Seeding automation templates...');
    
    await db.insert(automationTemplates).values([
      {
        key: 'email_task_triage',
        name: 'Email Task Triage',
        description: 'Automatically categorize and prioritize incoming emails',
        configSchema: {
          source: 'string',
          labelFilter: 'string',
          categories: 'array',
        },
      },
      {
        key: 'lead_followup',
        name: 'Lead Follow-up',
        description: 'Automate follow-up emails for new leads',
        configSchema: {
          crm: 'string',
          followUpDelay: 'number',
          autoSend: 'boolean',
        },
      },
      {
        key: 'form_crm_sync',
        name: 'Form to CRM Sync',
        description: 'Sync form submissions to CRM automatically',
        configSchema: {
          formSource: 'string',
          crmDestination: 'string',
          fieldMapping: 'object',
        },
      },
      {
        key: 'lead_slack_notify',
        name: 'Lead Slack Notification',
        description: 'Notify Slack channel when qualified lead appears',
        configSchema: {
          channel: 'string',
          qualificationCriteria: 'object',
        },
      },
    ]);
    
    console.log('   ✅ 4 automation templates seeded');
  } else {
    console.log('   Templates already exist, skipping seed');
  }
}
