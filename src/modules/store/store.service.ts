import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { TStore } from 'types/store';
import { StoreStatus } from 'types/enums/store';
import { PaginatedResponse, PaginationMeta } from 'types/common/pagination';
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

    return this.transformStore(store);
  }

  async getAllStores(
    page: number = 1,
    limit: number = 10,
    search?: string,
    region?: string,
  ): Promise<PaginatedResponse<TStore>> {
    const { data, total } = await this.storeRepository.findAll(
      page,
      limit,
      search,
      region,
    );

    const transformedData = data.map((store) => this.transformStore(store));

    const meta: PaginationMeta = {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    };

    return {
      data: transformedData,
      meta,
    };
  }

  private transformStore(store: any): TStore {
    return {
      ...store,
      latitude: store.latitude !== null ? Number(store.latitude) : null,
      longitude: store.longitude !== null ? Number(store.longitude) : null,
      status: store.status as StoreStatus,
      openingHours: store.openingHours as any,
    };
  }
}
