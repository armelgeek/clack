import { Module } from '@nestjs/common';
import { AuthModule } from '@thallesp/nestjs-better-auth';
import { auth } from './auth/auth.service';
import { StoreModule } from './store/store.module';
import { StoreUsersModule } from './store-users/store-users.module';
import { ProductModule } from './product/product.module';
import { ConfigModule } from '@nestjs/config';
import configuration from '@/config/configuration';
import { CacheModule } from '@nestjs/cache-manager';
import { ScheduleModule } from '@nestjs/schedule';
import { NotificationModule } from './notifications/notifications.module';
import { NestjsFormDataModule } from 'nestjs-form-data';
import { UserModule } from './user/user.module';
import { FileUploaderModule } from './file-uploader/file-uploader.module';
import { SyncModule } from './sync/sync.module';
import { StoreUserModule } from './store-user/store-user.module';
import { StoreFolderModule } from './store-folder/store-folder.module';
import { HeadbandModule } from './headband/headband.module';
import { ExternalStoreMappingModule } from './external-store-mappings/external-store-mappings.module';
import { redisStore } from 'cache-manager-redis-yet';
import { CategoryModule } from './category/category.module';
import { UserInventoryPreferencesModule } from './user-inventory-preferences/user-inventory-preferences.module';
import { SyncStoreModule } from './sync-store/sync-store.module';
import { StockAlertModule } from './stock-alert/stock-alert.module';
import { CartModule } from './cart/cart.module';
import { SearchModule } from './search/search.module';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
    }),
    CacheModule.register({
      store: redisStore,
      host: process.env.REDIS_HOST || 'localhost',
      port: parseInt(process.env.REDIS_PORT || '6379'),
      password: process.env.REDIS_PASSWORD,
      ttl: 300,
      isGlobal: true,
    }),
    NestjsFormDataModule.config({ isGlobal: true }),
    AuthModule.forRoot(auth),
    StoreModule,
    StoreUsersModule,
    ProductModule,
    NotificationModule,
    UserModule,
    FileUploaderModule,
    SyncModule,
    StoreUserModule,
    StoreFolderModule,
    HeadbandModule,
    ExternalStoreMappingModule,
    CategoryModule,
    UserInventoryPreferencesModule,
    SyncStoreModule,
    StockAlertModule,
    CartModule,
    SearchModule,
  ],
})
export class AppModule {}
