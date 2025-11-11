import { db } from '@/database/connection';
import { Injectable } from '@nestjs/common';
import { eq, and, desc, sql } from 'drizzle-orm';
import { orders, orderItems, orderTracking, orderRatings } from '@/database';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class OrdersRepository {
  async createOrder(orderData: {
    userId: string;
    addressId: string;
    paymentMethodId: string;
    subtotal: number;
    shippingCost: number;
    tax: number;
    total: number;
    notes?: string;
  }) {
    const orderId = uuidv4();
    const [order] = await db
      .insert(orders)
      .values({
        id: orderId,
        ...orderData,
        status: 'pending',
        paymentStatus: 'pending',
      })
      .returning();
    return order;
  }

  async createOrderItems(items: Array<{
    orderId: string;
    productId: string;
    storeId: string;
    name: string;
    priceHT: number;
    priceTTC: number;
    quantity: number;
  }>) {
    const itemsWithIds = items.map(item => ({
      ...item,
      id: uuidv4(),
    }));
    
    const createdItems = await db
      .insert(orderItems)
      .values(itemsWithIds)
      .returning();
    
    return createdItems;
  }

  async findOrderById(orderId: string) {
    const order = await db.query.orders.findFirst({
      where: eq(orders.id, orderId),
      with: {
        items: true,
        address: true,
        paymentMethod: true,
        tracking: {
          orderBy: desc(orderTracking.createdAt),
        },
        rating: true,
      },
    });
    return order;
  }

  async findOrdersByUserId(userId: string, page: number = 1, limit: number = 10) {
    const offset = (page - 1) * limit;

    const userOrders = await db.query.orders.findMany({
      where: eq(orders.userId, userId),
      orderBy: desc(orders.createdAt),
      limit,
      offset,
      with: {
        items: true,
        address: true,
      },
    });

    const [{ count }] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(orders)
      .where(eq(orders.userId, userId));

    return {
      orders: userOrders,
      total: count,
      page,
      limit,
      totalPages: Math.ceil(count / limit),
    };
  }

  async updateOrderStatus(orderId: string, status: string) {
    const [order] = await db
      .update(orders)
      .set({ status, updatedAt: new Date() })
      .where(eq(orders.id, orderId))
      .returning();
    return order;
  }

  async updatePaymentStatus(orderId: string, paymentStatus: string, paymentIntentId?: string) {
    const updates: any = {
      paymentStatus,
      updatedAt: new Date(),
    };
    
    if (paymentIntentId) {
      updates.paymentIntentId = paymentIntentId;
    }

    const [order] = await db
      .update(orders)
      .set(updates)
      .where(eq(orders.id, orderId))
      .returning();
    return order;
  }

  async addOrderTracking(trackingData: {
    orderId: string;
    status: string;
    location?: string;
    latitude?: number;
    longitude?: number;
    notes?: string;
  }) {
    const trackingId = uuidv4();
    const [tracking] = await db
      .insert(orderTracking)
      .values({
        id: trackingId,
        orderId: trackingData.orderId,
        status: trackingData.status,
        location: trackingData.location,
        latitude: trackingData.latitude?.toString(),
        longitude: trackingData.longitude?.toString(),
        notes: trackingData.notes,
      })
      .returning();
    return tracking;
  }

  async getOrderTracking(orderId: string) {
    const tracking = await db.query.orderTracking.findMany({
      where: eq(orderTracking.orderId, orderId),
      orderBy: desc(orderTracking.createdAt),
    });
    return tracking;
  }

  async addOrderRating(orderId: string, rating: number, comment?: string) {
    const ratingId = uuidv4();
    const [orderRating] = await db
      .insert(orderRatings)
      .values({
        id: ratingId,
        orderId,
        rating,
        comment,
      })
      .returning();
    return orderRating;
  }

  async getOrderStatistics(userId: string) {
    const [stats] = await db
      .select({
        totalOrders: sql<number>`count(*)::int`,
        totalSpent: sql<number>`COALESCE(sum(${orders.total}), 0)::numeric`,
        averageOrderValue: sql<number>`COALESCE(avg(${orders.total}), 0)::numeric`,
      })
      .from(orders)
      .where(eq(orders.userId, userId));

    return stats;
  }

  async findOrderByIdAndUserId(orderId: string, userId: string) {
    const order = await db.query.orders.findFirst({
      where: and(eq(orders.id, orderId), eq(orders.userId, userId)),
      with: {
        items: true,
        address: true,
        paymentMethod: true,
        tracking: {
          orderBy: desc(orderTracking.createdAt),
        },
        rating: true,
      },
    });
    return order;
  }
}
