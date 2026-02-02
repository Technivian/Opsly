import { db } from '../../server/db';
import { users, orgs, orgMembers } from '../../shared/schema';
import { hash } from 'bcrypt';
import { eq } from 'drizzle-orm';

export interface TestUser {
  id: string;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  orgId: string;
}

/**
 * Create a test user with org membership
 */
export async function createTestUser(data: {
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
}): Promise<TestUser> {
  const { email, password, firstName = 'Test', lastName = 'User' } = data;

  // Hash password
  const passwordHash = await hash(password, 10);

  // Create org
  const [org] = await db
    .insert(orgs)
    .values({ name: `${firstName}'s Org` })
    .returning();

  // Create user
  const [user] = await db
    .insert(users)
    .values({
      email,
      passwordHash,
      firstName,
      lastName,
    })
    .returning();

  // Create org membership
  await db.insert(orgMembers).values({
    userId: user.id,
    orgId: org.id,
    role: 'OWNER',
  });

  return {
    id: user.id,
    email: user.email,
    password, // Return plain password for testing
    firstName: user.firstName,
    lastName: user.lastName || '',
    orgId: org.id,
  };
}

/**
 * Get user by email
 */
export async function getUserByEmail(email: string) {
  const [user] = await db.select().from(users).where(eq(users.email, email));
  return user;
}

/**
 * Delete test user and related data
 */
export async function deleteTestUser(userId: string) {
  await db.delete(users).where(eq(users.id, userId));
}

/**
 * Wait for async operations to complete
 */
export async function waitFor(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Generate unique test email
 */
export function generateTestEmail(): string {
  return `test-${Date.now()}-${Math.random().toString(36).substring(7)}@example.com`;
}
