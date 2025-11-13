import {
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { UserPaymentMethodsRepository } from './user-payment-methods.repository';
import { CreatePaymentMethodDto } from './dtos/create-payment-method.dto';

@Injectable()
export class UserPaymentMethodsService {
  private readonly logger = new Logger(UserPaymentMethodsService.name);

  constructor(private readonly paymentMethodsRepository: UserPaymentMethodsRepository) {}

  private formatPaymentMethod(pm: any) {
    return {
      ...pm,
      token: pm.token ? '***' : undefined, // Mask the token
      createdAt: pm.createdAt.toISOString(),
      updatedAt: pm.updatedAt.toISOString(),
    };
  }

  async getPaymentMethods(userId: string) {
    const paymentMethods = await this.paymentMethodsRepository.findByUserId(userId);
    
    // Don't expose full token in response and ensure proper formatting
    const formattedPaymentMethods = paymentMethods.map(pm => this.formatPaymentMethod(pm));
    
    return { paymentMethods: formattedPaymentMethods };
  }

  async createPaymentMethod(userId: string, dto: CreatePaymentMethodDto) {
    // In a real scenario, this would tokenize the payment method with Stripe/PayPal
    const paymentMethod = await this.paymentMethodsRepository.create(userId, dto);
    
    // Don't expose full token in response
    return this.formatPaymentMethod(paymentMethod);
  }

  async deletePaymentMethod(userId: string, paymentMethodId: string) {
    const paymentMethod = await this.paymentMethodsRepository.findByIdAndUserId(paymentMethodId, userId);
    
    if (!paymentMethod) {
      throw new NotFoundException('Payment method not found');
    }

    await this.paymentMethodsRepository.delete(paymentMethodId);
    return { message: 'Payment method deleted successfully' };
  }

  async setDefaultPaymentMethod(userId: string, paymentMethodId: string) {
    const paymentMethod = await this.paymentMethodsRepository.findByIdAndUserId(paymentMethodId, userId);
    
    if (!paymentMethod) {
      throw new NotFoundException('Payment method not found');
    }

    const updatedPaymentMethod = await this.paymentMethodsRepository.setDefault(userId, paymentMethodId);
    
    // Don't expose full token in response
    return this.formatPaymentMethod(updatedPaymentMethod);
  }
}
