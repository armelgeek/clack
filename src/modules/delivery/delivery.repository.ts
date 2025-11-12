import { Injectable } from '@nestjs/common';
import { db } from '../../database';
import {
  deliveryTracking,
  deliveryDrivers,
  deliveryMessages,
  orderTracking,
  orders,
  userAddresses,
} from '../../database/schema';
import { eq, and, desc } from 'drizzle-orm';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class DeliveryRepository {
  async findDeliveryByOrderId(orderId: string) {
    const result = await db
      .select()
      .from(deliveryTracking)
      .where(eq(deliveryTracking.orderId, orderId))
      .limit(1);
    
    return result[0] || null;
  }

  async findDriverById(driverId: string) {
    const result = await db
      .select()
      .from(deliveryDrivers)
      .where(eq(deliveryDrivers.id, driverId))
      .limit(1);
    
    return result[0] || null;
  }

  async createDeliveryTracking(data: {
    orderId: string;
    driverId?: string;
    status: string;
    estimatedTimeMinutes?: number;
    destinationLatitude?: number;
    destinationLongitude?: number;
    destinationAddress?: string;
    shopLatitude?: number;
    shopLongitude?: number;
    shopAddress?: string;
  }) {
    const id = uuidv4();
    const result = await db
      .insert(deliveryTracking)
      .values({
        id,
        ...data,
      })
      .returning();
    
    return result[0];
  }

  async updateDeliveryLocation(
    deliveryId: string,
    latitude: number,
    longitude: number,
    address: string,
  ) {
    const result = await db
      .update(deliveryTracking)
      .set({
        currentLatitude: latitude,
        currentLongitude: longitude,
        currentAddress: address,
        updatedAt: new Date(),
      })
      .where(eq(deliveryTracking.id, deliveryId))
      .returning();
    
    return result[0];
  }

  async updateDeliveryStatus(deliveryId: string, status: string, estimatedTimeMinutes?: number) {
    const updateData: any = {
      status,
      updatedAt: new Date(),
    };

    if (estimatedTimeMinutes !== undefined) {
      updateData.estimatedTimeMinutes = estimatedTimeMinutes;
    }

    const result = await db
      .update(deliveryTracking)
      .set(updateData)
      .where(eq(deliveryTracking.id, deliveryId))
      .returning();
    
    return result[0];
  }

  async getOrderTracking(orderId: string) {
    const result = await db
      .select()
      .from(orderTracking)
      .where(eq(orderTracking.orderId, orderId))
      .orderBy(desc(orderTracking.createdAt));
    
    return result;
  }

  async addDeliveryMessage(deliveryId: string, message: string, fromDriver: boolean) {
    const id = uuidv4();
    const result = await db
      .insert(deliveryMessages)
      .values({
        id,
        deliveryTrackingId: deliveryId,
        message,
        fromDriver,
      })
      .returning();
    
    return result[0];
  }

  async getDeliveryMessages(deliveryId: string) {
    const result = await db
      .select()
      .from(deliveryMessages)
      .where(eq(deliveryMessages.deliveryTrackingId, deliveryId))
      .orderBy(desc(deliveryMessages.createdAt));
    
    return result;
  }

  async getOrderWithAddress(orderId: string) {
    const result = await db
      .select({
        order: orders,
        address: userAddresses,
      })
      .from(orders)
      .leftJoin(userAddresses, eq(orders.addressId, userAddresses.id))
      .where(eq(orders.id, orderId))
      .limit(1);
    
    return result[0] || null;
  }
}
