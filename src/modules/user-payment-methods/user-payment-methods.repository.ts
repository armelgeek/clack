import { db } from '@/database/connection';
import { Injectable } from '@nestjs/common';
import { eq, and } from 'drizzle-orm';
import { userPaymentMethods } from '@/database';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class UserPaymentMethodsRepository {
  async findByUserId(userId: string) {
    const paymentMethods = await db.query.userPaymentMethods.findMany({
      where: eq(userPaymentMethods.userId, userId),
    });
    return paymentMethods;
  }

  async findById(paymentMethodId: string) {
    const paymentMethod = await db.query.userPaymentMethods.findFirst({
      where: eq(userPaymentMethods.id, paymentMethodId),
    });
    return paymentMethod;
  }

  async create(userId: string, paymentData: any) { // Using any to accept DTO and allow partial data insertion
    const paymentMethodId = uuidv4();
    
    // If this is set as default, unset other defaults
    if (paymentData.isDefault) {
      await db
        .update(userPaymentMethods)
        .set({ isDefault: false })
        .where(eq(userPaymentMethods.userId, userId));
    }

    const [paymentMethod] = await db
      .insert(userPaymentMethods)
      .values({
        id: paymentMethodId,
        userId,
        ...paymentData,
      })
      .returning();
    
    return paymentMethod;
  }

  async delete(paymentMethodId: string) {
    const [paymentMethod] = await db
      .delete(userPaymentMethods)
      .where(eq(userPaymentMethods.id, paymentMethodId))
      .returning();
    
    return paymentMethod;
  }

  async setDefault(userId: string, paymentMethodId: string) {
    // Unset all defaults for this user
    await db
      .update(userPaymentMethods)
      .set({ isDefault: false })
      .where(eq(userPaymentMethods.userId, userId));
    
    // Set the new default
    const [paymentMethod] = await db
      .update(userPaymentMethods)
      .set({ isDefault: true, updatedAt: new Date() })
      .where(and(eq(userPaymentMethods.id, paymentMethodId), eq(userPaymentMethods.userId, userId)))
      .returning();
    
    return paymentMethod;
  }

  async findByIdAndUserId(paymentMethodId: string, userId: string) {
    const paymentMethod = await db.query.userPaymentMethods.findFirst({
      where: and(eq(userPaymentMethods.id, paymentMethodId), eq(userPaymentMethods.userId, userId)),
    });
    return paymentMethod;
  }
}
