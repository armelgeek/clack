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
import { UserPaymentMethodsService } from './user-payment-methods.service';
import { CreatePaymentMethodDto } from './dtos/create-payment-method.dto';
import { auth } from '../auth/auth.service';

@ApiTags('user-payment-methods')
@Controller('users/payment-methods')
export class UserPaymentMethodsController {
  constructor(private readonly paymentMethodsService: UserPaymentMethodsService) { }

  @Get()
  @ApiOperation({ summary: 'Get user payment methods' })
  @ApiResponse({
    status: 200,
    description: 'Payment methods retrieved successfully',
  })
  async getPaymentMethods(@Req() req: any) {
    const sessionResult = await auth.api.getSession({
      headers: req.headers,
    });
    const user = sessionResult?.user;
    return this.paymentMethodsService.getPaymentMethods(user.id);
  }

  @Post()
  @ApiOperation({ summary: 'Add new payment method' })
  @ApiResponse({
    status: 201,
    description: 'Payment method created successfully',
  })
  async createPaymentMethod(@Req() req: any, @Body() dto: CreatePaymentMethodDto) {
    const sessionResult = await auth.api.getSession({
      headers: req.headers,
    });
    const user = sessionResult?.user;
    return this.paymentMethodsService.createPaymentMethod(user.id, dto);
  }

  @Delete(':paymentId')
  @ApiOperation({ summary: 'Delete payment method' })
  @ApiResponse({
    status: 200,
    description: 'Payment method deleted successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Payment method not found',
  })
  async deletePaymentMethod(@Req() req: any, @Param('paymentId') paymentId: string) {
    const sessionResult = await auth.api.getSession({
      headers: req.headers,
    });
    const user = sessionResult?.user;
    return this.paymentMethodsService.deletePaymentMethod(user.id, paymentId);
  }

  @Put(':paymentId/default')
  @ApiOperation({ summary: 'Set default payment method' })
  @ApiResponse({
    status: 200,
    description: 'Default payment method set successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Payment method not found',
  })
  async setDefault(@Req() req: any, @Param('paymentId') paymentId: string) {
    const sessionResult = await auth.api.getSession({
      headers: req.headers,
    });
    const user = sessionResult?.user;
    return this.paymentMethodsService.setDefaultPaymentMethod(user.id, paymentId);
  }
}
