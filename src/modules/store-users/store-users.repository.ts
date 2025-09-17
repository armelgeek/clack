import { eq } from 'drizzle-orm';
import { db } from '@/database/connection';
import { storeUsers } from '@/database/schema';
import { Injectable } from '@nestjs/common';

@Injectable()
export class StoreUsersRepository {
  async findByUserId(userId: string) {
    const result = await db
      .select()
      .from(storeUsers)
      .where(eq(storeUsers.userId, userId));
    return result[0];
  }
}
