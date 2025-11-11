import { db } from '@/database/connection';
import { Injectable } from '@nestjs/common';
import { eq, and } from 'drizzle-orm';
import { userAddresses } from '@/database';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class UserAddressesRepository {
  async findByUserId(userId: string) {
    const addresses = await db.query.userAddresses.findMany({
      where: eq(userAddresses.userId, userId),
    });
    return addresses;
  }

  async findById(addressId: string) {
    const address = await db.query.userAddresses.findFirst({
      where: eq(userAddresses.id, addressId),
    });
    return address;
  }

  async create(userId: string, addressData: any) { // Using any to accept DTO with number lat/lng which gets converted to string
    const addressId = uuidv4();
    
    // If this is set as default, unset other defaults
    if (addressData.isDefault) {
      await db
        .update(userAddresses)
        .set({ isDefault: false })
        .where(eq(userAddresses.userId, userId));
    }

    const [address] = await db
      .insert(userAddresses)
      .values({
        id: addressId,
        userId,
        ...addressData,
        latitude: addressData.latitude?.toString(),
        longitude: addressData.longitude?.toString(),
      })
      .returning();
    
    return address;
  }

  async update(addressId: string, addressData: any) { // Using any to accept DTO with number lat/lng which gets converted to string
    const updates: any = {
      ...addressData,
      updatedAt: new Date(),
    };
    
    if (addressData.latitude !== undefined) {
      updates.latitude = addressData.latitude?.toString();
    }
    if (addressData.longitude !== undefined) {
      updates.longitude = addressData.longitude?.toString();
    }

    const [address] = await db
      .update(userAddresses)
      .set(updates)
      .where(eq(userAddresses.id, addressId))
      .returning();
    
    return address;
  }

  async delete(addressId: string) {
    const [address] = await db
      .delete(userAddresses)
      .where(eq(userAddresses.id, addressId))
      .returning();
    
    return address;
  }

  async setDefault(userId: string, addressId: string) {
    // Unset all defaults for this user
    await db
      .update(userAddresses)
      .set({ isDefault: false })
      .where(eq(userAddresses.userId, userId));
    
    // Set the new default
    const [address] = await db
      .update(userAddresses)
      .set({ isDefault: true, updatedAt: new Date() })
      .where(and(eq(userAddresses.id, addressId), eq(userAddresses.userId, userId)))
      .returning();
    
    return address;
  }

  async findByIdAndUserId(addressId: string, userId: string) {
    const address = await db.query.userAddresses.findFirst({
      where: and(eq(userAddresses.id, addressId), eq(userAddresses.userId, userId)),
    });
    return address;
  }
}
