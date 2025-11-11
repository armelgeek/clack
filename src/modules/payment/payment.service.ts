import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { OrdersRepository } from '../orders/orders.repository';
import { CreatePaymentIntentDto } from './dtos/payment-intent.dto';
import { ConfirmPaymentDto } from './dtos/confirm-payment.dto';
import { v4 as uuidv4 } from 'uuid';

interface WebhookPayload {
  eventType: string;
  data: {
    paymentIntentId?: string;
    [key: string]: any;
  };
}

@Injectable()
export class PaymentService {
  private readonly logger = new Logger(PaymentService.name);
  
  // Mock storage for payment intents
  private readonly paymentIntents = new Map<string, any>();

  constructor(private readonly ordersRepository: OrdersRepository) {}

  async createPaymentIntent(userId: string, dto: CreatePaymentIntentDto) {
    this.logger.log(`Creating mock payment intent for user ${userId}`);

    // Verify order exists
    const order = await this.ordersRepository.findOrderById(dto.orderId);
    if (!order) {
      throw new BadRequestException('Order not found');
    }

    if (order.userId !== userId) {
      throw new BadRequestException('Order does not belong to user');
    }

    // Create mock payment intent
    const paymentIntentId = `pi_mock_${uuidv4()}`;
    const clientSecret = `secret_${uuidv4()}`;

    const paymentIntent = {
      id: paymentIntentId,
      orderId: dto.orderId,
      amount: dto.amount,
      currency: dto.currency,
      status: 'requires_payment_method',
      clientSecret,
      createdAt: new Date(),
    };

    this.paymentIntents.set(paymentIntentId, paymentIntent);

    return {
      paymentIntentId,
      clientSecret,
      status: paymentIntent.status,
    };
  }

  async confirmPayment(userId: string, dto: ConfirmPaymentDto) {
    this.logger.log(`Confirming mock payment for user ${userId}`);

    const paymentIntent = this.paymentIntents.get(dto.paymentIntentId);
    
    if (!paymentIntent) {
      throw new BadRequestException('Payment intent not found');
    }

    // Mock payment processing
    // In a real scenario, this would integrate with Stripe, PayPal, etc.
    const success = Math.random() > 0.1; // 90% success rate for testing

    if (success) {
      paymentIntent.status = 'succeeded';
      paymentIntent.paymentMethodToken = dto.paymentMethodToken;
      
      // Update order payment status
      await this.ordersRepository.updatePaymentStatus(
        paymentIntent.orderId,
        'paid',
        dto.paymentIntentId,
      );

      // Update order status to confirmed
      await this.ordersRepository.updateOrderStatus(
        paymentIntent.orderId,
        'confirmed',
      );

      // Add tracking
      await this.ordersRepository.addOrderTracking({
        orderId: paymentIntent.orderId,
        status: 'confirmed',
        notes: 'Payment confirmed, order is being prepared',
      });

      return {
        success: true,
        paymentIntentId: dto.paymentIntentId,
        status: 'succeeded',
        message: 'Payment successful',
      };
    } else {
      paymentIntent.status = 'failed';
      
      // Update order payment status
      await this.ordersRepository.updatePaymentStatus(
        paymentIntent.orderId,
        'failed',
        dto.paymentIntentId,
      );

      return {
        success: false,
        paymentIntentId: dto.paymentIntentId,
        status: 'failed',
        message: 'Payment failed - insufficient funds',
      };
    }
  }

  async handleWebhook(payload: WebhookPayload) {
    this.logger.log('Handling mock payment webhook');

    // Mock webhook handler
    // In a real scenario, this would verify webhook signatures
    // and handle various payment events
    
    const { eventType, data } = payload;

    switch (eventType) {
      case 'payment_intent.succeeded':
        this.logger.log(`Payment succeeded: ${data.paymentIntentId}`);
        break;
      
      case 'payment_intent.payment_failed':
        this.logger.log(`Payment failed: ${data.paymentIntentId}`);
        break;
      
      case 'payment_intent.canceled':
        this.logger.log(`Payment canceled: ${data.paymentIntentId}`);
        break;
      
      default:
        this.logger.warn(`Unhandled event type: ${eventType}`);
    }

    return { received: true };
  }

  async simulatePaymentError(type: 'declined' | 'timeout' | '3d_secure') {
    this.logger.log(`Simulating payment error: ${type}`);

    const errors = {
      declined: {
        code: 'card_declined',
        message: 'Your card was declined',
      },
      timeout: {
        code: 'payment_timeout',
        message: 'Payment request timed out',
      },
      '3d_secure': {
        code: '3d_secure_required',
        message: '3D Secure authentication required',
        nextAction: {
          type: 'redirect_to_url',
          url: 'https://example.com/3ds-auth',
        },
      },
    };

    return errors[type];
  }
}
