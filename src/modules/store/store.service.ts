import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { TStore } from 'types/store';
import { StoreStatus } from 'types/enums/store';
import { StoreRepository } from './store.repository';

@Injectable()
export class StoreService {
  private readonly logger = new Logger(StoreService.name);

  constructor(private readonly storeRepository: StoreRepository) {}

  async getStoreById(id: string): Promise<TStore> {
    const store = await this.storeRepository.findById(id);

    if (!store) {
      this.logger.error('Store not found');
      throw new NotFoundException('Store not found');
    }

    return {
      ...store,
      latitude: store.latitude !== null ? Number(store.latitude) : null,
      longitude: store.longitude !== null ? Number(store.longitude) : null,
      status: store.status as StoreStatus,
      openingHours: store.openingHours as any,
    };
  }
}
