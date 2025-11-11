import { Body, Controller, Post, Req } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { PaymentService } from './payment.service';
import { CreatePaymentIntentDto } from './dtos/payment-intent.dto';
import { ConfirmPaymentDto } from './dtos/confirm-payment.dto';
import { auth } from '../auth/auth.service';

@ApiTags('payment')
@Controller('payment')
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) { }

  @Post('intent')
  @ApiOperation({ summary: 'Create payment intent (mock)' })
  @ApiResponse({
    status: 201,
    description: 'Payment intent created successfully',
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request',
  })
  async createIntent(@Req() req: any, @Body() dto: CreatePaymentIntentDto) {
    const sessionResult = await auth.api.getSession({
      headers: req.headers,
    });

    return this.paymentService.createPaymentIntent(sessionResult.user.id, dto);
  }

  @Post('confirm')
  @ApiOperation({ summary: 'Confirm payment (mock)' })
  @ApiResponse({
    status: 200,
    description: 'Payment confirmed',
  })
  @ApiResponse({
    status: 400,
    description: 'Payment failed',
  })
  async confirmPayment(@Req() req: any, @Body() dto: ConfirmPaymentDto) {
     const sessionResult = await auth.api.getSession({
      headers: req.headers,
    });
    return this.paymentService.confirmPayment(sessionResult.user.id, dto);
  }

  @Post('webhook')
  @ApiOperation({ summary: 'Payment webhook handler (mock)' })
  @ApiResponse({
    status: 200,
    description: 'Webhook processed',
  })
  async handleWebhook(@Body() payload: any) {
    return this.paymentService.handleWebhook(payload);
  }

  @Post('simulate-error')
  @ApiOperation({ summary: 'Simulate payment error for testing' })
  @ApiResponse({
    status: 200,
    description: 'Error simulated',
  })
  async simulateError(@Body() body: { type: 'declined' | 'timeout' | '3d_secure' }) {
    return this.paymentService.simulatePaymentError(body.type);
  }
}
