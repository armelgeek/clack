import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Req,
} from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { UserAddressesService } from './user-addresses.service';
import { CreateAddressDto } from './dtos/create-address.dto';
import { UpdateAddressDto } from './dtos/update-address.dto';
import { auth } from '../auth/auth.service';

@ApiTags('user-addresses')
@Controller('users/addresses')
export class UserAddressesController {
  constructor(private readonly addressesService: UserAddressesService) { }

  @Get()
  @ApiOperation({ summary: 'Get user addresses' })
  @ApiResponse({
    status: 200,
    description: 'Addresses retrieved successfully',
  })
  async getAddresses(@Req() req: any) {
    const sessionResult = await auth.api.getSession({
      headers: req.headers,
    });
    const user = sessionResult?.user;
    return this.addressesService.getAddresses(user.id);
  }

  @Post()
  @ApiOperation({ summary: 'Add new address' })
  @ApiResponse({
    status: 201,
    description: 'Address created successfully',
  })
  async createAddress(@Req() req: any, @Body() dto: CreateAddressDto) {
    const sessionResult = await auth.api.getSession({
      headers: req.headers,
    });
    const user = sessionResult?.user;
    return this.addressesService.createAddress(user.id, dto);
  }

  @Put(':addressId')
  @ApiOperation({ summary: 'Update address' })
  @ApiResponse({
    status: 200,
    description: 'Address updated successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Address not found',
  })
  async updateAddress(
    @Req() req: any,
    @Param('addressId') addressId: string,
    @Body() dto: UpdateAddressDto,
  ) {
    const sessionResult = await auth.api.getSession({
      headers: req.headers,
    });
    const user = sessionResult?.user;
    return this.addressesService.updateAddress(user.id, addressId, dto);
  }

  @Delete(':addressId')
  @ApiOperation({ summary: 'Delete address' })
  @ApiResponse({
    status: 200,
    description: 'Address deleted successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Address not found',
  })
  async deleteAddress(@Req() req: any, @Param('addressId') addressId: string) {
    const sessionResult = await auth.api.getSession({
      headers: req.headers,
    });
    const user = sessionResult?.user;
    return this.addressesService.deleteAddress(user.id, addressId);
  }

  @Put(':addressId/default')
  @ApiOperation({ summary: 'Set default address' })
  @ApiResponse({
    status: 200,
    description: 'Default address set successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Address not found',
  })
  async setDefault(@Req() req: any, @Param('addressId') addressId: string) {
    const sessionResult = await auth.api.getSession({
      headers: req.headers,
    });
    const user = sessionResult?.user;
    return this.addressesService.setDefaultAddress(user.id, addressId);
  }
}
