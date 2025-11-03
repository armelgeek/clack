import { Injectable } from '@nestjs/common';
import { UpdatePreferencesDto } from './dtos/update-preferences.dto';
import { v4 as uuidv4 } from 'uuid';
import { db, storeUsers, userInventoryPreferences, users } from '@/database';
import { INVENTORY_DEFAULTS } from 'types/common/constants';
import { UserRole } from 'types/enums/user';
import { and, eq, inArray, isNull, or, sql } from 'drizzle-orm';

const TARGET_ROLES = [
  UserRole.PARTNER,
  UserRole.SALES_ADVISOR,
  UserRole.STORE_MANAGER,
];

@Injectable()
export class UserInventoryPreferencesRepository {
  async getUserInventoryPreferences(userId: string) {
    return await db.query.userInventoryPreferences.findFirst({
      where: (preference, { eq }) => eq(preference.userId, userId),
    });
  }

  async updateUserInventoryPreferences(
    userId: string,
    preferenceData: UpdatePreferencesDto,
  ) {
    const insertData = {
      id: uuidv4(),
      userId: userId,
      isNotified: preferenceData.isNotified ?? INVENTORY_DEFAULTS.IS_NOTIFIED,
      minThreshold:
        preferenceData.minThreshold ?? INVENTORY_DEFAULTS.MIN_THRESHOLD,
    };

    const updatedPreferences = await db
      .insert(userInventoryPreferences)
      .values(insertData)
      .onConflictDoUpdate({
        target: userInventoryPreferences.userId,
        set: preferenceData,
      })
      .returning();

    return updatedPreferences[0];
  }

  /**
   * Récupère les IDs des utilisateurs ciblés pour la notification de stock.
   * Inclut les utilisateurs :
   * 1. Qui ont explicitement activé les notifications (isNotified = true).
   * 2. Qui n'ont PAS de préférence enregistrée, et sont donc par défaut notifiés (INVENTORY_DEFAULTS.IS_NOTIFIED).
   *
   * NOTE : Cette fonction suppose l'existence d'une table 'users'
   * et d'une colonne 'role' pour le filtrage initial.
   */
  async getTargetUsersForStockAlert() {
    const defaultIsNotified = INVENTORY_DEFAULTS.IS_NOTIFIED;

    const defaultNotificationCondition = isNull(
      userInventoryPreferences.userId,
    );

    // Si INVENTORY_DEFAULTS.IS_NOTIFIED est false, la Condition 2 doit être ignorée
    const defaultCaseClause = defaultIsNotified
      ? defaultNotificationCondition
      : undefined;

    const notificationConditions = [
      eq(userInventoryPreferences.isNotified, true),
      defaultCaseClause,
    ].filter(Boolean);

    const result = await db
      .select({
        userId: users.id,
        storeId: storeUsers.storeId,
        threshold:
          sql<number>`coalesce(${userInventoryPreferences.minThreshold}, ${INVENTORY_DEFAULTS.MIN_THRESHOLD})`.as(
            'threshold',
          ),
      })
      .from(users)
      .leftJoin(
        userInventoryPreferences,
        eq(users.id, userInventoryPreferences.userId),
      )
      .leftJoin(storeUsers, eq(users.id, storeUsers.userId))
      .where(
        and(inArray(users.role, TARGET_ROLES), or(...notificationConditions)),
      );

    return result;
  }
}
