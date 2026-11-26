import { eq } from 'drizzle-orm';
import { db } from './index.ts';
import { users } from './schema.ts';

export async function getOrCreateUser(uid: string, email: string, fullName?: string) {
  try {
    const resolvedName =
      fullName && fullName.trim().length > 0
        ? fullName.trim()
        : email.split('@')[0] || 'Naboa Shopper';

    const result = await db
      .insert(users)
      .values({
        uid,
        email,
        fullName: resolvedName,
      })
      .onConflictDoUpdate({
        target: users.uid,
        set: {
          email,
          fullName: resolvedName,
        },
      })
      .returning();

    return result[0];
  } catch (error) {
    console.error('Database user upsert failed:', error);
    throw new Error('Unable to synchronize user profile.', { cause: error });
  }
}

export async function getUserByUid(uid: string) {
  try {
    const rows = await db.select().from(users).where(eq(users.uid, uid)).limit(1);
    return rows[0] ?? null;
  } catch (error) {
    console.error('Database user lookup failed:', error);
    throw new Error('Unable to load user profile.', { cause: error });
  }
}
