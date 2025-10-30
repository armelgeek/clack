import { Module } from '@nestjs/common';
import { StoreUsersService } from './store-users.service';
import { StoreUsersRepository } from './store-users.repository';
import { StoreUsersController } from './store-users.controller';

@Module({
  controllers: [StoreUsersController],
  providers: [StoreUsersService, StoreUsersRepository],
  exports: [StoreUsersService],
})
export class StoreUsersModule {}
