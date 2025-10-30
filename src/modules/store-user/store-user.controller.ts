import { Controller, Delete, Param } from '@nestjs/common';
import { StoreUserService } from './store-user.service';
import { ApiTags } from '@nestjs/swagger';
@ApiTags('Store Users')
@Controller('store-users')
export class StoreUserController {
  constructor(private readonly service: StoreUserService) {}

  @Delete(':storeId/:userId')
  async removeUserFromStore(
    @Param('storeId') storeId: string,
    @Param('userId') userId: string,
  ) {
    await this.service.removeStoreUser(userId, storeId);
    return { message: `User ${userId} removed from store ${storeId}` };
  }
}
