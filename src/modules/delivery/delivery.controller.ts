import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Req,
} from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { DeliveryService } from './delivery.service';
import { SendMessageDto } from './dtos/send-message.dto';
import { auth } from '../auth/auth.service';

@ApiTags('delivery')
@Controller('delivery')
export class DeliveryController {
  constructor(private readonly deliveryService: DeliveryService) {}

  @Get(':orderId/tracking')
  @ApiOperation({ summary: 'Get real-time delivery tracking for an order' })
  @ApiResponse({
    status: 200,
    description: 'Delivery tracking retrieved successfully',
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
    return this.deliveryService.getDeliveryTracking(user.id, orderId);
  }

  @Get(':orderId/status-updates')
  @ApiOperation({ summary: 'Get lightweight status updates (for frequent polling)' })
  @ApiResponse({
    status: 200,
    description: 'Status updates retrieved successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Order not found',
  })
  async getStatusUpdates(@Req() req: any, @Param('orderId') orderId: string) {
    const sessionResult = await auth.api.getSession({
      headers: req.headers,
    });
    const user = sessionResult?.user;
    return this.deliveryService.getStatusUpdates(user.id, orderId);
  }

  @Post(':orderId/call-driver')
  @ApiOperation({ summary: 'Initiate a call to the driver' })
  @ApiResponse({
    status: 200,
    description: 'Call initiated successfully',
  })
  @ApiResponse({
    status: 400,
    description: 'Driver not available or delivery not assigned',
  })
  @ApiResponse({
    status: 404,
    description: 'Order not found',
  })
  async callDriver(@Req() req: any, @Param('orderId') orderId: string) {
    const sessionResult = await auth.api.getSession({
      headers: req.headers,
    });
    const user = sessionResult?.user;
    return this.deliveryService.callDriver(user.id, orderId);
  }

  @Post(':orderId/message')
  @ApiOperation({ summary: 'Send a message to the driver' })
  @ApiResponse({
    status: 200,
    description: 'Message sent successfully',
  })
  @ApiResponse({
    status: 400,
    description: 'Driver not available for messages',
  })
  @ApiResponse({
    status: 404,
    description: 'Order not found',
  })
  async sendMessage(
    @Req() req: any,
    @Param('orderId') orderId: string,
    @Body() dto: SendMessageDto,
  ) {
    const sessionResult = await auth.api.getSession({
      headers: req.headers,
    });
    const user = sessionResult?.user;
    return this.deliveryService.sendMessage(user.id, orderId, dto.message);
  }

  @Post(':orderId/mark-received')
  @ApiOperation({ summary: 'Mark order as received by customer' })
  @ApiResponse({
    status: 200,
    description: 'Order marked as received successfully',
  })
  @ApiResponse({
    status: 400,
    description: 'Order not ready to be marked as received',
  })
  @ApiResponse({
    status: 404,
    description: 'Order not found',
  })
  async markReceived(@Req() req: any, @Param('orderId') orderId: string) {
    const sessionResult = await auth.api.getSession({
      headers: req.headers,
    });
    const user = sessionResult?.user;
    return this.deliveryService.markReceived(user.id, orderId);
  }
}
