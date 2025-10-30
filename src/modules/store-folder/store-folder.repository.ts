import { db } from '@/database';
import { storeFolders } from '@/database';
import { randomUUID } from 'crypto';

export class StoreFolderRepository {
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
