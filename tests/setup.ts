import { beforeAll, afterAll, afterEach } from 'vitest';
import { db, pool } from '../server/db';
import { sql } from 'drizzle-orm';

beforeAll(async () => {
  console.log('Test setup: Database connection established');
});

afterEach(async () => {
  // Clean up test data after each test - order matters to avoid foreign key constraints
  try {
    // Delete in reverse dependency order
    await db.execute(sql`DELETE FROM run_logs`);
    await db.execute(sql`DELETE FROM runs`);
    await db.execute(sql`DELETE FROM automation_configs`);
    await db.execute(sql`DELETE FROM connections`);
    await db.execute(sql`DELETE FROM blueprints`);
    await db.execute(sql`DELETE FROM intakes`);
    await db.execute(sql`DELETE FROM org_members`);
    await db.execute(sql`DELETE FROM user_preferences`);
    await db.execute(sql`DELETE FROM users`);
    await db.execute(sql`DELETE FROM orgs`);
    await db.execute(sql`DELETE FROM sessions`);
  } catch (error) {
    console.error('Cleanup error:', error);
  }
});

afterAll(async () => {
  // Close database connection
  await pool.end();
  console.log('Test teardown: Database connection closed');
});

// Mock external services
export const mockGmailClient = {
  listMessages: async () => ({
    data: {
      messages: [
        { id: 'msg1', threadId: 'thread1' },
        { id: 'msg2', threadId: 'thread2' },
      ],
    },
  }),
  getMessage: async (id: string) => ({
    data: {
      id,
      payload: {
        headers: [
          { name: 'Subject', value: 'Test Email' },
          { name: 'From', value: 'test@example.com' },
        ],
        body: { data: Buffer.from('Test email body').toString('base64') },
      },
    },
  }),
  modifyMessage: async () => ({ data: {} }),
};

export const mockOpenAIClient = {
  chat: {
    completions: {
      create: async () => ({
        choices: [
          {
            message: {
              content: JSON.stringify({
                processSteps: [
                  { step: 1, description: 'Test step', duration: 5 },
                ],
                bottlenecks: [
                  { area: 'Test area', impact: 'High', suggestion: 'Test suggestion' },
                ],
                backlog: [
                  { priority: 1, title: 'Test item', description: 'Test description' },
                ],
              }),
            },
          },
        ],
      }),
    },
  },
};
