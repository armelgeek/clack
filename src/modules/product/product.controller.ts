import { Controller, Get, Param, Query } from '@nestjs/common';
import { ProductService } from './product.service';
import { TProduct } from 'types/product';
import { PaginatedResponse } from 'types/common/pagination';
import { ApiOperation, ApiResponse, ApiTags, ApiParam } from '@nestjs/swagger';
import {
  PaginatedProductsResponseDto,
  ProductResponseDto,
} from '@/common/dto/response.dto';
import { SearchDto } from '@/common/dto/pagination.dto';

@ApiTags('products')
@Controller('products')
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  @Get()
  @ApiOperation({ summary: 'Get all products with pagination and search' })
  @ApiResponse({
    status: 200,
    description: 'Products fetched successfully',
    type: PaginatedProductsResponseDto,
  })
  @ApiResponse({
    status: 500,
    description: 'Error while fetching products',
  })
  async getAll(
    @Query() query: SearchDto,
  ): Promise<PaginatedResponse<TProduct>> {
    return this.productService.getAllProducts(
      query.page || 1,
      query.limit || 10,
      query.search,
    );
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get product by id' })
  @ApiResponse({
    status: 200,
    description: 'Product fetched successfully',
    type: ProductResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Product not found',
  })
  @ApiResponse({
    status: 500,
    description: 'Error while fetching product',
  })
  getOne(@Param('id') id: string): Promise<TProduct> {
    return this.productService.getProductById(id);
  }
}
