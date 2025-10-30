import { Injectable } from '@nestjs/common';
import { db } from '@/database';
import { HeadBand, headBand, NewHeadBand } from '@/database';
import { randomUUID } from 'crypto';
import { eq } from 'drizzle-orm';

@Injectable()
export class HeadbandRepository {
  async getAll() {
    return db.select().from(headBand);
  }

  async getAllActive() {
    return db.select().from(headBand).where(eq(headBand.isActive, true));
  }
  async create(headband: Omit<NewHeadBand, 'id' | 'isActive' | 'createdAt' | 'updatedAt'>): Promise<HeadBand> {
    const [newHeadband] = await db
      .insert(headBand)
      .values({
        id: randomUUID(),
        isActive: true,
        ...headband,
      })
      .returning();
    return newHeadband;
  }

  async updateIsActive(
    id: string,
    isActive: boolean,
  ): Promise<HeadBand | null> {
    const [updatedHeadband] = await db
      .update(headBand)
      .set({ isActive, createdAt: new Date(), updatedAt: new Date() })
      .where(eq(headBand.id, id))
      .returning();

    return updatedHeadband ?? null;
  }

  async update(
    id: string,
    updateData: Partial<NewHeadBand>,
  ): Promise<HeadBand | null> {
    const [updatedHeadband] = await db
      .update(headBand)
      .set({
        ...updateData,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(headBand.id, id))
      .returning();

    return updatedHeadband ?? null;
  }
}
