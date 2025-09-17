import { db } from '@/database/connection';
import { Injectable } from '@nestjs/common';

@Injectable()
export class StoreRepository {
  async findById(id: string) {
    const result = await db.query.stores.findFirst({
      where: (s, { eq }) => eq(s.id, id),
    });
    return result;
  }
}
