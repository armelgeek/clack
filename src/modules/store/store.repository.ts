import { db } from '@/database/connection';
import { Injectable } from '@nestjs/common';
import {
  and,
  eq,
  ilike,
  or,
  sql,
  isNull,
  count as drizzleCount,
  inArray,
} from 'drizzle-orm';
import {
  NewStore,
  Store,
  stores,
  storeFolders,
  storeUsers,
  users,
} from '@/database';
import { UpdateStoreDto } from './dtos/update-store.dto';

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

  async create(data: NewStore): Promise<Store> {
    const [store] = await db.insert(stores).values(data).returning();
    return store;
  }

  async findByIdWithStoreUsers(id: string) {
    const result = await db.query.stores.findFirst({
      where: (s, { eq }) => eq(s.id, id),
      with: {
        storeUsers: {
          with: {
            user: true,
          },
        },
      },
    });
    return result;
  }

  async findAllWithAdmins(
    page: number,
    limit: number,
    search?: string,
    folderId?: string,
  ) {
    const offset = (page - 1) * limit;

    const filters = [
      search ? ilike(stores.name, `%${search}%`) : undefined,
      folderId ? eq(storeFolders.id, folderId) : undefined,
    ].filter(Boolean);

    const totalCountResult = await db
      .select({ count: drizzleCount() })
      .from(stores)
      .leftJoin(storeFolders, eq(storeFolders.storeId, stores.id))
      .where(filters.length ? and(...filters) : undefined);

    const totalCount = Number(totalCountResult[0]?.count || 0);

    const storeRows = await db
      .select({
        id: stores.id,
        name: stores.name,
        status: stores.status,
        createdAt: stores.createdAt,
      })
      .from(stores)
      .leftJoin(storeFolders, eq(storeFolders.storeId, stores.id))
      .where(filters.length ? and(...filters) : undefined)
      .orderBy(sql`${stores.createdAt} DESC`)
      .offset(offset)
      .limit(limit);

    const storeIds = storeRows.map((s) => s.id);

    const usersResult =
      storeIds.length > 0
        ? await db
            .select({ storeId: storeUsers.storeId, user: users })
            .from(storeUsers)
            .leftJoin(users, eq(storeUsers.userId, users.id))
            .where(inArray(storeUsers.storeId, storeIds))
        : [];

    const storeMap = new Map<string, any>();
    for (const store of storeRows) {
      storeMap.set(store.id, {
        id: store.id,
        name: store.name,
        isActive: store.status === 'ACTIVATED',
        createdAt: store.createdAt,
        admins: [],
      });
    }

    for (const row of usersResult) {
      const store = storeMap.get(row.storeId);
      if (store && row.user) {
        store.admins.push({
          id: row.user.id,
          name: row.user.name,
          email: row.user.email,
          role: row.user.role,
          status: row.user.status,
          phoneNumber: row.user.phoneNumber,
        });
      }
    }

    const formatted = Array.from(storeMap.values()).map((s) => ({
      ...s,
      adminCount: s.admins.length,
    }));

    const totalPages = Math.ceil(totalCount / limit);

    return {
      data: formatted,
      totalPages,
      currentPage: page,
      totalCount,
    };
  }

  async updateStore(storeId: string, storeData: UpdateStoreDto) {
    const updatedStores = await db
      .update(stores)
      .set(storeData)
      .where(eq(stores.id, storeId))
      .returning();
    return updatedStores[0];
  }
}
