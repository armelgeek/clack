import { db } from '@/database/connection';
import { Injectable } from '@nestjs/common';
import { and, eq, ilike, or, sql, isNull } from 'drizzle-orm';
import { stores } from '@/database';

@Injectable()
export class StoreRepository {
  async findById(id: string) {
    const result = await db.query.stores.findFirst({
      where: eq(stores.id, id),
    });
    return result;
  }

  async findAll(
    page: number = 1,
    limit: number = 10,
    search?: string,
    region?: string,
  ) {
    const offset = (page - 1) * limit;

    const conditions = [];

    // Only include non-deleted stores
    conditions.push(isNull(stores.deletedAt));
    conditions.push(eq(stores.status, 'ACTIVATED')); 

    // Search by name or address
    if (search) {
      conditions.push(
        or(
          ilike(stores.name, `%${search}%`),
          ilike(stores.address, `%${search}%`),
        ),
      );
    }

    // Filter by region
    if (region) {
      conditions.push(ilike(stores.address, `%${region}%`));
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    // Get total count
    const countResult = await db
      .select({ count: sql<number>`count(*)` })
      .from(stores)
      .where(whereClause);

    const total = Number(countResult[0]?.count || 0);

    // Get paginated results
    const results = await db
      .select()
      .from(stores)
      .where(whereClause)
      .limit(limit)
      .offset(offset)
      .orderBy(stores.createdAt);

    return {
      data: results,
      total,
    };
  }
}
