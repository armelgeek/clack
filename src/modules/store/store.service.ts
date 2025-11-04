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
import { StoreFolderRepository } from '../store-folder/store-folder.repository';
import { ExternalStoreMappingRepository } from '../external-store-mappings/external-store-mappings.repository';
import { Store } from '@/database';
import { CreateStoreDto } from './dtos/create-store.dto';
import { randomUUID } from 'crypto';
import { TStoreAdmin } from 'types/store';
@Injectable()
export class StoreService {
  private readonly logger = new Logger(StoreService.name);

  constructor(
    private readonly storeRepository: StoreRepository,
    private readonly storeStatusGateway: StoreStatusGateway,
    private readonly notificationRepository: NotificationRepository,
    private readonly userRepository: UserRepository,
    private readonly storeFolderRepository: StoreFolderRepository,
    private readonly externalStoreMappingRepository: ExternalStoreMappingRepository,
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


  async getStoreByIdWithAdmin(id: string): Promise<TStoreAdmin> {
    const store = await this.storeRepository.findByIdWithStoreUsers(id);

    if (!store) {
      this.logger.error('Store not found');
      throw new NotFoundException('Store not found');
    }

    const { storeUsers, ...rest } = store;

    return {
      ...rest,
      latitude: store.latitude !== null ? Number(store.latitude) : null,
      longitude: store.longitude !== null ? Number(store.longitude) : null,
      status: store.status as StoreStatus,
      openingHours: store.openingHours as any,
      admins: storeUsers.map((su) => ({
        id: su.user.id,
        name: su.user.name,
        email: su.user.email,
        phoneNumber: su.user.phoneNumber,
        role: su.user.role,
        status: su.user.status,
        createdAt: su.user.createdAt,
      })),
    };
  }
  async updateStoreStatus(
    storeId: string,
    status: StoreStatus,
  ): Promise<Store> {
    if (!status) {
      this.logger.error('Invalid status value');
    }
    const updatedStore = await this.storeRepository.updateStore(
      storeId, { status }
    );
    return updatedStore;
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

  async getStoresWithAdmins(
    page: number,
    limit: number,
    search?: string,
    folderId?: string,
  ) {
    const result = await this.storeRepository.findAllWithAdmins(
      page,
      limit,
      search,
      folderId,
    );

    if (result.data.length === 0) {
      this.logger.warn('No stores found');
      return {
        data: [],
        totalPages: result.totalPages,
        currentPage: result.currentPage,
        totalCount: result.totalCount,
      };
    }

    return {
      data: result.data.map((store) => ({
        id: store.id,
        name: store.name,
        isActive: store.isActive,
        admins: store.admins,
        adminCount: store.adminCount,
        createdAt: store.createdAt,
      })),
      totalPages: result.totalPages,
      currentPage: result.currentPage,
      totalCount: result.totalCount,
    };
  }

  async createStore(dto: CreateStoreDto): Promise<Store> {
    const store = await this.storeRepository.create({
      id: randomUUID(),
      ...dto,
      latitude: dto.latitude !== undefined ? String(dto.latitude) : undefined,
      longitude:
        dto.longitude !== undefined ? String(dto.longitude) : undefined,
    });

    if (dto.externalCompanyId) {
      await this.externalStoreMappingRepository.create({
        externalCompanyId: dto.externalCompanyId,
        storeId: store.id,
      });
      this.logger.log(
        `Mapping created for store ${store.id} and company ${dto.externalCompanyId}`,
      );
    }

    if (dto.folderId) {
      await this.storeFolderRepository.storeToFolder(store.id, dto.folderId);
      this.logger.log(
        `Store ${store.id} assigned to folder ${dto.folderId}`,
      );
    }

    return store;
  }

  
}

