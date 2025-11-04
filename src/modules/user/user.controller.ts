import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Patch,
  Query,
} from '@nestjs/common';
import { UserService } from './user.service';
import { ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CreateStoreUserDto } from './dto/create-store-user.dto';
import { ApiBearerAuth } from '@nestjs/swagger';
import { UpdateStoreUserStatusDto } from './dto/update-store-user-status.dto';
import { FetchUsersDto } from './dto/fetch-users.dto';
@ApiTags('users')
@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get()
  @ApiOperation({ summary: 'Get all users' })
  @ApiResponse({ status: 200, description: 'List of users' })
  async fetchAllUsers(@Query() dto: FetchUsersDto) {
    return this.userService.fetchAllUsers(dto);
  }

  @Get('store-managers')
  @ApiOperation({ summary: 'Get all store managers' })
  @ApiResponse({ status: 200, description: 'List of store managers' })
  async getStoreManagers() {
    return this.userService.getStoreManagers();
  }

  @ApiBearerAuth()
  @Post('store-users')
  // @UseGuards(AuthGuard, RolesGuard)
  // @Roles(UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Create a user and link them to a store' })
  @ApiResponse({ status: 201, description: 'User created and linked to store' })
  async addUserToStore(@Body() createStoreUserDto: CreateStoreUserDto) {
    return this.userService.createStoreUser(createStoreUserDto);
  }

  @Patch(':storeId/status')
  @ApiOperation({ summary: "Update a user's status for a specific store" })
  @ApiBody({ type: UpdateStoreUserStatusDto })
  @ApiResponse({ status: 201, description: 'User status updated successfully' })
  async updateUserStatus(
    @Param('storeId') storeId: string,
    @Body() body: UpdateStoreUserStatusDto,
  ) {
    const { userId, status } = body;
    return this.userService.updateUserStatus(userId, status, storeId);
  }
}
