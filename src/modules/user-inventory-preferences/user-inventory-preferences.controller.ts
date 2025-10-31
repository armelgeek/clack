import { Body, Controller, Get, Param, Put } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { UserInventoryPreferencesService } from './user-inventory-preferences.service';
import { InventoryPreference } from 'types/user';
import { UpdatePreferencesDto } from './dtos/update-preferences.dto';

@ApiTags('user-inventory-preferences')
@Controller('user-inventory-preferences')
export class UserInventoryPreferencesController {
  constructor(
    private readonly userInventoryPreferencesService: UserInventoryPreferencesService,
  ) {}

  @Get(':userId')
  @ApiOperation({ summary: 'Get inventory preferences by user' })
  @ApiResponse({
    status: 200,
    description: 'User inventory preferences fetched successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'User not found',
    type: null,
  })
  @ApiResponse({
    status: 500,
    description: 'Error while fetching category',
  })
  async getUserInventoryPreferences(
    @Param('userId') userId: string,
  ): Promise<InventoryPreference> {
    return this.userInventoryPreferencesService.getUserInventoryPreferences(
      userId,
    );
  }

  @Put(':userId')
  @ApiOperation({ summary: 'Update inventory preferences by user' })
  @ApiResponse({
    status: 200,
    description: 'User inventory preferences updated successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'User not found',
    type: null,
  })
  @ApiResponse({
    status: 500,
    description: 'Error while updating category',
  })
  async updateUserPreferences(
    @Param('userId') userId: string,
    @Body() preferenceData: UpdatePreferencesDto,
  ) {
    return this.userInventoryPreferencesService.updateUserPreferences(
      userId,
      preferenceData,
    );
  }
}
