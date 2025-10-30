import { db } from '@/database/connection';
import { Injectable } from '@nestjs/common';
import { and, eq, ilike, or, sql, isNull } from 'drizzle-orm';
import { products } from '@/database';

@Injectable()
export class ProductRepository {
  async findById(id: string) {
    const result = await db.query.products.findFirst({
      where: eq(products.id, id),
      with: {
        store: true,
      },
    });
    return result;
  }

  async findAll(page: number = 1, limit: number = 10, search?: string, _category?: string) {
    const offset = (page - 1) * limit;

    const conditions = [];

    conditions.push(isNull(products.deletedAt));
    conditions.push(eq(products.status, 'ACTIVATED'));

    if (search) {
      conditions.push(
        or(
          ilike(products.name, `%${search}%`),
          ilike(products.category, `%${search}%`),
        ),
      );
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    const countResult = await db
      .select({ count: sql<number>`count(*)` })
      .from(products)
      .where(whereClause);

    const total = Number(countResult[0]?.count || 0);

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
    _category?: string
  ) {
    const offset = (page - 1) * limit;

    const conditions = [eq(products.storeId, storeId)];

    conditions.push(isNull(products.deletedAt));
    conditions.push(eq(products.status, 'ACTIVATED'));
    if (search) {
      conditions.push(
        or(
          ilike(products.name, `%${search}%`),
          ilike(products.category, `%${search}%`),
        ),
      );
    }

    const whereClause = and(...conditions);

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

  async findSimilar(productId: string, category: string, limit: number = 4) {
    const conditions = and(
      eq(products.category, category),
      eq(products.status, 'ACTIVATED'),
      isNull(products.deletedAt),
      sql`${products.id} != ${productId}`,
    );

    const results = await db.query.products.findMany({
      where: conditions,
      limit,
      orderBy: sql`random()`,
      with: {
        store: true,
      },
    });

    return results;
  }

  // Methods from superadmin for sync functionality
  async getProductById(id: string) {
    // Use a direct expression to avoid callback-based operator typing issues
    return await db.query.products.findFirst({
      where: eq(products.id, id),
    });
  }

  async upsertProduct(productData: any) {
    return await db
      .insert(products)
      .values(productData)
      .onConflictDoUpdate({
        target: [products.id, products.storeId],
        set: productData,
      })
      .execute();
  }

  async countProductsByStoreId(storeId: string) {
    const result = await db
      .select({
        count: sql<number>`cast(count(${products.id}) as int)`,
      })
      .from(products)
      .where(eq(products.storeId, storeId));

    return result[0]?.count ?? 0;
  }

  async countAllProducts() {
    const result = await db
      .select({
        count: sql<number>`cast(count(${products.id}) as int)`,
      })
      .from(products);

    return result[0]?.count ?? 0;
  }
}
