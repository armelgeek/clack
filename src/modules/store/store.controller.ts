import { Controller, Get, Param } from '@nestjs/common';
import { StoreService } from './store.service';
import { TStore } from 'types/store';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

@ApiTags('stores')
@Controller('stores')
export class StoreController {
  constructor(private readonly storeService: StoreService) {}

  @Get(':id')
  @ApiOperation({ summary: 'Get store by id' })
  @ApiResponse({
    status: 200,
    description: 'Store fetched successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Store not found',
    type: null,
  })
  @ApiResponse({
    status: 500,
    description: 'Error while fetching store',
  })
  getOne(@Param('id') id: string): Promise<TStore> {
    return this.storeService.getStoreById(id);
  }
}
