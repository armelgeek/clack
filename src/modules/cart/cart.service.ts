import {
  Injectable,
  Logger,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { CartRepository } from './cart.repository';
import { AddCartItemDto } from './dtos/add-cart-item.dto';
import { UpdateCartItemDto } from './dtos/update-cart-item.dto';
import { ProductRepository } from '../product/product.repository';

@Injectable()
export class CartService {
  private readonly logger = new Logger(CartService.name);

  constructor(
    private readonly cartRepository: CartRepository,
    private readonly productRepository: ProductRepository,
  ) {}

  async getCart(userId: string) {
    const cart = await this.cartRepository.getOrCreateCart(userId);
    const cartWithDetails = await this.cartRepository.getCartWithDetails(cart.id);

    // Calculate totals
    let subtotal = 0;
    let itemCount = 0;

    if (cartWithDetails.items) {
      cartWithDetails.items.forEach((item: any) => {
        if (item.isSelected && item.product) {
          subtotal += Number(item.product.priceTTC) * Number(item.quantity);
          itemCount += Number(item.quantity);
        }
      });
    }

    return {
      ...cartWithDetails,
      subtotal,
      itemCount,
    };
  }

  async addItem(userId: string, dto: AddCartItemDto) {
    // Verify product exists and has stock
    const product = await this.productRepository.findByIdAndStore(
      dto.productId,
      dto.storeId,
    );

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    if (Number(product.quantity) < dto.quantity) {
      throw new BadRequestException('Insufficient stock available');
    }

    // Get or create cart
    const cart = await this.cartRepository.getOrCreateCart(userId);

    // Check if item already exists in cart
    const existingItem = await this.cartRepository.findCartItemByProductAndStore(
      cart.id,
      dto.productId,
      dto.storeId,
    );

    if (existingItem) {
      // Update quantity
      const newQuantity = Number(existingItem.quantity) + dto.quantity;
      
      if (Number(product.quantity) < newQuantity) {
        throw new BadRequestException('Insufficient stock for requested quantity');
      }

      const updatedItem = await this.cartRepository.updateCartItem(
        existingItem.id,
        newQuantity,
      );
      return updatedItem;
    } else {
      // Add new item
      const item = await this.cartRepository.addItemToCart(
        cart.id,
        dto.productId,
        dto.storeId,
        dto.quantity,
      );
      return item;
    }
  }

  async updateItem(userId: string, itemId: string, dto: UpdateCartItemDto) {
    // Verify cart item exists and belongs to user
    const cartItem = await this.cartRepository.getCartItemById(itemId);
    if (!cartItem) {
      throw new NotFoundException('Cart item not found');
    }

    const cart = await this.cartRepository.findActiveCartByUserId(userId);
    if (!cart || cart.id !== cartItem.cartId) {
      throw new NotFoundException('Cart item not found');
    }

    // Verify stock if updating quantity
    if (dto.quantity) {
      const product = await this.productRepository.findByIdAndStore(
        cartItem.productId,
        cartItem.storeId,
      );

      if (!product) {
        throw new NotFoundException('Product not found');
      }

      if (Number(product.quantity) < dto.quantity) {
        throw new BadRequestException('Insufficient stock available');
      }
    }

    const updatedItem = await this.cartRepository.updateCartItem(
      itemId,
      dto.quantity,
      dto.isSelected,
    );

    return updatedItem;
  }

  async removeItem(userId: string, itemId: string) {
    // Verify cart item exists and belongs to user
    const cartItem = await this.cartRepository.getCartItemById(itemId);
    if (!cartItem) {
      throw new NotFoundException('Cart item not found');
    }

    const cart = await this.cartRepository.findActiveCartByUserId(userId);
    if (!cart || cart.id !== cartItem.cartId) {
      throw new NotFoundException('Cart item not found');
    }

    await this.cartRepository.deleteCartItem(itemId);
    return { message: 'Item removed from cart' };
  }

  async clearCart(userId: string) {
    const cart = await this.cartRepository.findActiveCartByUserId(userId);
    if (!cart) {
      throw new NotFoundException('Cart not found');
    }

    await this.cartRepository.clearCart(cart.id);
    return { message: 'Cart cleared successfully' };
  }

  async selectAll(userId: string, isSelected: boolean) {
    const cart = await this.cartRepository.findActiveCartByUserId(userId);
    if (!cart) {
      throw new NotFoundException('Cart not found');
    }

    await this.cartRepository.selectAllItems(cart.id, isSelected);
    return { message: 'Selection updated successfully' };
  }

  async saveCart(userId: string) {
    const cart = await this.cartRepository.findActiveCartByUserId(userId);
    if (!cart) {
      throw new NotFoundException('Cart not found');
    }

    const savedCart = await this.cartRepository.saveCart(cart.id);
    
    // Create a new active cart for the user
    await this.cartRepository.createCart(userId);

    return savedCart;
  }

  async getSavedCarts(userId: string) {
    const savedCarts = await this.cartRepository.findSavedCartsByUserId(userId);
    
    // Get details for each saved cart
    const cartsWithDetails = await Promise.all(
      savedCarts.map(async (cart) => {
        return await this.cartRepository.getCartWithDetails(cart.id);
      }),
    );

    return cartsWithDetails;
  }

  async estimateShipping(userId: string, addressId: string) {
    const cart = await this.cartRepository.findActiveCartByUserId(userId);
    if (!cart) {
      throw new NotFoundException('Cart not found');
    }

    // Mock shipping estimation
    // In a real scenario, this would integrate with a shipping provider
    const mockShippingCost = 5.99;
    const mockEstimatedDeliveryTime = '2-3 business days';

    return {
      addressId,
      shippingCost: mockShippingCost,
      estimatedDeliveryTime: mockEstimatedDeliveryTime,
      currency: 'EUR',
    };
  }

  async validateCartStock(userId: string) {
    const cart = await this.cartRepository.getOrCreateCart(userId);
    const cartWithDetails = await this.cartRepository.getCartWithDetails(cart.id);

    const outOfStock: any[] = [];
    const insufficientStock: any[] = [];

    if (cartWithDetails.items) {
      for (const item of cartWithDetails.items as any[]) {
        if (item.product) {
          const productQuantity = Number(item.product.quantity);
          const cartQuantity = Number(item.quantity);

          if (productQuantity === 0) {
            outOfStock.push({
              itemId: item.id,
              productId: item.productId,
              productName: item.product.name,
            });
          } else if (productQuantity < cartQuantity) {
            insufficientStock.push({
              itemId: item.id,
              productId: item.productId,
              productName: item.product.name,
              available: productQuantity,
              requested: cartQuantity,
            });
          }
        }
      }
    }

    return {
      valid: outOfStock.length === 0 && insufficientStock.length === 0,
      outOfStock,
      insufficientStock,
    };
  }
}
