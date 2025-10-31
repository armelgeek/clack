import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { TStore } from 'types/store';
import { StoreStatus } from 'types/enums/store';
import { PaginatedResponse, PaginationMeta } from 'types/common/pagination';
import { StoreRepository } from './store.repository';
import { CreateNotificationDto } from '../notifications/dtos/create-notification.dto';
import {
  NotificationPlatform,
  NotificationType,
} from 'types/enums/notification';
import { StoreStatusGateway } from '../notifications/gateway/store-status.gateway';
import { NotificationRepository } from '../notifications/notifications.repository';
import { UserRepository } from '../user/user.repository';
import { UpdateStoreDto } from './dtos/update-store.dto';
import { UserRole } from 'types/enums/user';

@Injectable()
export class StoreService {
  private readonly logger = new Logger(StoreService.name);

  constructor(
    private readonly storeRepository: StoreRepository,
    private readonly storeStatusGateway: StoreStatusGateway,
    private readonly notificationRepository: NotificationRepository,
    private readonly userRepository: UserRepository,
  ) {}

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

  async updateStore(storeId: string, data: UpdateStoreDto) {
    const store = await this.getStoreById(storeId);

    if (!store) {
      this.logger.error('Store not found');
      throw new NotFoundException('Store not found');
    }

    const updatedStore = await this.storeRepository.updateStore(storeId, data);

    if (data.status && updatedStore.status !== store.status) {
      const newStatus: StoreStatus = updatedStore.status as StoreStatus;

      const baseNotificationData: CreateNotificationDto = {
        type: NotificationType.STORE_STATUS_CHANGE,
        data: {
          storeId: updatedStore.id,
          storeName: updatedStore.name,
          newStatus: newStatus,
        },
        platform: NotificationPlatform.SUPER_ADMIN,
      };

      const superAdminUsers = await this.userRepository.findUserIdsByRole(
        UserRole.SUPER_ADMIN,
      );

      const notificationsToInsert: CreateNotificationDto[] = [];

      for (const adminUser of superAdminUsers) {
        notificationsToInsert.push({
          ...baseNotificationData,
          userId: adminUser.id,
        });
      }

      const newNotifications =
        await this.notificationRepository.createNotificationsBatch(
          notificationsToInsert,
        );

      for (const notification of newNotifications) {
        this.storeStatusGateway.notifyStoreStatusChange(notification);
      }
    }

    return updatedStore;
  }
}
