import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Req,
} from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { CartService } from './cart.service';
import { AddCartItemDto } from './dtos/add-cart-item.dto';
import { UpdateCartItemDto } from './dtos/update-cart-item.dto';
import { SelectAllDto } from './dtos/select-all.dto';
import { EstimateShippingDto } from './dtos/estimate-shipping.dto';
import { auth } from '../auth/auth.service';

@ApiTags('cart')
@Controller('cart')
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @Get()
  @ApiOperation({ summary: 'Get user cart' })
  @ApiResponse({
    status: 200,
    description: 'Cart retrieved successfully',
  })
  async getCart(@Req() req: any) {
    // TODO: Add authentication guard - currently using guest fallback for development
    const userId = req.user?.id || 'guest';
    return this.cartService.getCart(userId);
  }

  @Post('items')
  @ApiOperation({ summary: 'Add item to cart' })
  @ApiResponse({
    status: 201,
    description: 'Item added to cart successfully',
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - insufficient stock',
  })
  @ApiResponse({
    status: 404,
    description: 'Product not found',
  })
  async addItem(@Req() req: any, @Body() dto: AddCartItemDto) {
    const userId = req.user?.id || 'guest'; // TODO: Get from auth
    return this.cartService.addItem(userId, dto);
  }

  @Put('items/:itemId')
  @ApiOperation({ summary: 'Update cart item quantity or selection' })
  @ApiResponse({
    status: 200,
    description: 'Item updated successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Cart item not found',
  })
  async updateItem(
    @Req() req: any,
    @Param('itemId') itemId: string,
    @Body() dto: UpdateCartItemDto,
  ) {
    const userId = req.user?.id || 'guest'; // TODO: Get from auth
    return this.cartService.updateItem(userId, itemId, dto);
  }

  @Delete('items/:itemId')
  @ApiOperation({ summary: 'Remove item from cart' })
  @ApiResponse({
    status: 200,
    description: 'Item removed successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Cart item not found',
  })
  async removeItem(@Req() req: any, @Param('itemId') itemId: string) {
    const userId = req.user?.id || 'guest'; // TODO: Get from auth
    return this.cartService.removeItem(userId, itemId);
  }

  @Delete()
  @ApiOperation({ summary: 'Clear cart' })
  @ApiResponse({
    status: 200,
    description: 'Cart cleared successfully',
  })
  async clearCart(@Req() req: any) {
    const userId = req.user?.id;
    return this.cartService.clearCart(userId);
  }

  @Put('select-all')
  @ApiOperation({ summary: 'Select or deselect all items' })
  @ApiResponse({
    status: 200,
    description: 'Selection updated successfully',
  })
  async selectAll(@Req() req: any, @Body() dto: SelectAllDto) {
    const sessionResult = await auth.api.getSession({ headers: req.headers });
    return this.cartService.selectAll(sessionResult.user.id, dto.isSelected);
  }

  @Post('estimate-shipping')
  @ApiOperation({ summary: 'Estimate shipping cost' })
  @ApiResponse({
    status: 200,
    description: 'Shipping estimated successfully',
  })
  async estimateShipping(@Req() req: any, @Body() dto: EstimateShippingDto) {
    const sessionResult = await auth.api.getSession({ headers: req.headers });
    const userId = sessionResult.user.id;
    return this.cartService.estimateShipping(userId, dto.addressId);
  }

  @Post('save')
  @ApiOperation({ summary: 'Save cart for later' })
  @ApiResponse({
    status: 200,
    description: 'Cart saved successfully',
  })
  async saveCart(@Req() req: any) {
    const sessionResult = await auth.api.getSession({ headers: req.headers });
    const userId = sessionResult.user.id;
    return this.cartService.saveCart(userId);
  }

  @Get('saved')
  @ApiOperation({ summary: 'Get saved carts' })
  @ApiResponse({
    status: 200,
    description: 'Saved carts retrieved successfully',
  })
  async getSavedCarts(@Req() req: any) {
    const sessionResult = await auth.api.getSession({ headers: req.headers });
    const userId = sessionResult.user.id;
    return this.cartService.getSavedCarts(userId);
  }

  @Get('validate-stock')
  @ApiOperation({ summary: 'Validate cart items stock' })
  @ApiResponse({
    status: 200,
    description: 'Stock validation completed',
  })
  async validateStock(@Req() req: any) {
    const sessionResult = await auth.api.getSession({ headers: req.headers });
    const userId = sessionResult.user.id; 
    return this.cartService.validateCartStock(userId);
  }
}
