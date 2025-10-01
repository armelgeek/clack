import { db } from '@/database/connection';
import { Injectable } from '@nestjs/common';
import { and, eq, ilike, or, sql, isNull } from 'drizzle-orm';
import { products } from 'vapostore-db';

@Injectable()
export class ProductRepository {
  async findById(id: string) {
    const result = await db.query.products.findFirst({
      where: (p, { eq }) => eq(p.id, id),
      with: {
        store: true,
      },
    });
    return result;
  }

  async findAll(page: number = 1, limit: number = 10, search?: string) {
    const offset = (page - 1) * limit;

    const conditions = [];

    // Only include non-deleted products
    conditions.push(isNull(products.deletedAt));

    // Search by name or category
    if (search) {
      conditions.push(
        or(
          ilike(products.name, `%${search}%`),
          ilike(products.category, `%${search}%`),
        ),
      );
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    // Get total count
    const countResult = await db
      .select({ count: sql<number>`count(*)` })
      .from(products)
      .where(whereClause);

    const total = Number(countResult[0]?.count || 0);

    // Get paginated results
    const results = await db.query.products.findMany({
      where: whereClause,
      limit,
      offset,
      orderBy: (products, { desc }) => [desc(products.createdAt)],
      with: {
        store: true,
      },
    });

    return {
      data: results,
      total,
    };
  }

  async findByStoreId(
    storeId: string,
    page: number = 1,
    limit: number = 10,
    search?: string,
  ) {
    const offset = (page - 1) * limit;

    const conditions = [eq(products.storeId, storeId)];

    // Only include non-deleted products
    conditions.push(isNull(products.deletedAt));

    // Search by name or category
    if (search) {
      conditions.push(
        or(
          ilike(products.name, `%${search}%`),
          ilike(products.category, `%${search}%`),
        ),
      );
    }

    const whereClause = and(...conditions);

    // Get total count
    const countResult = await db
      .select({ count: sql<number>`count(*)` })
      .from(products)
      .where(whereClause);

    const total = Number(countResult[0]?.count || 0);

    // Get paginated results
    const results = await db.query.products.findMany({
      where: whereClause,
      limit,
      offset,
      orderBy: (products, { desc }) => [desc(products.createdAt)],
      with: {
        store: true,
      },
    });

    return {
      data: results,
      total,
    };
  }
}
