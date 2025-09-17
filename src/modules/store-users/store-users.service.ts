import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { TStore } from 'types/store';
import { StoreUsersRepository } from './store-users.repository';
import { StoreStatus } from 'types/enums/store';

@Injectable()
export class StoreUsersService {
  private readonly logger = new Logger(StoreUsersService.name);

  constructor(private readonly storeUsersRepository: StoreUsersRepository) {}

  async getStoreByUserId(userId: string): Promise<TStore> {
    const result = await this.storeUsersRepository.findByUserId(userId);

    if (!result) {
      this.logger.error('User not found');
      throw new NotFoundException('User not found');
    }

    const storeId = result.storeId;
    if (!storeId) {
      this.logger.error('User not associated to any store');
      throw new NotFoundException('User not associated to any store');
    }

    const store = result.store;
    return {
      ...store,
      latitude: store.latitude !== null ? Number(store.latitude) : null,
      longitude: store.longitude !== null ? Number(store.longitude) : null,
      status: store.status as StoreStatus,
      openingHours: store.openingHours as any,
    };
  }
}
