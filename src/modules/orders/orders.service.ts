import {
  Injectable,
  Logger,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { OrdersRepository } from './orders.repository';
import { CartRepository } from '../cart/cart.repository';
import { CreateOrderDto } from './dtos/create-order.dto';
import { RateOrderDto } from './dtos/rate-order.dto';
import { ReturnOrderDto } from './dtos/return-order.dto';

@Injectable()
export class OrdersService {
  private readonly logger = new Logger(OrdersService.name);

  constructor(
    private readonly ordersRepository: OrdersRepository,
    private readonly cartRepository: CartRepository,
  ) {}

  async createOrder(userId: string, dto: CreateOrderDto) {
    // Get cart with details
    const cart = await this.cartRepository.findActiveCartByUserId(userId);
    if (!cart) {
      throw new NotFoundException('Cart not found');
    }

    const cartWithDetails = await this.cartRepository.getCartWithDetails(cart.id);
    
    if (!cartWithDetails.items || cartWithDetails.items.length === 0) {
      throw new BadRequestException('Cart is empty');
    }

    // Calculate totals
    let subtotal = 0;
    const selectedItems: any[] = [];

    for (const item of cartWithDetails.items as any[]) {
      if (item.isSelected && item.product) {
        const itemTotal = Number(item.product.priceTTC) * Number(item.quantity);
        subtotal += itemTotal;
        selectedItems.push({
          productId: item.productId,
          storeId: item.storeId,
          name: item.product.name,
          priceHT: Number(item.product.priceHT),
          priceTTC: Number(item.product.priceTTC),
          quantity: Number(item.quantity),
        });
      }
    }

    if (selectedItems.length === 0) {
      throw new BadRequestException('No items selected in cart');
    }

    // Mock shipping calculation
    const shippingCost = 5.99;
    const tax = 0; // Tax is already included in TTC prices
    const total = subtotal + shippingCost;

    // Create order
    const order = await this.ordersRepository.createOrder({
      userId,
      addressId: dto.addressId,
      paymentMethodId: dto.paymentMethodId,
      subtotal,
      shippingCost,
      tax,
      total,
      notes: dto.notes,
    });

    // Create order items
    const orderItemsData = selectedItems.map(item => ({
      orderId: order.id,
      ...item,
    }));
    
    await this.ordersRepository.createOrderItems(orderItemsData);

    // Add initial tracking
    await this.ordersRepository.addOrderTracking({
      orderId: order.id,
      status: 'pending',
      notes: 'Order created',
    });

    // Clear selected items from cart
    // In a real scenario, we'd only remove selected items
    // For now, we'll clear the cart
    await this.cartRepository.clearCart(cart.id);

    // Fetch full order details
    const fullOrder = await this.ordersRepository.findOrderById(order.id);

    return fullOrder;
  }

  async getOrders(userId: string, page: number = 1, limit: number = 10) {
    const result = await this.ordersRepository.findOrdersByUserId(userId, page, limit);
    return result;
  }

  async getOrderById(userId: string, orderId: string) {
    const order = await this.ordersRepository.findOrderByIdAndUserId(orderId, userId);
    
    if (!order) {
      throw new NotFoundException('Order not found');
    }

    return order;
  }

  async getOrderStatistics(userId: string) {
    const stats = await this.ordersRepository.getOrderStatistics(userId);
    return stats;
  }

  async cancelOrder(userId: string, orderId: string, reason?: string) {
    const order = await this.ordersRepository.findOrderByIdAndUserId(orderId, userId);
    
    if (!order) {
      throw new NotFoundException('Order not found');
    }

    if (order.status === 'delivered' || order.status === 'cancelled') {
      throw new BadRequestException(`Cannot cancel order with status: ${order.status}`);
    }

    // Update order status
    await this.ordersRepository.updateOrderStatus(orderId, 'cancelled');

    // Add tracking
    await this.ordersRepository.addOrderTracking({
      orderId,
      status: 'cancelled',
      notes: reason || 'Order cancelled by user',
    });

    return { message: 'Order cancelled successfully' };
  }

  async returnOrder(userId: string, orderId: string, dto: ReturnOrderDto) {
    const order = await this.ordersRepository.findOrderByIdAndUserId(orderId, userId);
    
    if (!order) {
      throw new NotFoundException('Order not found');
    }

    if (order.status !== 'delivered') {
      throw new BadRequestException('Only delivered orders can be returned');
    }

    // Update order status
    await this.ordersRepository.updateOrderStatus(orderId, 'returned');

    // Add tracking
    await this.ordersRepository.addOrderTracking({
      orderId,
      status: 'return_requested',
      notes: `Return requested: ${dto.reason}`,
    });

    return { message: 'Return request submitted successfully' };
  }

  async getReturnStatus(userId: string, orderId: string) {
    const order = await this.ordersRepository.findOrderByIdAndUserId(orderId, userId);
    
    if (!order) {
      throw new NotFoundException('Order not found');
    }

    const tracking = await this.ordersRepository.getOrderTracking(orderId);
    const returnTracking = tracking.filter(t => 
      t.status === 'return_requested' || 
      t.status === 'return_approved' || 
      t.status === 'return_rejected'
    );

    return {
      orderId,
      returnStatus: order.status === 'returned' ? 'processing' : 'none',
      tracking: returnTracking,
    };
  }

  async rateOrder(userId: string, orderId: string, dto: RateOrderDto) {
    const order = await this.ordersRepository.findOrderByIdAndUserId(orderId, userId);
    
    if (!order) {
      throw new NotFoundException('Order not found');
    }

    if (order.status !== 'delivered') {
      throw new BadRequestException('Only delivered orders can be rated');
    }

    if (order.rating) {
      throw new BadRequestException('Order already rated');
    }

    const rating = await this.ordersRepository.addOrderRating(
      orderId,
      dto.rating,
      dto.comment,
    );

    return rating;
  }

  async getOrderTracking(userId: string, orderId: string) {
    const order = await this.ordersRepository.findOrderByIdAndUserId(orderId, userId);
    
    if (!order) {
      throw new NotFoundException('Order not found');
    }

    const tracking = await this.ordersRepository.getOrderTracking(orderId);

    // Mock delivery person location for demonstration
    const mockLocation = {
      latitude: 48.8566,
      longitude: 2.3522,
      estimatedArrival: '15 minutes',
    };

    return {
      orderId,
      status: order.status,
      tracking,
      currentLocation: order.status === 'delivering' ? mockLocation : null,
    };
  }

  async getOrderInvoice(userId: string, orderId: string) {
    const order = await this.ordersRepository.findOrderByIdAndUserId(orderId, userId);
    
    if (!order) {
      throw new NotFoundException('Order not found');
    }

    // In a real scenario, this would generate a PDF invoice
    // For now, return a mock URL
    return {
      orderId,
      invoiceUrl: `/invoices/${orderId}.pdf`,
      generatedAt: new Date(),
    };
  }

  async confirmDelivery(userId: string, orderId: string, confirmationData: any) {
    const order = await this.ordersRepository.findOrderByIdAndUserId(orderId, userId);
    
    if (!order) {
      throw new NotFoundException('Order not found');
    }

    if (order.status !== 'delivering') {
      throw new BadRequestException('Order is not in delivery status');
    }

    // Update order status
    await this.ordersRepository.updateOrderStatus(orderId, 'delivered');

    // Add tracking
    const trackingNotes = [
      'Delivery confirmed by customer',
      confirmationData.notes,
    ]
      .filter(Boolean)
      .join(' - ');

    await this.ordersRepository.addOrderTracking({
      orderId,
      status: 'delivered',
      notes: trackingNotes,
    });

    return {
      message: 'Delivery confirmed successfully',
      orderId,
      confirmedAt: new Date(),
    };
  }
}
