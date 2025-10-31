import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { UserInventoryPreferencesRepository } from './user-inventory-preferences.repository';
import { UserRepository } from '../user/user.repository';
import { UserRole } from 'types/enums/user';
import { InventoryPreference } from 'types/user';
import { INVENTORY_DEFAULTS } from 'types/common/constants';
import { UpdatePreferencesDto } from './dtos/update-preferences.dto';

@Injectable()
export class UserInventoryPreferencesService {
  private readonly logger = new Logger(UserInventoryPreferencesService.name);

  constructor(
    private readonly userInventoryPreferencesRepository: UserInventoryPreferencesRepository,
    private readonly userRepository: UserRepository,
  ) {}

  async getUserInventoryPreferences(
    userId: string,
  ): Promise<InventoryPreference> {
    try {
      const user = await this.userRepository.findById(userId);
      if (!user) {
        this.logger.error('User not found');
        throw new NotFoundException('User not found');
      }

      const preference =
        await this.userInventoryPreferencesRepository.getUserInventoryPreferences(
          userId,
        );

      if (
        !preference &&
        [
          UserRole.PARTNER,
          UserRole.SALES_ADVISOR,
          UserRole.STORE_MANAGER,
        ].includes(user.role as UserRole)
      ) {
        return {
          userId: user.id,
          isNotified: INVENTORY_DEFAULTS.IS_NOTIFIED,
          minThreshold: INVENTORY_DEFAULTS.MIN_THRESHOLD,
        };
      }
      return preference;
    } catch (e) {
      this.logger.error('Error fetching user inventory preferences', e);
    }
  }

  async updateUserPreferences(
    userId: string,
    preferenceData: UpdatePreferencesDto,
  ) {
    try {
      console.log(preferenceData);
      const user = await this.userRepository.findById(userId);
      if (!user) {
        this.logger.error('User not found');
        throw new NotFoundException('User not found');
      }

      const updatedPreferences =
        await this.userInventoryPreferencesRepository.updateUserInventoryPreferences(
          userId,
          preferenceData,
        );
      return updatedPreferences;
    } catch (e) {
      this.logger.error('Error updating user inventory preferences', e);
    }
  }
}
