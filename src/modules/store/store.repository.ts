import { eq } from 'drizzle-orm';
import { db } from '@/database/connection';
import { stores } from '@/database/schema';
import { Injectable } from '@nestjs/common';

@Injectable()
export class StoreRepository {
  async findById(id: string) {
    const result = await db.select().from(stores).where(eq(stores.id, id));
    return result[0];
  }
}
