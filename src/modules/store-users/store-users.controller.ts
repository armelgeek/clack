import { Controller, Get, Param } from '@nestjs/common';
import { TStore } from 'types/store';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { StoreUsersService } from './store-users.service';

@ApiTags('store-users')
@Controller('store-users')
export class StoreUsersController {
  constructor(private readonly storeUsersService: StoreUsersService) {}

  @Get(':userId')
  @ApiOperation({ summary: 'Get store by user id' })
  @ApiResponse({
    status: 200,
    description: 'Store fetched successfully',
  })
  @ApiResponse({
    status: 500,
    description: 'Error while fetching store',
  })
  getOne(@Param('userId') userId: string): Promise<TStore> {
    return this.storeUsersService.getStoreByUserId(userId);
  }
}
