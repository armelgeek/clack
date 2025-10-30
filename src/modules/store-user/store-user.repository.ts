import { Injectable } from '@nestjs/common';
import { db } from '@/database';
import { storeUsers, users, sessions, accounts, twoFactor } from '@/database';
import { and, eq } from 'drizzle-orm';

@Injectable()
export class StoreUserRepository {
  async removeUserFromStore(userId: string, storeId: string) {
    return await db.transaction(async (tx) => {
      const deletedStoreUser = await tx
        .delete(storeUsers)
        .where(
          and(eq(storeUsers.userId, userId), eq(storeUsers.storeId, storeId)),
        )
        .returning({ userId: storeUsers.userId, storeId: storeUsers.storeId });

      if (deletedStoreUser.length === 0) {
        throw new Error(`No user ${userId} found in store ${storeId}`);
      }

      const remainingStores = await tx
        .select()
        .from(storeUsers)
        .where(eq(storeUsers.userId, userId));

      if (remainingStores.length === 0) {
        await tx.delete(sessions).where(eq(sessions.userId, userId));
        await tx.delete(accounts).where(eq(accounts.userId, userId));
        await tx.delete(twoFactor).where(eq(twoFactor.userId, userId));
        await tx.delete(users).where(eq(users.id, userId));
      }

      return deletedStoreUser[0];
    });
  }
}
