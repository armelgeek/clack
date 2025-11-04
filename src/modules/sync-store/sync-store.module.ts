import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule } from '@nestjs/config';
import { CacheModule } from '@nestjs/cache-manager';
import { SyncStoreService } from './sync-store.service';
import { StoreModule } from '../store/store.module'; // Import StoreModule
import { ExternalStoreMappingModule } from '../external-store-mappings/external-store-mappings.module'; 
import { StoreRepository } from '../store/store.repository';
@Module({
  imports: [
    HttpModule,
    ConfigModule,
    CacheModule.register(),
    StoreModule, // Add this to get access to StoreRepository
    ExternalStoreMappingModule, // Add this if it exists and exports ExternalStoreMappingRepository
  ],
  providers: [SyncStoreService , StoreRepository],
  exports: [SyncStoreService],
})
export class SyncStoreModule {}
