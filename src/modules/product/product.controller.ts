import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import { ProductService } from './product.service';
import { TProduct } from 'types/product';
import { PaginatedResponse } from 'types/common/pagination';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import {
  PaginatedProductsResponseDto,
  ProductResponseDto,
} from '@/common/dto/response.dto';
import { SearchDto } from '@/common/dto/pagination.dto';
import { CreateProductDto } from './dtos/create-product.dto';
import { FormDataRequest } from 'nestjs-form-data';
import { UpdateProductStatusDto } from './dtos/update-product-status.dto';
import { UpdateProductDto } from './dtos/update-product.dto';

@ApiTags('products')
@Controller('products')
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  @Post()
  @FormDataRequest()
  @ApiOperation({
    summary: 'Create product',
  })
  @ApiResponse({
    status: 200,
    description: 'Product created successfully',
  })
  @ApiResponse({
    status: 500,
    description: 'Error while creating product',
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request',
  })
  async createProduct(@Body() dto: CreateProductDto): Promise<TProduct> {
    return await this.productService.createProduct(dto);
  }

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
      query.category,
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

  @Get(':productId/details')
  @ApiOperation({ summary: 'Get product by id' })
  @ApiResponse({
    status: 200,
    description: 'Product fetched successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Product not found',
    type: null,
  })
  @ApiResponse({
    status: 500,
    description: 'Error while fetching product',
  })
  getProductDetailsById(
    @Param('productId') productId: string,
  ): Promise<TProduct> {
    return this.productService.getProductDetailsById(productId);
  }

  @Get(':id/similar')
  @ApiOperation({ summary: 'Get similar products' })
  @ApiResponse({
    status: 200,
    description: 'Similar products fetched successfully',
    type: [ProductResponseDto],
  })
  @ApiResponse({
    status: 404,
    description: 'Product not found',
  })
  @ApiResponse({
    status: 500,
    description: 'Error while fetching similar products',
  })
  getSimilar(@Param('id') id: string): Promise<TProduct[]> {
    return this.productService.getSimilarProducts(id);
  }

  @Put(':productId/status')
  @FormDataRequest()
  @ApiOperation({ summary: 'Update product status' })
  @ApiResponse({
    status: 200,
    description: 'Product status updated successfully',
  })
  @ApiResponse({
    status: 500,
    description: `Error while updating product status`,
  })
  async updateProductStatus(
    @Param('productId') productId: string,
    @Body() dto: UpdateProductStatusDto,
  ) {
    return this.productService.updateProductStatus(productId, dto.status);
  }

  @Put(':productId')
  @FormDataRequest()
  @ApiOperation({ summary: 'Update product' })
  @ApiResponse({
    status: 200,
    description: 'Product updated successfully',
  })
  @ApiResponse({
    status: 500,
    description: `Error while updating product`,
  })
  async updateProduct(
    @Param('productId') productId: string,
    @Body() dto: UpdateProductDto,
  ): Promise<{
    images: {
      id: string;
      productId: string;
      storeId: string;
      url: string;
      filename: string;
      objectKey: string;
    }[];
    description: string;
    id: string;
    name: string;
    createdAt: Date;
    updatedAt: Date;
    status: string;
    deletedAt: Date;
    storeId: string;
    category: string;
    priceHT: number;
    priceTTC: number;
    vat: string;
    quantity: number;
    owner: string;
  }> {
    return this.productService.updateProduct(productId, dto);
  }

  @Delete(':productId')
  @ApiOperation({ summary: 'Delete product' })
  @ApiResponse({
    status: 200,
    description: 'Product deleted successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Product not found',
    type: null,
  })
  @ApiResponse({
    status: 500,
    description: `Error while deleting product`,
  })
  async deleteProduct(@Param('productId') productId: string): Promise<{
    id: string;
    name: string;
    createdAt: Date;
    updatedAt: Date;
    status: string;
    deletedAt: Date;
    storeId: string;
    description: string;
    category: string;
    priceHT: number;
    priceTTC: number;
    vat: string;
    quantity: number;
    owner: string;
  }> {
    return this.productService.deleteProduct(productId);
  }
}
