import { db } from '@/database/connection';
import { Injectable } from '@nestjs/common';

@Injectable()
export class StoreUsersRepository {
  async findByUserId(userId: string) {
    const result = await db.query.storeUsers.findFirst({
      where: (s, { eq }) => eq(s.userId, userId),
      with: { store: true },
    });
    return result;
  }
}
