import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Put,
  Query,
  Req,
} from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags, ApiQuery } from '@nestjs/swagger';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dtos/create-order.dto';
import { CancelOrderDto } from './dtos/cancel-order.dto';
import { RateOrderDto } from './dtos/rate-order.dto';
import { ReturnOrderDto } from './dtos/return-order.dto';
import { ConfirmDeliveryDto } from './dtos/confirm-delivery.dto';
import { auth } from '../auth/auth.service';

@ApiTags('orders')
@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post()
  @ApiOperation({ summary: 'Create order from cart' })
  @ApiResponse({
    status: 201,
    description: 'Order created successfully',
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - cart is empty or invalid',
  })
  async createOrder(@Req() req: any, @Body() dto: CreateOrderDto) {

    const sessionResult = await auth.api.getSession({ headers: req.headers });
    
    return this.ordersService.createOrder(sessionResult.user.id, dto);
  }

  @Get()
  @ApiOperation({ summary: 'Get user orders' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiResponse({
    status: 200,
    description: 'Orders retrieved successfully',
  })
  async getOrders(
    @Req() req: any,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) { 
    const sessionResult = await auth.api.getSession({
      headers: req.headers,
    });
    const user = sessionResult?.user;
    return this.ordersService.getOrders(user.id, page || 1, limit || 10);
  }

  @Get('statistics')
  @ApiOperation({ summary: 'Get order statistics' })
  @ApiResponse({
    status: 200,
    description: 'Statistics retrieved successfully',
  })
  async getStatistics(@Req() req: any) {
    const sessionResult = await auth.api.getSession({
      headers: req.headers,
    });
    const user = sessionResult?.user;
    return this.ordersService.getOrderStatistics(user.id);
  }

  @Get(':orderId')
  @ApiOperation({ summary: 'Get order details' })
  @ApiResponse({
    status: 200,
    description: 'Order retrieved successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Order not found',
  })
  async getOrder(@Req() req: any, @Param('orderId') orderId: string) {
    const sessionResult = await auth.api.getSession({
      headers: req.headers,
    });
    const user = sessionResult?.user;
    return this.ordersService.getOrderById(user.id, orderId);
  }

  @Put(':orderId/cancel')
  @ApiOperation({ summary: 'Cancel order' })
  @ApiResponse({
    status: 200,
    description: 'Order cancelled successfully',
  })
  @ApiResponse({
    status: 400,
    description: 'Cannot cancel order',
  })
  @ApiResponse({
    status: 404,
    description: 'Order not found',
  })
  async cancelOrder(
    @Req() req: any,
    @Param('orderId') orderId: string,
    @Body() dto: CancelOrderDto,
  ) {
    const sessionResult = await auth.api.getSession({
      headers: req.headers,
    });
    const user = sessionResult?.user;
    return this.ordersService.cancelOrder(user.id, orderId, dto.reason);
  }

  @Post(':orderId/return')
  @ApiOperation({ summary: 'Request order return' })
  @ApiResponse({
    status: 200,
    description: 'Return request submitted successfully',
  })
  @ApiResponse({
    status: 400,
    description: 'Cannot return order',
  })
  @ApiResponse({
    status: 404,
    description: 'Order not found',
  })
  async returnOrder(
    @Req() req: any,
    @Param('orderId') orderId: string,
    @Body() dto: ReturnOrderDto,
  ) {
    const sessionResult = await auth.api.getSession({
      headers: req.headers,
    });
    const user = sessionResult?.user;
    return this.ordersService.returnOrder(user.id, orderId, dto);
  }

  @Get(':orderId/return-status')
  @ApiOperation({ summary: 'Get order return status' })
  @ApiResponse({
    status: 200,
    description: 'Return status retrieved successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Order not found',
  })
  async getReturnStatus(@Req() req: any, @Param('orderId') orderId: string) {
    const sessionResult = await auth.api.getSession({
      headers: req.headers,
    });
    const user = sessionResult?.user;
    return this.ordersService.getReturnStatus(user.id, orderId);
  }

  @Post(':orderId/rating')
  @ApiOperation({ summary: 'Rate order' })
  @ApiResponse({
    status: 201,
    description: 'Order rated successfully',
  })
  @ApiResponse({
    status: 400,
    description: 'Cannot rate order',
  })
  @ApiResponse({
    status: 404,
    description: 'Order not found',
  })
  async rateOrder(
    @Req() req: any,
    @Param('orderId') orderId: string,
    @Body() dto: RateOrderDto,
  ) {
    const sessionResult = await auth.api.getSession({
      headers: req.headers,
    });
    const user = sessionResult?.user;
    return this.ordersService.rateOrder(user.id, orderId, dto);
  }

  @Get(':orderId/tracking')
  @ApiOperation({ summary: 'Get order tracking' })
  @ApiResponse({
    status: 200,
    description: 'Tracking information retrieved successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Order not found',
  })
  async getTracking(@Req() req: any, @Param('orderId') orderId: string) {
    const sessionResult = await auth.api.getSession({
      headers: req.headers,
    });
    const user = sessionResult?.user;
    return this.ordersService.getOrderTracking(user.id, orderId);
  }

  @Get(':orderId/invoice')
  @ApiOperation({ summary: 'Get order invoice' })
  @ApiResponse({
    status: 200,
    description: 'Invoice URL retrieved successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Order not found',
  })
  async getInvoice(@Req() req: any, @Param('orderId') orderId: string) {
    const sessionResult = await auth.api.getSession({
      headers: req.headers,
    });
    const user = sessionResult?.user;
    return this.ordersService.getOrderInvoice(user.id, orderId);
  }

  @Post(':orderId/confirm-delivery')
  @ApiOperation({ summary: 'Confirm delivery receipt' })
  @ApiResponse({
    status: 200,
    description: 'Delivery confirmed successfully',
  })
  @ApiResponse({
    status: 400,
    description: 'Order not in delivery status',
  })
  @ApiResponse({
    status: 404,
    description: 'Order not found',
  })
  async confirmDelivery(
    @Req() req: any,
    @Param('orderId') orderId: string,
    @Body() dto: ConfirmDeliveryDto,
  ) {
    const sessionResult = await auth.api.getSession({
      headers: req.headers,
    });
    const user = sessionResult?.user;
    return this.ordersService.confirmDelivery(user.id, orderId, dto);
  }
}
