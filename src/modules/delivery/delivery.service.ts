import {
  Injectable,
  Logger,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { DeliveryRepository } from './delivery.repository';
import { OrdersRepository } from '../orders/orders.repository';

@Injectable()
export class DeliveryService {
  private readonly logger = new Logger(DeliveryService.name);

  // Mock driver data for demonstration
  private readonly mockDrivers = [
    {
      id: 'driver_1',
      name: 'Jean Dupont',
      phone: '+33 6 12 34 56 78',
      photo: 'https://i.pravatar.cc/150?u=driver1',
      vehicleType: 'scooter',
      rating: 4.8,
    },
    {
      id: 'driver_2',
      name: 'Marie Martin',
      phone: '+33 6 98 76 54 32',
      photo: 'https://i.pravatar.cc/150?u=driver2',
      vehicleType: 'bike',
      rating: 4.9,
    },
    {
      id: 'driver_3',
      name: 'Pierre Bernard',
      phone: '+33 6 55 44 33 22',
      photo: 'https://i.pravatar.cc/150?u=driver3',
      vehicleType: 'car',
      rating: 4.7,
    },
  ];

  constructor(
    private readonly deliveryRepository: DeliveryRepository,
    private readonly ordersRepository: OrdersRepository,
  ) {}

  async getDeliveryTracking(userId: string, orderId: string) {
    // Verify order belongs to user
    const order = await this.ordersRepository.findOrderByIdAndUserId(orderId, userId);
    
    if (!order) {
      throw new NotFoundException('Order not found');
    }

    // Get or create delivery tracking
    let delivery = await this.deliveryRepository.findDeliveryByOrderId(orderId);
    
    if (!delivery) {
      // Create delivery tracking if it doesn't exist
      const orderWithAddress = await this.deliveryRepository.getOrderWithAddress(orderId);
      
      // Select a random mock driver
      const mockDriver = this.mockDrivers[Math.floor(Math.random() * this.mockDrivers.length)];
      
      delivery = await this.deliveryRepository.createDeliveryTracking({
        orderId,
        driverId: mockDriver.id,
        status: order.status === 'pending' ? 'preparing' : order.status,
        estimatedTimeMinutes: 30,
        destinationLatitude: orderWithAddress?.address?.latitude ? Number(orderWithAddress.address.latitude) : undefined,
        destinationLongitude: orderWithAddress?.address?.longitude ? Number(orderWithAddress.address.longitude) : undefined,
        destinationAddress: orderWithAddress?.address ? 
          `${orderWithAddress.address.streetAddress}, ${orderWithAddress.address.city}` : 
          'Address not available',
        shopLatitude: 48.8566,
        shopLongitude: 2.3522,
        shopAddress: '123 Rue de Rivoli, 75001 Paris',
      });
    }

    // Get driver info (mock or from database)
    const driver = this.mockDrivers.find(d => d.id === delivery.driverId) || this.mockDrivers[0];

    // Get order tracking history
    const trackingHistory = await this.deliveryRepository.getOrderTracking(orderId);

    // Mock current location based on delivery status
    const currentLocation = this.getMockCurrentLocation(delivery.status, delivery);

    // Build timeline from order tracking
    const timeline = trackingHistory.map(t => ({
      id: t.id,
      status: t.status,
      timestamp: t.createdAt.toISOString(),
      description: this.getStatusDescription(t.status),
      location: t.location || undefined,
    }));

    return {
      tracking: {
        id: delivery.id,
        orderId: delivery.orderId,
        status: delivery.status,
        estimatedTimeMinutes: delivery.estimatedTimeMinutes || 30,
        driver: {
          id: driver.id,
          name: driver.name,
          phone: driver.phone,
          photo: driver.photo,
          vehicleType: driver.vehicleType as 'bike' | 'scooter' | 'car',
          rating: driver.rating,
        },
        currentLocation: currentLocation,
        destination: {
          coordinates: {
            latitude: Number(delivery.destinationLatitude) || 48.8566,
            longitude: Number(delivery.destinationLongitude) || 2.3522,
          },
          address: delivery.destinationAddress || 'Destination address',
          landmark: delivery.destinationLandmark || undefined,
        },
        shopLocation: {
          coordinates: {
            latitude: Number(delivery.shopLatitude) || 48.8566,
            longitude: Number(delivery.shopLongitude) || 2.3522,
          },
          address: delivery.shopAddress || 'Shop address',
          landmark: delivery.shopLandmark || undefined,
        },
        timeline,
        canCall: delivery.canCall ?? true,
        canMessage: delivery.canMessage ?? true,
        lastUpdated: delivery.updatedAt.toISOString(),
      },
    };
  }

  async getStatusUpdates(userId: string, orderId: string) {
    // Verify order belongs to user
    const order = await this.ordersRepository.findOrderByIdAndUserId(orderId, userId);
    
    if (!order) {
      throw new NotFoundException('Order not found');
    }

    const delivery = await this.deliveryRepository.findDeliveryByOrderId(orderId);
    
    if (!delivery) {
      return {
        success: true,
        data: {
          orderId,
          status: order.status,
          estimatedTimeMinutes: 30,
          currentLocation: null,
          lastUpdated: new Date().toISOString(),
        },
      };
    }

    const currentLocation = this.getMockCurrentLocation(delivery.status, delivery);

    return {
      success: true,
      data: {
        orderId,
        status: delivery.status,
        estimatedTimeMinutes: delivery.estimatedTimeMinutes || 30,
        currentLocation: currentLocation ? {
          coordinates: currentLocation.coordinates,
          address: currentLocation.address,
        } : null,
        lastUpdated: delivery.updatedAt.toISOString(),
      },
    };
  }

  async callDriver(userId: string, orderId: string) {
    // Verify order belongs to user
    const order = await this.ordersRepository.findOrderByIdAndUserId(orderId, userId);
    
    if (!order) {
      throw new NotFoundException('Order not found');
    }

    const delivery = await this.deliveryRepository.findDeliveryByOrderId(orderId);
    
    if (!delivery) {
      throw new BadRequestException('Delivery not assigned yet');
    }

    if (!delivery.canCall) {
      throw new BadRequestException('Driver is not available for calls at this time');
    }

    this.logger.log(`Call initiated to driver for order ${orderId}`);

    // In a real scenario, this would initiate a call via Twilio or similar service
    return {
      success: true,
      message: 'Call initiated to driver',
    };
  }

  async sendMessage(userId: string, orderId: string, message: string) {
    // Verify order belongs to user
    const order = await this.ordersRepository.findOrderByIdAndUserId(orderId, userId);
    
    if (!order) {
      throw new NotFoundException('Order not found');
    }

    const delivery = await this.deliveryRepository.findDeliveryByOrderId(orderId);
    
    if (!delivery) {
      throw new BadRequestException('Delivery not assigned yet');
    }

    if (!delivery.canMessage) {
      throw new BadRequestException('Driver is not available for messages at this time');
    }

    // Save customer message
    await this.deliveryRepository.addDeliveryMessage(delivery.id, message, false);

    // Mock driver auto-response
    const autoResponses = [
      'Thank you for your message. I will arrive soon!',
      'Received! I\'m on my way.',
      'Noted. See you in a few minutes.',
      'Acknowledged. Almost there!',
    ];
    
    const driverResponse = autoResponses[Math.floor(Math.random() * autoResponses.length)];
    
    // Simulate delay and add driver response
    setTimeout(async () => {
      await this.deliveryRepository.addDeliveryMessage(delivery.id, driverResponse, true);
    }, 2000);

    return {
      success: true,
      response: driverResponse,
    };
  }

  async markReceived(userId: string, orderId: string) {
    // Verify order belongs to user
    const order = await this.ordersRepository.findOrderByIdAndUserId(orderId, userId);
    
    if (!order) {
      throw new NotFoundException('Order not found');
    }

    const delivery = await this.deliveryRepository.findDeliveryByOrderId(orderId);
    
    if (!delivery) {
      throw new BadRequestException('Delivery not found');
    }

    if (delivery.status !== 'nearby' && delivery.status !== 'on_the_way') {
      throw new BadRequestException('Order is not ready to be marked as received');
    }

    // Update delivery status to delivered
    await this.deliveryRepository.updateDeliveryStatus(delivery.id, 'delivered', 0);

    // Update order status to delivered
    await this.ordersRepository.updateOrderStatus(orderId, 'delivered');

    // Add tracking
    await this.ordersRepository.addOrderTracking({
      orderId,
      status: 'delivered',
      notes: 'Order marked as received by customer',
    });

    return {
      success: true,
      message: 'Order marked as received',
    };
  }

  private getMockCurrentLocation(status: string, delivery: any) {
    // Return mock location based on status
    const destinations = {
      latitude: Number(delivery.destinationLatitude) || 48.8566,
      longitude: Number(delivery.destinationLongitude) || 2.3522,
    };

    const shop = {
      latitude: Number(delivery.shopLatitude) || 48.8566,
      longitude: Number(delivery.shopLongitude) || 2.3522,
    };

    switch (status) {
      case 'preparing':
      case 'ready':
        return {
          coordinates: shop,
          address: delivery.shopAddress || 'At shop',
        };
      
      case 'picked_up':
        // Slightly away from shop
        return {
          coordinates: {
            latitude: shop.latitude + 0.001,
            longitude: shop.longitude + 0.001,
          },
          address: 'Left the shop',
        };
      
      case 'on_the_way':
        // Midway between shop and destination
        return {
          coordinates: {
            latitude: (shop.latitude + destinations.latitude) / 2,
            longitude: (shop.longitude + destinations.longitude) / 2,
          },
          address: 'En route',
        };
      
      case 'nearby':
        // Close to destination
        return {
          coordinates: {
            latitude: destinations.latitude - 0.001,
            longitude: destinations.longitude - 0.001,
          },
          address: 'Nearby your location',
        };
      
      case 'delivered':
        return {
          coordinates: destinations,
          address: delivery.destinationAddress || 'Delivered',
        };
      
      default:
        return null;
    }
  }

  private getStatusDescription(status: string): string {
    const descriptions: Record<string, string> = {
      pending: 'Order placed',
      confirmed: 'Order confirmed by merchant',
      preparing: 'Order is being prepared',
      ready: 'Order ready for pickup',
      picked_up: 'Driver picked up the order',
      on_the_way: 'Driver is on the way',
      nearby: 'Driver is nearby',
      delivered: 'Order delivered',
      cancelled: 'Order cancelled',
      failed: 'Delivery failed',
      returned: 'Order returned',
      return_requested: 'Return requested',
    };

    return descriptions[status] || status;
  }
}
