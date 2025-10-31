import { Module } from '@nestjs/common';
import { UserRepository } from '../user/user.repository';
import { UserInventoryPreferencesController } from './user-inventory-preferences.controller';
import { UserInventoryPreferencesRepository } from './user-inventory-preferences.repository';
import { UserInventoryPreferencesService } from './user-inventory-preferences.service';

@Module({
  controllers: [UserInventoryPreferencesController],
  providers: [
    UserInventoryPreferencesService,
    UserInventoryPreferencesRepository,
    UserRepository,
  ],
  exports: [UserInventoryPreferencesService],
})
export class UserInventoryPreferencesModule {}
