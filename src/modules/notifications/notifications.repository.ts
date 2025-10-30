import { Injectable } from '@nestjs/common';
import { db, notifications } from '@/database';
import { CreateNotificationDto } from './dtos/create-notification.dto';
import { TNotification } from 'types/notification';
import { UpdateNotificationDto } from './dtos/update-notification.dto';
import { inArray, eq, and, or, isNull, desc } from 'drizzle-orm';
import { randomUUID } from 'crypto';

@Injectable()
export class NotificationRepository {
  async createNotification(
    data: CreateNotificationDto,
  ): Promise<TNotification> {
    const [newNotification] = await db
      .insert(notifications)
      .values({
        ...data,
        id: randomUUID(),
      })
      .returning();

    return newNotification;
  }

  async findByUserIdAndPlatform(
    userId: string,
    platform: string,
  ): Promise<TNotification[]> {
    return db.query.notifications.findMany({
      // Use drizzle expression helpers to build the condition
      where: (n) =>
        and(eq(n.platform, platform), or(eq(n.userId, userId), isNull(n.userId))),
      orderBy: (n) => desc(n.createdAt),
      limit: 5,
    });
  }

  async updateNotifications(
    dto: UpdateNotificationDto,
  ): Promise<TNotification[]> {
    if (!dto.notificationIds || dto.notificationIds.length === 0) return [];

    const result = await db
      .update(notifications)
      .set(dto)
      .where(inArray(notifications.id, dto.notificationIds))
      .returning();

    return result;
  }

  /**
   * Insère un tableau de notifications en une seule requête Batch.
   */
  async createNotificationsBatch(notificationsData: CreateNotificationDto[]) {
    return await db.insert(notifications).values(notificationsData).returning();
  }
}
