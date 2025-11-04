import { Module } from '@nestjs/common';
import { StoreService } from './store.service';
import { StoreController } from './store.controller';
import { StoreRepository } from './store.repository';
import { ProductModule } from '../product/product.module';
import { StoreStatusGateway } from '../notifications/gateway/store-status.gateway';
import { NotificationRepository } from '../notifications/notifications.repository';
import { UserRepository } from '../user/user.repository';
import { StoreFolderRepository } from '../store-folder/store-folder.repository';
import { ExternalStoreMappingRepository } from '../external-store-mappings/external-store-mappings.repository';

@Module({
  imports: [ProductModule],
  controllers: [StoreController],
  providers: [
    StoreRepository,
    StoreService,
    StoreStatusGateway,
    NotificationRepository,
    UserRepository,
    StoreFolderRepository,
    ExternalStoreMappingRepository,
  ],
  exports: [StoreService ,StoreRepository],
})
export class StoreModule {}
