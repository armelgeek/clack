import { db } from '@/database/connection';
import { Injectable } from '@nestjs/common';
import { eq, and, sql } from 'drizzle-orm';
import { carts, cartItems, products, stores } from '@/database';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class CartRepository {
  async findActiveCartByUserId(userId: string) {
    const result = await db.query.carts.findFirst({
      where: and(eq(carts.userId, userId), eq(carts.status, 'active')),
      with: {
        items: true,
      },
    });
    return result;
  }

  async findSavedCartsByUserId(userId: string) {
    const result = await db.query.carts.findMany({
      where: and(eq(carts.userId, userId), eq(carts.status, 'saved')),
      with: {
        items: true,
      },
    });
    return result;
  }

  async createCart(userId: string) {
    const cartId = uuidv4();
    const [cart] = await db
      .insert(carts)
      .values({
        id: cartId,
        userId,
        status: 'active',
      })
      .returning();
    return cart;
  }

  async getOrCreateCart(userId: string) {
    let cart = await this.findActiveCartByUserId(userId);
    if (!cart) {
      const newCart = await this.createCart(userId);
      // Refetch with items relation
      cart = await this.findActiveCartByUserId(userId);
      if (!cart) {
        throw new Error('Failed to create cart');
      }
    }
    return cart;
  }

  async addItemToCart(
    cartId: string,
    productId: string,
    storeId: string,
    quantity: number,
  ) {
    const itemId = uuidv4();
    const [item] = await db
      .insert(cartItems)
      .values({
        id: itemId,
        cartId,
        productId,
        storeId,
        quantity,
        isSelected: true,
      })
      .returning();
    return item;
  }

  async updateCartItem(itemId: string, quantity: number, isSelected?: boolean) {
    const updates: {
      quantity: number;
      updatedAt: Date;
      isSelected?: boolean;
    } = {
      quantity,
      updatedAt: new Date(),
    };
    
    if (isSelected !== undefined) {
      updates.isSelected = isSelected;
    }

    const [item] = await db
      .update(cartItems)
      .set(updates)
      .where(eq(cartItems.id, itemId))
      .returning();
    return item;
  }

  async deleteCartItem(itemId: string) {
    const [item] = await db
      .delete(cartItems)
      .where(eq(cartItems.id, itemId))
      .returning();
    return item;
  }

  async clearCart(cartId: string) {
    await db.delete(cartItems).where(eq(cartItems.cartId, cartId));
    await db.update(carts).set({ updatedAt: new Date() }).where(eq(carts.id, cartId));
  }

  async selectAllItems(cartId: string, isSelected: boolean) {
    await db
      .update(cartItems)
      .set({ isSelected, updatedAt: new Date() })
      .where(eq(cartItems.cartId, cartId));
  }

  async saveCart(cartId: string) {
    const [cart] = await db
      .update(carts)
      .set({ status: 'saved', updatedAt: new Date() })
      .where(eq(carts.id, cartId))
      .returning();
    return cart;
  }

  async getCartWithDetails(cartId: string) {
    const cart = await db.query.carts.findFirst({
      where: eq(carts.id, cartId),
      with: {
        items: true,
      },
    });
    
    if (!cart || !cart.items || cart.items.length === 0) {
      return cart;
    }

    // Get product details for each cart item
    const itemsWithDetails = await Promise.all(
      cart.items.map(async (item) => {
        const product = await db.query.products.findFirst({
          where: and(
            eq(products.id, item.productId),
            eq(products.storeId, item.storeId),
          ),
          with: {
            images: true,
            store: true,
          },
        });

        return {
          ...item,
          product,
        };
      }),
    );

    return {
      ...cart,
      items: itemsWithDetails,
    };
  }

  async findCartItemByProductAndStore(
    cartId: string,
    productId: string,
    storeId: string,
  ) {
    const [item] = await db
      .select()
      .from(cartItems)
      .where(
        and(
          eq(cartItems.cartId, cartId),
          eq(cartItems.productId, productId),
          eq(cartItems.storeId, storeId),
        ),
      );
    return item;
  }

  async getCartItemById(itemId: string) {
    const [item] = await db
      .select()
      .from(cartItems)
      .where(eq(cartItems.id, itemId));
    return item;
  }
}
