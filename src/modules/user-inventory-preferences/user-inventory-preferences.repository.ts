import { Injectable } from '@nestjs/common';
import { UpdatePreferencesDto } from './dtos/update-preferences.dto';
import { v4 as uuidv4 } from 'uuid';
import { db, userInventoryPreferences } from '@/database';
import { INVENTORY_DEFAULTS } from 'types/common/constants';

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
}
