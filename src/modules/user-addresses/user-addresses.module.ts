import { Module } from '@nestjs/common';
import { UserAddressesController } from './user-addresses.controller';
import { UserAddressesService } from './user-addresses.service';
import { UserAddressesRepository } from './user-addresses.repository';

@Module({
  controllers: [UserAddressesController],
  providers: [UserAddressesService, UserAddressesRepository],
  exports: [UserAddressesService, UserAddressesRepository],
})
export class UserAddressesModule {}
