import { db } from '@/database';
import { storeFolders } from '@/database';
import { randomUUID } from 'crypto';
import { eq } from 'drizzle-orm';

export class StoreFolderRepository {
    async storeToFolder(storeId: string, folderId: string) {
    return db
      .update(storeFolders)
      .set({ storeId })
      .where(eq(storeFolders.id,folderId))
      .returning();
  }
  async createFolder(name: string, storeId?: string, parentId?: string) {
    const id = randomUUID();
    return db
      .insert(storeFolders)
      .values({
        id,
        name,
        storeId,
        parentId,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      })
      .returning();
  }

  async getAllFolders() {
    return db.select().from(storeFolders);
  }
}
