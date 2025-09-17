import { Module } from '@nestjs/common';
import { StoreService } from './store.service';
import { StoreController } from './store.controller';
import { StoreRepository } from './store.repository';

@Module({
  controllers: [StoreController],
  providers: [StoreRepository, StoreService],
  exports: [StoreService],
})
export class StoreModule {}
